# Implementation Plan: Zenkai App

## Overview

Incremental implementation of the Zenkai decentralized Proof of Skill gaming protocol. Tasks follow the 4-stage match loop: smart contracts → off-chain services → ZK circuits → React frontend → integration. Each task builds on the previous and ends with all components wired together.

## Tasks

- [ ] 1. Project scaffolding and shared types
  - Initialize monorepo structure: `contracts/`, `circuits/`, `server/`, `client/`
  - Define shared TypeScript types: `GameTranscript`, `MoveRecord`, `ChessMove`, `TriviaAnswer`, `PlayerProfile`, `MatchSummary`, `STAKE_TIERS`
  - Set up Hardhat project in `contracts/` with Celo network config and cUSD ERC-20 mock for tests
  - Set up Noir project in `circuits/` with `nargo.toml`
  - Set up Node.js/TypeScript project in `server/` with WebSocket support
  - Set up Vite + React + TypeScript project in `client/` with Viem and MiniPay SDK
  - _Requirements: 1.1, 3.1, 4.1, 5.1_

- [ ] 2. Smart contracts
  - [ ] 2.1 Implement `ZenkaiTreasury.sol`
    - Minimal cUSD fee receiver with owner-only withdrawal
    - _Requirements: 6.4_

  - [ ] 2.2 Implement `ZenkaiEscrow.sol` — state machine and escrow logic
    - Define `Match` struct, `MatchState` enum, and storage mapping
    - Implement `createMatch`, `depositStake` with OPEN → LOCKED transition
    - Derive `seed` from `blockhash` at escrow time and emit `MatchLocked` event
    - Enforce stake amounts per `STAKE_TIERS` (Practice / Standard / Pro / Elite)
    - Add reentrancy guard on all cUSD transfer functions
    - Restrict `anchorMoveHashes` / `recordForfeit` to registered Game Server address
    - Restrict `settleMatch` / `settleMatchDraw` to registered ZenkaiVerifier address
    - Implement `settleMatch` (95% winner + 5% treasury) and `settleMatchDraw` (50/50 after fee)
    - Implement `openDisputeWindow` (10-minute window), `submitCounterProof`, auto-settle on window expiry
    - Enforce 48-hour timelock for ZenkaiVerifier address updates
    - Emit `MatchSettled` and `DisputeOpened` events
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.3, 7.4, 7.5, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 2.3 Write unit tests for `ZenkaiEscrow.sol`
    - Test full happy-path: createMatch → depositStake → settleMatch → payout amounts
    - Test draw settlement 50/50 split
    - Test reentrancy guard rejection
    - Test access control: non-verifier cannot call settleMatch
    - Test dispute window: auto-settle after expiry, freeze on counter-proof
    - Test 48-hour timelock enforcement
    - _Requirements: 3.5, 6.3, 6.4, 6.7, 7.1, 7.4, 11.2, 11.3, 11.5_

  - [ ] 2.4 Implement `ZenkaiVerifier.sol`
    - Wrap Groth16 verifier stub (to be replaced by Noir-generated verifier)
    - Implement `verifyAndSettle`: on success call `escrow.settleMatch`, on failure call `escrow.openDisputeWindow`
    - _Requirements: 6.1, 6.2, 6.6_

  - [ ]* 2.5 Write property test for escrow payout invariant
    - **Property 1: Payout conservation** — for any settled match, `winner_payout + treasury_fee == 2 * stakeAmount` (no funds created or destroyed)
    - **Validates: Requirements 6.3, 6.4, 6.5**

  - [ ]* 2.6 Write property test for draw settlement invariant
    - **Property 2: Draw split symmetry** — for any draw settlement, `p1_payout == p2_payout` and `p1_payout + p2_payout + treasury_fee == 2 * stakeAmount`
    - **Validates: Requirements 6.7, 8.5, 9.6**

- [ ] 3. Checkpoint — smart contract tests pass
  - Ensure all Hardhat tests pass. Ask the user if questions arise.

