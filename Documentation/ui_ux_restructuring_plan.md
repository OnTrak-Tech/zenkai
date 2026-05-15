# Zenkai UI/UX Restructuring Plan (Mobile-First / MiniPay Focus)

This document outlines the strategic UI/UX refactoring required to transform Zenkai from a "Desktop Web3 App" into a "Mobile-First Arcade Game" optimized for the MiniPay environment.

## Phase 1: Core Architecture & Navigation

### 1.1 The "Arcade Cabinet" Main Menu
*   **Goal**: Replace the long-scrolling, jargon-heavy marketing landing page with a high-impact, single-screen arcade menu.
*   **Tasks**:
    *   [ ] Refactor `Home.tsx` to remove vertical scrolling.
    *   [ ] Implement a massive, central **"ENTER ARENA"** button.
    *   [ ] Condense the `TopAppBar` to only show the Player Profile, truncated Wallet Address, and a highly visible cUSD Balance.
    *   [ ] Implement a sticky bottom navigation bar (Icons: Play, Leaderboard, History).
    *   [ ] Move complex Web3 terminology (ZK-Proofs, Noir, etc.) behind a small "Info/Whitepaper" modal icon.

### 1.2 Seamless "Auto-Teleport" Onboarding
*   **Goal**: Eliminate the friction of manual navigation after wallet connection.
*   **Tasks**:
    *   [ ] Update routing logic in `App.tsx` (or equivalent router).
    *   [ ] Listen for the `isConnected` state from `WalletContext.tsx`.
    *   [ ] If a user connects (either manually or via background auto-connect), immediately redirect them from `/` to `/lobby`.

## Phase 2: The Matchmaking Lobby (`/lobby`)

### 2.1 The Staking Interface
*   **Goal**: Create a buffer zone between connection and gameplay to prevent accidental wagers.
*   **Tasks**:
    *   [ ] Create a new `Lobby.tsx` view.
    *   [ ] Implement a clear, thumb-friendly wager selection UI (e.g., toggle buttons for 1 cUSD, 5 cUSD, 10 cUSD).
    *   [ ] Add a large **"FIND MATCH"** action button.

### 2.2 Visual Feedback (Waiting States)
*   **Goal**: Keep the user engaged while waiting for blockchain transactions or matchmaking.
*   **Tasks**:
    *   [ ] Design and implement a "Radar" or "Hacking" animation overlay triggered when "FIND MATCH" is clicked.
    *   [ ] Ensure the UI provides clear text feedback (e.g., "Searching for opponent on Celo Sepolia...").

## Phase 3: The Arena (Gameplay)

### 3.1 Thumb-Optimized Grid
*   **Goal**: Ensure the game board is playable on small vertical screens without fat-fingering.
*   **Tasks**:
    *   [ ] Refactor `Arena.tsx` layout to explicitly target mobile portrait dimensions.
    *   [ ] Increase the size of the grid hitboxes.
    *   [ ] Move action buttons (e.g., "Confirm Move") to the very bottom of the screen, within easy thumb reach.

### 3.2 "Fighting Game" HUD
*   **Goal**: Make the game feel competitive and personal.
*   **Tasks**:
    *   [ ] Anchor the Opponent's Profile/Status to the top of the screen.
    *   [ ] Anchor the Player's Profile/Status to the bottom of the screen (just above action buttons).

### 3.3 ZK-Proof Generation Feedback
*   **Goal**: Disguise the 3-10 second ZK-proof generation delay as a thematic gameplay feature.
*   **Tasks**:
    *   [ ] Build a full-screen, semi-transparent cyberpunk overlay.
    *   [ ] Display "ENCRYPTING MOVE (ZK-PROOF)" with an aggressive, high-tech progress bar during the Noir WASM execution.

## Phase 4: Settlement & Post-Match

### 4.1 Victory/Defeat Screens
*   **Goal**: Provide juicy, satisfying closure to the wager.
*   **Tasks**:
    *   [ ] Create a massive **VICTORY** or **DEFEAT** text overlay upon match conclusion.
    *   [ ] Animate the cUSD winnings (e.g., "+5 cUSD") floating from the center of the screen into the top wallet balance.
    *   [ ] Provide prominent **"Rematch"** and **"Back to Lobby"** buttons to retain players.
