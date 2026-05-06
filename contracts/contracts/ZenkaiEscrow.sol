// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

/**
 * @title ZenkaiEscrow
 * @dev The core state machine and fund manager for Zenkai gaming protocol.
 */
contract ZenkaiEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum MatchState { OPEN, LOCKED, PROVING, SETTLED, DISPUTED }
    enum GameType { CHESS, TRIVIA }
    enum StakeTier { PRACTICE, STANDARD, PRO, ELITE }

    struct Match {
        address p1;
        address p2;
        uint256 stakeAmount;
        GameType gameType;
        bytes32 seed;
        MatchState state;
        uint256 lastActionTime;
        uint256 disputeWindowExpiry;
        address winner;
    }

    IERC20 public cUSD;
    address public treasury;
    address public gameServer;
    address public verifier;

    // Timelock for verifier updates
    address public pendingVerifier;
    uint256 public verifierTimelockExpiry;
    uint256 public constant TIMELOCK_DURATION = 48 hours;

    mapping(bytes32 => Match) public matches;
    mapping(StakeTier => uint256) public stakeAmounts;

    event MatchCreated(bytes32 indexed matchId, address indexed p1, GameType gameType, StakeTier tier);
    event MatchLocked(bytes32 indexed matchId, address indexed p2, bytes32 seed);
    event MoveHashesAnchored(bytes32 indexed matchId, bytes32 rootHash);
    event ForfeitRecorded(bytes32 indexed matchId, address forfeitingPlayer);
    event MatchSettled(bytes32 indexed matchId, address winner, uint256 payout);
    event MatchDrawn(bytes32 indexed matchId, uint256 payoutEach);
    event DisputeOpened(bytes32 indexed matchId, uint256 expiryTime);
    
    modifier onlyGameServer() {
        require(msg.sender == gameServer, "Only Game Server");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only Verifier");
        _;
    }

    constructor(address _cUSD, address _treasury, address _gameServer, address _verifier) Ownable(msg.sender) {
        require(_cUSD != address(0), "Invalid cUSD");
        require(_treasury != address(0), "Invalid Treasury");
        require(_gameServer != address(0), "Invalid Game Server");
        
        cUSD = IERC20(_cUSD);
        treasury = _treasury;
        gameServer = _gameServer;
        verifier = _verifier;

        stakeAmounts[StakeTier.PRACTICE] = 0.10 * 10**18;
        stakeAmounts[StakeTier.STANDARD] = 1.00 * 10**18;
        stakeAmounts[StakeTier.PRO] = 5.00 * 10**18;
        stakeAmounts[StakeTier.ELITE] = 20.00 * 10**18;
    }

    // --- Timelock Logic ---
    function proposeNewVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid Verifier");
        pendingVerifier = _newVerifier;
        verifierTimelockExpiry = block.timestamp + TIMELOCK_DURATION;
    }

    function executeNewVerifier() external onlyOwner {
        require(pendingVerifier != address(0), "No pending verifier");
        require(block.timestamp >= verifierTimelockExpiry, "Timelock active");
        verifier = pendingVerifier;
        pendingVerifier = address(0);
        verifierTimelockExpiry = 0;
    }

    // --- Matchmaking & Escrow ---

    /**
     * @dev Creates a new match and locks P1's stake. Requires prior ERC20 approval.
     */
    function createMatch(GameType gameType, StakeTier tier) external nonReentrant returns (bytes32) {
        uint256 amount = stakeAmounts[tier];
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        
        return _initializeMatch(gameType, tier);
    }

    /**
     * @dev Creates a match using EIP-2612 permit for 1-click UX.
     */
    function createMatchWithPermit(
        GameType gameType, 
        StakeTier tier, 
        uint256 deadline, 
        uint8 v, bytes32 r, bytes32 s
    ) external nonReentrant returns (bytes32) {
        uint256 amount = stakeAmounts[tier];
        IERC20Permit(address(cUSD)).permit(msg.sender, address(this), amount, deadline, v, r, s);
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        
        return _initializeMatch(gameType, tier);
    }

    function _initializeMatch(GameType gameType, StakeTier tier) private returns (bytes32) {
        uint256 amount = stakeAmounts[tier];
        bytes32 matchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, gameType, tier));
        
        require(matches[matchId].p1 == address(0), "Match collision");

        matches[matchId] = Match({
            p1: msg.sender,
            p2: address(0),
            stakeAmount: amount,
            gameType: gameType,
            seed: bytes32(0),
            state: MatchState.OPEN,
            lastActionTime: block.timestamp,
            disputeWindowExpiry: 0,
            winner: address(0)
        });

        emit MatchCreated(matchId, msg.sender, gameType, tier);
        return matchId;
    }

    /**
     * @dev P2 joins an open match. Requires prior ERC20 approval.
     */
    function joinMatch(bytes32 matchId) external nonReentrant {
        uint256 amount = matches[matchId].stakeAmount;
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        _lockMatch(matchId);
    }

    /**
     * @dev P2 joins using EIP-2612 permit.
     */
    function joinMatchWithPermit(
        bytes32 matchId, 
        uint256 deadline, 
        uint8 v, bytes32 r, bytes32 s
    ) external nonReentrant {
        uint256 amount = matches[matchId].stakeAmount;
        IERC20Permit(address(cUSD)).permit(msg.sender, address(this), amount, deadline, v, r, s);
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        _lockMatch(matchId);
    }

    function _lockMatch(bytes32 matchId) private {
        Match storage m = matches[matchId];
        require(m.state == MatchState.OPEN, "Match not open");
        require(m.p1 != msg.sender, "Cannot play yourself");

        m.p2 = msg.sender;
        m.state = MatchState.LOCKED;
        
        // Derive shared randomness seed securely using blockhash
        m.seed = keccak256(abi.encodePacked(blockhash(block.number - 1), matchId, m.p1, m.p2));
        m.lastActionTime = block.timestamp;

        emit MatchLocked(matchId, msg.sender, m.seed);
    }

    // --- Gameplay (Game Server Only) ---

    function anchorMoveHashes(bytes32 matchId, bytes32 rootHash) external onlyGameServer {
        Match storage m = matches[matchId];
        require(m.state == MatchState.LOCKED, "Match not active");
        m.lastActionTime = block.timestamp;
        emit MoveHashesAnchored(matchId, rootHash);
    }

    function recordForfeit(bytes32 matchId, address forfeitingPlayer) external onlyGameServer {
        Match storage m = matches[matchId];
        require(m.state == MatchState.LOCKED || m.state == MatchState.PROVING, "Invalid state for forfeit");
        require(forfeitingPlayer == m.p1 || forfeitingPlayer == m.p2, "Player not in match");

        address winner = (forfeitingPlayer == m.p1) ? m.p2 : m.p1;
        _settlePayout(matchId, winner);
        emit ForfeitRecorded(matchId, forfeitingPlayer);
    }

    // --- Settlement (Verifier Only) ---

    function settleMatch(bytes32 matchId, address winner) external onlyVerifier {
        Match storage m = matches[matchId];
        require(m.state == MatchState.LOCKED || m.state == MatchState.DISPUTED || m.state == MatchState.PROVING, "Invalid state");
        require(winner == m.p1 || winner == m.p2, "Winner not in match");

        _settlePayout(matchId, winner);
    }

    function settleMatchDraw(bytes32 matchId) external onlyVerifier {
        Match storage m = matches[matchId];
        require(m.state == MatchState.LOCKED || m.state == MatchState.DISPUTED || m.state == MatchState.PROVING, "Invalid state");

        m.state = MatchState.SETTLED;
        
        uint256 totalPool = m.stakeAmount * 2;
        uint256 fee = (totalPool * 5) / 100;
        uint256 remaining = totalPool - fee;
        uint256 payoutEach = remaining / 2;

        cUSD.safeTransfer(treasury, fee);
        cUSD.safeTransfer(m.p1, payoutEach);
        cUSD.safeTransfer(m.p2, payoutEach);

        emit MatchDrawn(matchId, payoutEach);
    }

    function _settlePayout(bytes32 matchId, address winner) private nonReentrant {
        Match storage m = matches[matchId];
        m.state = MatchState.SETTLED;
        m.winner = winner;

        uint256 totalPool = m.stakeAmount * 2;
        uint256 fee = (totalPool * 5) / 100;
        uint256 payout = totalPool - fee;

        cUSD.safeTransfer(treasury, fee);
        cUSD.safeTransfer(winner, payout);

        emit MatchSettled(matchId, winner, payout);
    }

    // --- Disputes ---

    function openDisputeWindow(bytes32 matchId) external onlyVerifier {
        Match storage m = matches[matchId];
        require(m.state == MatchState.LOCKED || m.state == MatchState.PROVING, "Match not active");

        m.state = MatchState.DISPUTED;
        m.disputeWindowExpiry = block.timestamp + 10 minutes;

        emit DisputeOpened(matchId, m.disputeWindowExpiry);
    }

    function resolveDispute(bytes32 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        require(m.state == MatchState.DISPUTED, "Not in dispute");
        require(block.timestamp >= m.disputeWindowExpiry, "Dispute window active");

        // If no counter-proof is verified before expiry, draw the match
        // In a full implementation, you'd track who failed the proof. For MVP, draw on timeout.
        m.state = MatchState.SETTLED;
        
        uint256 totalPool = m.stakeAmount * 2;
        uint256 fee = (totalPool * 5) / 100;
        uint256 remaining = totalPool - fee;
        uint256 payoutEach = remaining / 2;

        cUSD.safeTransfer(treasury, fee);
        cUSD.safeTransfer(m.p1, payoutEach);
        cUSD.safeTransfer(m.p2, payoutEach);

        emit MatchDrawn(matchId, payoutEach);
    }
}
