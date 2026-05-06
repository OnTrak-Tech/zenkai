# Requirements Document

## Introduction

Zenkai is a decentralized, Proof of Skill gaming protocol built on Celo Mainnet. It provides a mobile-first arena for competitive 1v1 skill-based matches — Chess and Trivia — where every result is verified by Zero-Knowledge (ZK) proofs. The protocol guarantees that matches are provably fair, bot-resistant, and instantly settled in cUSD via MiniPay. Gameplay occurs off-chain for performance; only escrow commitments, move-hash anchors, and ZK proofs touch the chain.

---

## Glossary

- **System**: The Zenkai application as a whole (frontend + smart contracts + ZK circuits + game server).
- **Player**: A human user interacting with Zenkai via a MiniPay-enabled browser.
- **MiniPay**: The Celo-native mobile wallet used for cUSD payments and transaction signing.
- **cUSD**: Celo Dollar, the stablecoin used for all stakes and payouts.
- **ZenkaiEscrow**: The Solidity smart contract that holds staked cUSD and manages match state (OPEN → LOCKED → PROVING → SETTLED / DISPUTED).
- **ZenkaiVerifier**: The Solidity smart contract that verifies Groth16 ZK proofs on-chain.
- **ZenkaiTreasury**: The Solidity smart contract that receives the 5% protocol fee on each settled match.
- **Matchmaker**: The off-chain service that pairs two Players into a match and coordinates game start.
- **Game_Server**: The off-chain relay server that routes moves between Players with sub-100ms latency.
- **ZK_Circuit**: The Noir DSL circuit that encodes move legality, Human Timing Floor, and outcome correctness for a given game type.
- **Prover**: The client-side WASM module that generates a Groth16 proof from a completed game transcript.
- **Human_Timing_Floor (HTF)**: The protocol-enforced minimum inter-move delay of 300ms, proven inside the ZK_Circuit to block bots.
- **Game_Transcript**: The ordered, timestamped sequence of moves for a completed match, used as input to the Prover.
- **Move_Hash**: A cryptographic hash of a move and its timestamp, anchored on-chain during gameplay.
- **Game_ID**: A unique on-chain identifier for each match, derived at escrow time.
- **Randomness_Seed**: A shared seed derived from the Celo block hash at escrow time, used to seed game starting conditions.
- **Stake_Tier**: One of four predefined stake levels (Practice, Standard, Pro, Elite).
- **Dispute_Window**: A 10-minute period after proof submission during which the opposing Player may submit a counter-proof.
- **Celoscan**: The Celo block explorer used for public on-chain transparency.
- **WASM**: WebAssembly runtime used to execute the Prover in the browser.
- **Groth16**: The zk-SNARK proof system used by Zenkai, producing ~200-byte proofs.
- **FIDE**: The international chess governing body whose standard rules govern Chess matches in Zenkai.

---

## Requirements

### Requirement 1: Wallet Detection and Authentication

**User Story:** As a Player, I want the app to detect my MiniPay wallet automatically, so that I can start playing without managing seed phrases or complex wallet setup.

#### Acceptance Criteria

1. WHEN a Player opens the Zenkai app, THE System SHALL detect the presence of a MiniPay-injected provider within 2 seconds.
2. IF no MiniPay provider is detected within 2 seconds, THEN THE System SHALL display a prompt directing the Player to open the app inside MiniPay.
3. WHEN MiniPay is detected, THE System SHALL request the Player's cUSD wallet address without requiring manual input.
4. THE System SHALL display the Player's current cUSD balance on the home screen after wallet connection.
5. IF the Player's cUSD balance is below the minimum Stake_Tier amount (0.10 cUSD), THEN THE System SHALL display a top-up prompt before allowing match entry.

---

### Requirement 2: Matchmaking and Stake Selection

**User Story:** As a Player, I want to select a game type and stake tier and be matched with an opponent, so that I can enter a fair, funded match without manual coordination.

#### Acceptance Criteria

