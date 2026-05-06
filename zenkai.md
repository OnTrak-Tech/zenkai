# ZENKAI  
**Proof of Skill Gaming Protocol**  
**Product Requirements Document**  
**Version 1.0** · May 2026

**Network**: Celo Mainnet (L2)  
**Currency**: cUSD via MiniPay  
**ZK Stack**: Noir + Groth16  
**Target**: Emerging Markets

---

## 1. Project Overview

Zenkai is a decentralized, **Proof of Skill** gaming protocol built on Celo Mainnet. It provides a secure, mobile-first arena for competitive 1v1 skill-based matches — such as Chess and Trivia — where every result is verified by Zero-Knowledge (ZK) proofs. The protocol guarantees that matches are provably fair, bot-resistant, and instantly settled in cUSD via MiniPay.

### 1.1 Mission Statement

To make competitive skill-based gaming accessible, transparent, and rewarding for players in emerging markets — removing the need to trust central servers, referees, or intermediaries.

### 1.2 Core Principles

- **Integrity over convenience** — every match outcome is cryptographically provable.
- **Mobile-first** — designed from day one for low-end Android devices and MiniPay.
- **Human-centric** — bot resistance is enforced at the protocol level.
- **Instant settlement** — winners receive cUSD the moment the proof is verified on-chain.
- **No crypto-speak** — UX hides blockchain complexity entirely from end users.

---

## 2. Problem Statement

### 2.1 The Cheating Problem
Most mobile competitive games rely on central servers. This creates a single point of failure where results can be manipulated.

### 2.2 The Bot Problem
Bots with sub-50ms reaction times dominate games with real money at stake. Current systems cannot reliably prove a player is human.

### 2.3 The UX Problem
Blockchain games introduce gas fees, seed phrases, and complex wallets that alienate non-technical users in emerging markets.

### 2.4 The Latency Problem
Recording every move on-chain is too slow and expensive for real-time gameplay.

---

## 3. Goals & Value Proposition

| Goal                    | Description                                      | How Zenkai Achieves It |
|-------------------------|--------------------------------------------------|------------------------|
| **Absolute Integrity**  | Every match result must be independently verifiable | Noir ZK-circuits act as a mathematical referee |
| **Bot Resistance**      | Automated bots must not compete against humans   | Human Timing Floor (300-500ms) enforced in ZK circuit |
| **Mobile-First UX**     | Players should not need to understand crypto     | MiniPay SDK abstracts wallet, gas, and signing |
| **Instant Settlement**  | Winners receive cUSD without manual intervention | Trustless escrow + atomic release on proof verification |
| **Emerging Market Focus**| Accessible on low-data, older devices           | Sub-cent gas fees + WASM-optimized proofs |

---

## 4. Technical Architecture

### 4.1 The 4-Stage Match Loop

| Stage | Name        | What Happens | Where It Runs |
|-------|-------------|--------------|---------------|
| 1     | **Escrow**  | Both players lock cUSD. Game ID + randomness seed committed. | Celo Mainnet |
| 2     | **Gameplay**| Moves occur off-chain. Move hashes periodically anchored on-chain. | Off-chain + on-chain anchors |
| 3     | **ZK Proving** | Winner generates Noir ZK-proof locally proving legality, timing & outcome. | Client-side WASM |
| 4     | **Settlement** | Groth16 proof verified on-chain → funds released atomically. | Celo Mainnet |

### 4.2 ZK Proof System Detail

Zenkai uses **Noir** + **Groth16**. The circuit enforces three constraints:

1. **Move Legality**
2. **Human Timing Floor** (no consecutive moves < 300ms)
3. **Outcome Correctness**

### 4.3 Anti-Cheat: Human Timing Floor

| Actor            | Typical Response Time | Zenkai Result |
|------------------|-----------------------|---------------|
| Automated Bot    | < 50ms                | Proof invalid |
| Expert Human     | 150–400ms             | Proof valid |
| Casual Human     | 400ms – 2s            | Proof valid |

### 4.4 Tech Stack

| Layer            | Tool / Library       | Role |
|------------------|----------------------|------|
| Blockchain       | Celo Mainnet (L2)    | Escrow + settlement |
| ZK Circuits      | Noir DSL             | Game rule constraints |
| Proof System     | Groth16              | ~200-byte proofs |
| Proof Runtime    | WASM (browser)       | Client-side proving |
| Smart Contracts  | Solidity + Foundry   | Core logic |
| Frontend         | React + Viem         | UI & wallet interaction |
| Wallet           | MiniPay SDK          | cUSD payments |