- [ ] 4. ZK circuits (Noir)
  - [ ] 4.1 Implement shared Human Timing Floor module (`timing.nr`)
    - Constraint: all inter-move intervals in the transcript ≥ 300ms
    - _Requirements: 4.4, 5.3, 10.5_

  - [ ]* 4.2 Write property test for Human Timing Floor
    - **Property 3: HTF rejection** — any transcript containing at least one inter-move interval < 300ms must fail circuit constraint
    - **Validates: Requirements 5.3, 10.5**

  - [ ] 4.3 Implement Chess circuit (`chess.nr`)
    - Inputs: `game_id`, `seed`, `moves[]`, `winner`
    - Constraints: FIDE move legality (castling, en passant, promotion), HTF, terminal state matches declared winner, White/Black assignment from seed
    - _Requirements: 5.2, 5.3, 5.4, 8.1, 8.4, 8.6_

  - [ ]* 4.4 Write property test for Chess circuit round-trip
    - **Property 4: Chess transcript round-trip** — serializing then deserializing a valid Chess `GameTranscript` produces an equivalent transcript
    - **Validates: Requirements 10.3**

  - [ ] 4.5 Implement Trivia circuit (`trivia.nr`)
    - Inputs: `game_id`, `seed`, `answers[]`, `score_p1`, `score_p2`
    - Constraints: question indices derived from seed, HTF, declared scores match transcript, unanswered questions counted as incorrect
    - _Requirements: 5.2, 5.3, 5.4, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 4.6 Write property test for Trivia circuit confluence
    - **Property 5: Trivia confluence** — the circuit produces the same proof output for identical `GameTranscript` inputs regardless of move receipt order
    - **Validates: Requirements 10.4**

  - [ ] 4.7 Compile circuits to WASM via `nargo` + `bb.js`
    - Output `chess.wasm`, `trivia.wasm`, and Groth16 verifier Solidity for `ZenkaiVerifier.sol`
    - Replace verifier stub in `ZenkaiVerifier.sol` with generated verifier
    - _Requirements: 5.1, 5.6_

  - [ ]* 4.8 Write unit tests for circuit serialization
    - Test `GameTranscript` → circuit input serialization and deserialization
    - Test rejection of transcripts with HTF violations before proof generation
    - _Requirements: 10.1, 10.2, 10.5_

- [ ] 5. Checkpoint — circuit tests pass
  - Ensure all circuit constraint tests and serialization tests pass. Ask the user if questions arise.

- [ ] 6. WASM Prover worker
  - [ ] 6.1 Implement `ProverWorker` Web Worker (`proverWorker.ts`)
    - Load chess/trivia WASM modules
    - Handle `{ type: "prove", transcript, gameId, seed }` messages
    - Return `{ type: "proof", proof: Uint8Array }` (~200 bytes) or `{ type: "error", error }`
    - Validate HTF before invoking WASM; return descriptive error on violation
    - Allow one retry on proof generation failure before surfacing error to UI
    - _Requirements: 5.1, 5.5, 5.6, 5.7, 10.1, 10.5_

  - [ ]* 6.2 Write unit tests for `ProverWorker`
    - Test successful proof generation returns ~200-byte Uint8Array
    - Test HTF violation returns error before WASM invocation
    - Test retry logic on transient failure
    - _Requirements: 5.5, 5.7, 10.5_

- [ ] 7. Off-chain services
  - [ ] 7.1 Implement Matchmaker service (`server/matchmaker.ts`)
    - `POST /queue` — enqueue player by `{ address, gameType, stakeTier }`; return `{ queueId }`
    - `GET /queue/:id` — return `{ status: "waiting" | "matched" | "timeout", matchId? }`
    - FIFO pairing per `(gameType, stakeTier)` bucket; 60-second timeout returns `{ status: "timeout" }`
    - Prevent duplicate queue entries for the same address
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 7.2 Write unit tests for Matchmaker pairing logic
    - Test two players in same bucket are paired
    - Test players in different buckets are not paired
    - Test 60-second timeout cancels request
    - Test duplicate address rejection
    - _Requirements: 2.2, 2.3, 2.5_

  - [ ] 7.3 Implement Game Server WebSocket relay (`server/gameServer.ts`)
    - `WS /game/:gameId` — relay moves between paired players
    - Stamp each move with `Date.now()` at receipt; compute `interMoveInterval`
    - Batch move hashes and call `ZenkaiEscrow.anchorMoveHashes()` every 10 moves or 30 seconds
    - Detect 60-second disconnect; call `ZenkaiEscrow.recordForfeit(gameId, forfeitingPlayer)`
    - Accumulate `GameTranscript` and emit `{ type: "game_end", winner, transcript }` on match completion
    - Enforce Chess 3+2 clock; record clock-zero player as loser
    - Enforce Trivia 10-second answer window; record non-answer as incorrect
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 8.2, 8.3, 9.3, 9.4, 12.1_

  - [ ]* 7.4 Write unit tests for Game Server
    - Test move relay reaches opponent
    - Test move hash batching triggers at 10 moves and at 30-second interval
    - Test forfeit recorded on 60-second disconnect
    - Test Chess clock-zero triggers PROVING transition
    - Test Trivia 10-second window records non-answer as incorrect
    - _Requirements: 4.1, 4.5, 8.3, 9.4_

- [ ] 8. Checkpoint — server tests pass
  - Ensure all Matchmaker and Game Server tests pass. Ask the user if questions arise.