1. THE System SHALL present the Player with a choice of game type (Chess or Trivia) and Stake_Tier (Practice, Standard, Pro, Elite) before initiating matchmaking.
2. WHEN a Player submits a matchmaking request, THE Matchmaker SHALL pair the Player with an opponent of the same game type and Stake_Tier within 60 seconds.
3. IF no opponent is found within 60 seconds, THEN THE System SHALL cancel the matchmaking request and return the Player to the selection screen without any on-chain transaction.
4. WHEN two Players are paired, THE System SHALL initiate the escrow transaction for both Players simultaneously before gameplay begins.
5. THE System SHALL prevent a Player from entering a second match while already in an active match.

---

### Requirement 3: Escrow and On-Chain Commitment (Stage 1)

**User Story:** As a Player, I want my stake to be locked in a smart contract before the match starts, so that I can trust the opponent's funds are committed and the outcome will be paid out fairly.

#### Acceptance Criteria

1. WHEN both Players confirm a match, THE ZenkaiEscrow SHALL lock the exact cUSD stake amount from each Player's wallet before gameplay begins.
2. THE ZenkaiEscrow SHALL assign a unique Game_ID to each match at the time of escrow.
3. THE ZenkaiEscrow SHALL derive a Randomness_Seed from the Celo block hash at the time of escrow and commit it on-chain alongside the Game_ID.
4. WHEN both Players have locked funds, THE ZenkaiEscrow SHALL transition the match state from OPEN to LOCKED.
5. IF either Player's cUSD approval or transfer fails, THEN THE ZenkaiEscrow SHALL revert the entire escrow transaction and return both Players to the matchmaking screen.
6. THE ZenkaiEscrow SHALL enforce the following stake amounts per Stake_Tier: Practice = 0.10 cUSD, Standard = 1.00 cUSD, Pro = 5.00 cUSD, Elite = 20.00 cUSD.

---

### Requirement 4: Off-Chain Gameplay and Move Anchoring (Stage 2)

**User Story:** As a Player, I want moves to be processed instantly during gameplay, so that the game feels responsive while still maintaining an auditable on-chain record.

#### Acceptance Criteria

1. WHEN a match enters the LOCKED state, THE Game_Server SHALL relay moves between Players with a round-trip latency below 100ms.
2. THE System SHALL record a timestamp for each move at the moment it is received by the Game_Server.
3. THE System SHALL compute a Move_Hash for each move and its timestamp and anchor it on-chain at regular intervals during gameplay.
4. WHILE a match is in the LOCKED state, THE System SHALL enforce the Human_Timing_Floor by recording inter-move intervals for inclusion in the Game_Transcript.
5. IF a Player disconnects for more than 60 seconds during an active match, THEN THE System SHALL record a forfeit for that Player and transition the match to the PROVING state with the connected Player as the winner.
6. THE System SHALL accumulate all moves and timestamps into a Game_Transcript upon match completion.
7. THE System SHALL keep total data transmitted per Player below 500KB for a full Chess match.

---

### Requirement 5: ZK Proof Generation (Stage 3)

**User Story:** As a Player, I want the proof of my win to be generated on my device, so that my move data stays private and the result is cryptographically verifiable.

#### Acceptance Criteria

1. WHEN a match concludes with a winner, THE Prover SHALL generate a Groth16 proof from the Game_Transcript on the winning Player's device using the WASM runtime.
2. THE ZK_Circuit SHALL verify that all moves in the Game_Transcript are legal according to the rules of the played game type.
3. THE ZK_Circuit SHALL verify that no consecutive inter-move interval in the Game_Transcript is below 300ms (Human_Timing_Floor).
4. THE ZK_Circuit SHALL verify that the declared outcome matches the final game state derived from the Game_Transcript.
5. THE Prover SHALL complete proof generation within 30 seconds on a mid-range Android device.
6. THE Prover SHALL produce a Groth16 proof of approximately 200 bytes suitable for on-chain verification.
7. IF proof generation fails, THEN THE System SHALL display an error to the Player and allow one retry before escalating to the Dispute_Window.
8. WHEN a forfeit is recorded, THE System SHALL generate a forfeit proof that satisfies the ZK_Circuit without requiring a full game transcript from the forfeiting Player.

