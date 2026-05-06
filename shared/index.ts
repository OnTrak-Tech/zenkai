export type PlayerProfile = {
  address: string;
  rating?: number;
  totalMatches?: number;
};

export type STAKE_TIER = "Practice" | "Standard" | "Pro" | "Elite";

export const STAKE_AMOUNTS: Record<STAKE_TIER, number> = {
  Practice: 0.10,
  Standard: 1.00,
  Pro: 5.00,
  Elite: 20.00
};

export type MoveRecord = {
  player: string;
  moveData: any; // Will be specific per game type
  timestamp: number;
};

export type ChessMove = {
  from: string; // e.g., 'e2'
  to: string; // e.g., 'e4'
  promotion?: 'q' | 'r' | 'b' | 'n';
};

export type TriviaAnswer = {
  questionId: string;
  answerIndex: number;
};

export type GameType = "Chess" | "Trivia";

export type MatchState = "OPEN" | "LOCKED" | "PROVING" | "SETTLED" | "DISPUTED";

export type GameTranscript = {
  gameId: string;
  gameType: GameType;
  seed: string;
  player1: string;
  player2: string;
  moves: MoveRecord[];
  winner?: string; // Address of winner, or undefined for draw
  endTime?: number;
};

export type MatchSummary = {
  gameId: string;
  gameType: GameType;
  stakeTier: STAKE_TIER;
  outcome: string;
  cUSDDelta: number;
  celoscanTxHash?: string;
  timestamp: number;
};