- [ ] 9. React frontend — wallet and matchmaking
  - [ ] 9.1 Implement `WalletProvider` component
    - Detect MiniPay-injected provider within 2 seconds on mount
    - If not detected, display prompt to open app inside MiniPay
    - Expose `address`, `balance` (cUSD), `signTx` via React context
    - Display cUSD balance on home screen after connection
    - Show top-up prompt if balance < 0.10 cUSD
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.5_

  - [ ]* 9.2 Write unit tests for `WalletProvider`
    - Test provider detected within 2s shows balance
    - Test no provider after 2s shows MiniPay prompt
    - Test balance < 0.10 cUSD shows top-up prompt
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ] 9.3 Implement `MatchmakingScreen` component
    - Game type (Chess / Trivia) and Stake_Tier (Practice / Standard / Pro / Elite) selection
    - On submit: call `POST /queue`, poll `GET /queue/:id`, show waiting state
    - On match found: initiate escrow transaction via `WalletProvider.signTx`
    - On timeout (60s): cancel and return to selection screen without on-chain transaction
    - Disable entry if player already in active match
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1_

  - [ ]* 9.4 Write unit tests for `MatchmakingScreen`
    - Test stake tier options render with correct cUSD amounts
    - Test 60-second timeout returns to selection screen
    - Test active-match guard disables entry
    - _Requirements: 2.1, 2.3, 2.5_

- [ ] 10. React frontend — gameplay screens
  - [ ] 10.1 Implement `ChessGameScreen` component
    - Render interactive chess board using game state from `GameTranscript`
    - Connect to Game Server WebSocket; send/receive `{ type: "move" }` messages
    - Display 3+2 clock for each player; update on each move
    - Use `seed` to assign White/Black
    - On `game_end`: pass transcript to `ProverWorker`; show proof generation progress
    - _Requirements: 4.1, 8.2, 8.6, 5.1_

  - [ ] 10.2 Implement `TriviaGameScreen` component
    - Render questions seeded from `Randomness_Seed`; do not reveal questions before match start
    - Enforce 10-second answer window per question with visible countdown
    - Connect to Game Server WebSocket; send `{ type: "move", payload: TriviaAnswer }`
    - On `game_end`: pass transcript to `ProverWorker`; show proof generation progress
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7, 5.1_

  - [ ] 10.3 Implement proof submission flow
    - On `ProverWorker` returning proof: call `ZenkaiVerifier.verifyAndSettle` via `WalletProvider.signTx`
    - Show dispute window countdown (10 minutes) after proof submission
    - On proof error: show error message and offer one retry; after retry failure surface dispute window
    - _Requirements: 5.7, 6.1, 7.1, 7.2_

  - [ ]* 10.4 Write unit tests for proof submission flow
    - Test successful proof triggers settlement transaction
    - Test proof error shows retry option
    - Test dispute window countdown renders after submission
    - _Requirements: 5.7, 6.1, 7.1_

- [ ] 11. React frontend — dashboard
  - [ ] 11.1 Implement `DashboardScreen` component
    - Display match history: game type, stake tier, outcome, cUSD delta
    - Provide Celoscan link per settled match (`celoscanTxHash`)
    - Display aggregate stats: total cUSD volume, total matches settled
    - Display win rate and total cUSD earned
    - Update match history within 10 seconds of on-chain `MatchSettled` event
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 11.2 Write unit tests for `DashboardScreen`
    - Test match history renders correct outcome and cUSD delta
    - Test Celoscan link contains correct tx hash
    - Test aggregate stats update after new `MatchSettled` event
    - _Requirements: 13.1, 13.2, 13.4_

- [ ] 12. Checkpoint — frontend tests pass
  - Ensure all React component tests pass. Ask the user if questions arise.

- [ ] 13. Integration and wiring
  - [ ] 13.1 Wire frontend to live contracts and services
    - Configure Viem with Celo Mainnet RPC and deployed contract addresses
    - Wire `MatchmakingScreen` → Matchmaker → Game Server → `ChessGameScreen` / `TriviaGameScreen` → `ProverWorker` → proof submission → `DashboardScreen`
    - Subscribe to `MatchSettled` on-chain events to update dashboard in real time
    - _Requirements: 1.3, 2.4, 3.4, 6.2, 13.4_

  - [ ] 13.2 Enforce data budget and performance targets
    - Compress WebSocket move payloads to keep total data per player < 500KB for a full Chess match
    - Verify home screen loads and MiniPay detection completes within 3 seconds (measure with Lighthouse / manual check)
    - _Requirements: 4.7, 12.4, 12.5_

  - [ ]* 13.3 Write integration tests for full match flow
    - Test escrow → gameplay → proof → settlement end-to-end against local Hardhat node
    - Test draw settlement splits correctly
    - Test forfeit flow: disconnect → forfeit proof → settlement
    - _Requirements: 3.1, 4.5, 5.8, 6.3, 6.7_

- [ ] 14. Final checkpoint — all tests pass
  - Ensure all unit, property, and integration tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each layer boundary
- Property tests validate universal correctness invariants (payout conservation, HTF, round-trip, confluence)
- Unit tests validate specific examples and edge cases
- Smart contract audit (Requirement 11.1) and Celoscan source verification (Requirement 11.6) are pre-deployment steps outside the coding agent scope
