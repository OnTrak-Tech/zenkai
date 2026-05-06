// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IZenkaiEscrow {
    function settleMatch(bytes32 matchId, address winner) external;
    function openDisputeWindow(bytes32 matchId) external;
}

/**
 * @title ZenkaiVerifier
 * @dev Stub for the Noir Groth16 Verifier. This wraps the actual ZK proof
 * verification and communicates the result back to the ZenkaiEscrow contract.
 */
contract ZenkaiVerifier {
    IZenkaiEscrow public escrow;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setEscrow(address _escrow) external onlyOwner {
        escrow = IZenkaiEscrow(_escrow);
    }

    /**
     * @dev STUB: Will be replaced by Noir's generated Groth16 verify function.
     * @param _proof The cryptographic proof.
     * @param _publicInputs The public inputs (e.g., matchId, winner).
     * @return bool True if the proof is valid.
     */
    function verifyProof(bytes calldata _proof, bytes32[] memory _publicInputs) public pure returns (bool) {
        // TODO: Replace with actual Noir Groth16 verification logic in Task 4
        return _proof.length > 0 && _publicInputs.length > 0;
    }

    /**
     * @dev Verifies the proof and triggers settlement or dispute on the escrow contract.
     * @param matchId The unique ID of the match.
     * @param winner The address of the claimed winner.
     * @param proof The generated Groth16 proof.
     */
    function verifyAndSettle(bytes32 matchId, address winner, bytes calldata proof) external {
        require(address(escrow) != address(0), "Escrow not set");

        // Construct public inputs: matchId and winner
        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = matchId;
        publicInputs[1] = bytes32(uint256(uint160(winner)));

        bool isValid = verifyProof(proof, publicInputs);

        if (isValid) {
            escrow.settleMatch(matchId, winner);
        } else {
            escrow.openDisputeWindow(matchId);
        }
    }
}