---

## 5. Functional Requirements

### 5.1 Authentication & Wallet
- Detect MiniPay wallet within 2 seconds.
- One-tap match entry, no seed phrases.

### 5.2 Matchmaking & Escrow
- Select game type and stake.
- Funds locked before gameplay begins.
- Unique game ID + randomness seed.

### 5.3 Gameplay
- Off-chain moves (< 100ms latency).
- Periodic on-chain hash anchoring.
- 60-second disconnect = forfeit.

### 5.4 Anti-Cheat (ZK)
- Validate move legality.
- Enforce Human Timing Floor.
- Proof generation < 30s on mid-range Android.

### 5.5 Settlement & Payouts
- 95% to winner, 5% protocol fee.
- Atomic settlement.
- Dispute window if proof not submitted.

### 5.6 Dashboard & Analytics
- Public stats and personal profiles.
- Full on-chain transparency via Celoscan.

---

## 6. Non-Functional Requirements

| Category      | Requirement                  | Target |
|---------------|------------------------------|--------|
| Performance   | Move latency                 | < 100ms |
| Performance   | Proof generation             | < 30s on mid-range Android |
| Performance   | Settlement                   | < 5s |
| Security      | Audits                       | Third-party audit required |
| Reliability   | Funds safety                 | Timeout + dispute paths |
| Accessibility | Data usage                   | < 500KB per full Chess match |

---

## 7. Game Specifications

### 7.1 Chess (Launch Game)
- Standard FIDE rules.
- 3+2 time control.
- Full support for castling, en passant, promotion.
- Draws = 50/50 split.

### 7.2 Trivia (Launch Game)
- Best of 10 questions.
- 10-second answer window.
- Questions seeded by on-chain randomness.

### 7.3 Stake Tiers

| Tier     | Stake (per player) | Winner Takes | Protocol Fee |
|----------|--------------------|--------------|--------------|
| Practice | 0.10 cUSD          | 0.19 cUSD    | 0.01 cUSD    |
| Standard | 1.00 cUSD          | 1.90 cUSD    | 0.10 cUSD    |
| Pro      | 5.00 cUSD          | 9.50 cUSD    | 0.50 cUSD    |
| Elite    | 20.00 cUSD         | 38.00 cUSD   | 2.00 cUSD    |

---

## 8. Smart Contract Architecture

**Main Contracts**:
- `ZenkaiEscrow.sol` — state machine + fund holding
- `ZenkaiVerifier.sol` — Groth16 proof verification
- `ZenkaiTreasury.sol` — 5% fee receiver

**States**: OPEN → LOCKED → PROVING → SETTLED / DISPUTED

---

## 9. Roadmap

| Phase     | Timeline          | Deliverables |
|-----------|-------------------|--------------|
| Week 1    | ZK Circuit Development | Noir circuits + HTF + WASM benchmarks |
| Week 2    | Smart Contract Deployment | Testnet deployment + full testing |
| Week 3    | Frontend & MiniPay Integration | Complete mobile flow |
| Week 4    | Mainnet Launch    | Production deployment + dashboard |

---

## 10. Success Metrics

### Proof of Ship Criteria
- All contracts verified on Celoscan
- ≥ 10 completed matches
- ≥ 50 cUSD processed
- Proof generation < 30s on target devices

### Long-Term KPIs
- 500 Daily Active Players in 30 days
- ≥ 99% settlement success rate
- $10,000 cUSD monthly volume in 60 days

---

## 11. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|----------|
| Proof generation too slow | High | Circuit optimization + benchmarks |
| Player disconnects | High | 60s timeout + forfeit rules |
| Smart contract bug | High | Audits + fuzz testing + timelock |
| Timestamp manipulation | Medium | On-chain hash anchoring |

---

## 12. Open Questions

1. Should Trivia randomness use Chainlink VRF?
2. What is the acceptable proof generation time UX threshold?
3. How should Chess draws be handled at contract level?
4. Is server-side proving fallback acceptable?
5. Governance structure for the Treasury?
6. Spectator mode in V1 or V2?

---

**© 2026 Zenkai Protocol · Version 1.0**