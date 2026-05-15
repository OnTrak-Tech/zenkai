import { CONFIG } from '../config';

const BASE_URL = CONFIG.serverUrl;

/** Join the matchmaking queue */
export async function joinQueue(address: string, gameType: string, wagerAmount: string) {
    const res = await fetch(`${BASE_URL}/api/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, gameType, wagerAmount }),
    });
    if (!res.ok) throw new Error(`Queue failed: ${res.status}`);
    return res.json() as Promise<{
        queueId: string;
        status: 'waiting' | 'matched';
        matchId?: string;
        opponent?: string;
    }>;
}

/** Poll for match status */
export async function pollQueue(queueId: string) {
    const res = await fetch(`${BASE_URL}/api/queue/${queueId}`);
    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    return res.json() as Promise<{
        status: 'waiting' | 'matched' | 'timeout';
        matchId?: string;
        p1?: string;
        p2?: string;
    }>;
}

/** Start a trivia game — returns questions without answers */
export async function startTrivia(matchId: string, address: string, wagerAmount: string) {
    const res = await fetch(`${BASE_URL}/api/trivia/${matchId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, wagerAmount }),
    });
    if (!res.ok) throw new Error(`Start trivia failed: ${res.status}`);
    return res.json() as Promise<{
        status: string;
        questions: { id: number; question: string; options: [string, string, string, string] }[];
        questionsCount: number;
        matchId: string;
    }>;
}

/** Submit an answer for one question */
export async function submitAnswer(matchId: string, address: string, questionIndex: number, answerIndex: number) {
    const res = await fetch(`${BASE_URL}/api/trivia/${matchId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, questionIndex, answerIndex }),
    });
    if (!res.ok) throw new Error(`Submit answer failed: ${res.status}`);
    return res.json() as Promise<{
        status: string;
        isCorrect: boolean;
        correctIndex: number;
        currentScore: number;
        answeredCount: number;
    }>;
}

/** Signal that the player has finished all questions */
export async function finishTrivia(matchId: string, address: string) {
    const res = await fetch(`${BASE_URL}/api/trivia/${matchId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
    });
    if (!res.ok) throw new Error(`Finish trivia failed: ${res.status}`);
    return res.json() as Promise<{
        status: 'complete' | 'waiting_for_opponent';
        yourScore: number;
    }>;
}

/** Poll for game completion status */
export async function getTriviaStatus(matchId: string, address: string) {
    const res = await fetch(`${BASE_URL}/api/trivia/${matchId}/status?address=${address}`);
    if (!res.ok) throw new Error(`Status failed: ${res.status}`);
    return res.json() as Promise<{
        status: 'in_progress' | 'complete';
        yourScore: number;
        opponentScore?: number;
        outcome?: 'WIN' | 'LOSS' | 'DRAW';
        yourFinished?: boolean;
        opponentJoined?: boolean;
        opponentFinished?: boolean;
        wagerAmount?: string;
        matchId?: string;
    }>;
}
