# Product Requirements Document (PRD): Zenkai

## 1. Executive Summary
**Zenkai** is a mobile-first, decentralized gaming arena built on Celo that leverages Zero-Knowledge (ZK) proofs to eliminate cheating[cite: 1]. By moving gameplay off-chain and verifying results with **Noir-based ZK-circuits**, Zenkai provides high-performance gaming with trustless security and sub-cent settlement costs[cite: 1].

---

## 2. Target Audience
*   **Competitive Mobile Gamers**: Users seeking fair, high-stakes 1v1 matches[cite: 1].
*   **MiniPay Users**: Mobile-first users in emerging markets (primarily Ghana) using cUSD[cite: 1].
*   **Web3 Developers**: Builders needing a secure "Proof of Skill" protocol for integration[cite: 1].

---

## 3. Core Functional Requirements

### 3.1. Escrow & Matchmaking (Stage 1)
*   **Deposit Logic**: Both players lock an equal amount of **cUSD** into the `ZenkaiManager` smart contract[cite: 1].
*   **Provable Randomness**: Generate a shared seed from the Celo block hash for starting conditions[cite: 1].
*   **Immutable ID**: Every game is assigned a unique `game_id` committed on-chain[cite: 1].

### 3.2. Off-Chain Gameplay & Commits (Stage 2)
*   **Commit-Reveal Pattern**: Players submit move hashes to create an immutable audit trail on-chain[cite: 1].
*   **Human Timing Floor**: The system enforces a minimum move time (e.g., 300-500ms) to block bot interference[cite: 1].
*   **Latency Management**: Moves are processed instantly via the game server, with asynchronous on-chain commits.

### 3.3. ZK-Anti-Cheat Enforcement (Stage 3)
*   **Logic Validation**: Noir circuits prove move legality (e.g., Chess rules) without revealing the moves[cite: 1].
*   **Client-Side Proving**: Proofs are generated on the user's device via **WASM** to ensure privacy.
*   **Small Proof Size**: Utilize **Groth16** to maintain a ~200-byte proof size for gas efficiency.

### 3.4. On-Chain Settlement (Stage 4)
*   **Proof Verification**: The Celo contract verifies the proof before automatically releasing cUSD[cite: 1].
*   **Dispute Window**: A 10-minute window exists for counter-proof submission in contested results.

---

## 4. Technical Stack

| Component | Technology |
| :--- | :--- |
| **Blockchain** | Celo Mainnet[cite: 1] |
| **ZK Language** | **Noir** (Rust-based)[cite: 1] |
| **Proof System** | **Groth16** (for mobile gas efficiency) |
| **Smart Contracts** | **Solidity** (Foundry/Hardhat) |
| **Frontend** | React + **MiniPay SDK**[cite: 1] |
| **Wallet/UX** | **Viem** (Lightweight Celo connection)[cite: 1] |

---

## 5. Proof of Ship Success Metrics
*   **GitHub Activity**: Daily commits to public repos including `.nr` (Noir) and `.sol` (Solidity) files[cite: 1].
*   **On-Chain Volume**: Total **cUSD** locked and volume of ZK-verified settlements[cite: 1].
*   **User Growth**: Number of unique wallets interacting via MiniPay[cite: 1].
*   **Verification**: All smart contracts must be verified on **Celoscan**[cite: 1].

---

## 6. Project Roadmap (May 2026)
1.  **Phase 1**: Develop Noir circuits for move validation and timing floor enforcement.
2.  **Phase 2**: Deploy `ZenkaiManager` and Verifier contracts to Celo Alfajores Testnet.
3.  **Phase 3**: Integrate MiniPay SDK and conduct client-side WASM proving tests.
4.  **Phase 4**: **Final Mainnet Deployment** and leaderboard submission.