---

### Requirement 6: On-Chain Settlement (Stage 4)

**User Story:** As a Player, I want the match result to be settled on-chain automatically after proof verification, so that I receive my winnings instantly without trusting any intermediary.

#### Acceptance Criteria

1. WHEN the winning Player submits a Groth16 proof, THE ZenkaiVerifier SHALL verify the proof on-chain against the committed Game_ID and Randomness_Seed.
2. WHEN the ZenkaiVerifier confirms a valid proof, THE ZenkaiEscrow SHALL transition the match state from PROVING to SETTLED within 5 seconds.
3. WHEN a match is SETTLED, THE ZenkaiEscrow SHALL transfer 95% of the total staked cUSD to the winner's wallet atomically.
4. WHEN a match is SETTLED, THE ZenkaiEscrow SHALL transfer 5% of the total staked cUSD to the ZenkaiTreasury atomically in the same transaction.
5. THE ZenkaiEscrow SHALL enforce the following winner payouts per Stake_Tier: Practice = 0.19 cUSD, Standard = 1.90 cUSD, Pro = 9.50 cUSD, Elite = 38.00 cUSD.
6. IF the ZenkaiVerifier rejects the submitted proof, THEN THE ZenkaiEscrow SHALL retain the staked funds and open the Dispute_Window.
7. WHEN a Chess match ends in a draw, THE ZenkaiEscrow SHALL split the total staked cUSD 50/50 between both Players after deducting the 5% protocol fee.

---

### Requirement 7: Dispute Resolution

**User Story:** As a Player, I want a dispute window after proof submission, so that I can challenge an incorrect result before funds are released.

#### Acceptance Criteria

1. WHEN a proof is submitted and the match transitions to PROVING, THE ZenkaiEscrow SHALL open a Dispute_Window of 10 minutes during which the opposing Player may submit a counter-proof.
2. IF a counter-proof is submitted within the Dispute_Window, THEN THE ZenkaiVerifier SHALL verify both the original proof and the counter-proof.
3. WHEN both proofs are verified, THE ZenkaiEscrow SHALL transition the match state to DISPUTED and freeze the staked funds pending manual arbitration.
4. IF no counter-proof is submitted within the Dispute_Window, THEN THE ZenkaiEscrow SHALL automatically transition the match state to SETTLED and release funds to the original proof submitter.
5. IF a Player fails to submit any proof within 10 minutes of the match ending, THEN THE ZenkaiEscrow SHALL award the match to the opposing Player and settle accordingly.

---

### Requirement 8: Chess Game Rules

**User Story:** As a Player, I want Chess matches to follow standard FIDE rules with a 3+2 time control, so that the game is fair and familiar.

#### Acceptance Criteria

1. THE ZK_Circuit FOR Chess SHALL enforce all standard FIDE move legality rules including castling, en passant, and pawn promotion.
2. THE System SHALL enforce a 3-minute base clock with a 2-second increment per move for each Player.
3. WHEN a Player's clock reaches zero, THE System SHALL record that Player as the loser and transition to the PROVING state.
4. THE ZK_Circuit FOR Chess SHALL recognise checkmate, stalemate, and the fifty-move rule as valid terminal game states.
5. WHEN a Chess match ends in stalemate or the fifty-move rule is triggered, THE System SHALL treat the result as a draw and apply the 50/50 split settlement.
6. THE System SHALL use the Randomness_Seed to determine which Player plays White and which plays Black.

---

### Requirement 9: Trivia Game Rules

**User Story:** As a Player, I want Trivia matches to use on-chain randomness for question selection, so that neither player can predict or pre-load the questions.

#### Acceptance Criteria

1. THE System SHALL conduct Trivia matches as a best-of-10 format where the Player with the most correct answers wins.
2. THE System SHALL seed the question selection for each Trivia match using the Randomness_Seed committed at escrow time.
3. THE System SHALL enforce a 10-second answer window per question for each Player.
4. IF a Player does not submit an answer within the 10-second window, THEN THE System SHALL record that question as incorrect for that Player.
5. THE ZK_Circuit FOR Trivia SHALL verify that the declared score matches the answers recorded in the Game_Transcript.
6. IF both Players answer the same number of questions correctly after 10 rounds, THEN THE System SHALL treat the result as a draw and apply the 50/50 split settlement.
7. THE System SHALL not reveal question content to either Player before the match begins.

---

### Requirement 10: ZK Circuit Correctness — Parse and Round-Trip

**User Story:** As a developer, I want the ZK circuit inputs to be serialized and deserialized correctly, so that proof generation is deterministic and reproducible.

#### Acceptance Criteria

1. THE Prover SHALL serialize the Game_Transcript into the ZK_Circuit input format before proof generation.
2. THE System SHALL deserialize ZK_Circuit inputs back into a Game_Transcript representation for verification purposes.
3. FOR ALL valid Game_Transcripts, serializing then deserializing SHALL produce an equivalent Game_Transcript (round-trip property).
4. THE ZK_Circuit SHALL produce the same proof output for identical Game_Transcript inputs regardless of the order in which moves were received by the Game_Server (confluence property).
5. IF a Game_Transcript contains a move with an inter-move interval below 300ms, THEN THE Prover SHALL reject the transcript and return a descriptive error before attempting proof generation.

---

### Requirement 11: Smart Contract Security and Reliability

**User Story:** As a Player, I want the smart contracts to be secure and audited, so that my staked funds are safe from exploits and bugs.

#### Acceptance Criteria

1. THE ZenkaiEscrow SHALL undergo a third-party security audit before Mainnet deployment.
2. THE ZenkaiEscrow SHALL use a reentrancy guard on all functions that transfer cUSD.
3. THE ZenkaiEscrow SHALL enforce that only the designated ZenkaiVerifier address may trigger state transitions from PROVING to SETTLED.
4. THE ZenkaiEscrow SHALL enforce that staked funds can only be released to the Player addresses committed at escrow time.
5. IF the ZenkaiVerifier contract address is updated, THEN THE ZenkaiEscrow SHALL require a timelock of at least 48 hours before the new address takes effect.
6. THE System SHALL deploy all smart contracts with verified source code on Celoscan before accepting real cUSD stakes.

---

### Requirement 12: Performance and Data Efficiency

**User Story:** As a Player on a low-end Android device with limited data, I want the app to be fast and data-efficient, so that I can play without lag or excessive data consumption.

#### Acceptance Criteria

1. THE Game_Server SHALL relay moves between Players with a round-trip latency below 100ms under normal network conditions.
2. THE Prover SHALL complete Groth16 proof generation within 30 seconds on a device with specifications equivalent to a mid-range Android (2GB RAM, ARMv8 CPU).
3. THE ZenkaiEscrow settlement transaction SHALL be confirmed on Celo Mainnet within 5 seconds of proof submission.
4. THE System SHALL keep total network data transmitted per Player below 500KB for a complete Chess match including move relay, hash anchoring, and proof submission.
5. THE System SHALL load the home screen and complete MiniPay wallet detection within 3 seconds on a 3G mobile connection.

---

### Requirement 13: User Dashboard and Transparency

**User Story:** As a Player, I want to view my match history and stats, so that I can track my performance and verify past results on-chain.

#### Acceptance Criteria

1. THE System SHALL display a Player's match history including game type, stake tier, outcome, and cUSD amount won or lost.
2. THE System SHALL provide a link to the Celoscan transaction for each settled match in the Player's match history.
3. THE System SHALL display aggregate public statistics including total cUSD volume processed and total matches settled.
4. WHEN a match is SETTLED, THE System SHALL update the Player's match history within 10 seconds of on-chain confirmation.
5. THE System SHALL display the Player's current win rate and total cUSD earned across all Stake_Tiers.
