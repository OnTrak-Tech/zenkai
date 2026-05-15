import express, { Request, Response } from 'express';
import { getSeededQuestions, stripAnswers, TriviaQuestion } from './triviaQuestions';

export const triviaRouter = express.Router();

const QUESTIONS_PER_GAME = 10;
const GAME_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max per game

type PlayerAnswer = {
    questionIndex: number;
    answerIndex: number;
    timestamp: number;
};

type TriviaSession = {
    matchId: string;
    questions: TriviaQuestion[];  // Full questions with answers (server-only)
    players: {
        [address: string]: {
            answers: PlayerAnswer[];
            score: number;
            finished: boolean;
            finishedAt?: number;
        };
    };
    p1: string;
    p2: string;
    wagerAmount: string;
    startedAt: number;
    settled: boolean;
};

const activeSessions: Map<string, TriviaSession> = new Map();

// Cleanup old sessions every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [matchId, session] of activeSessions) {
        if (now - session.startedAt > GAME_TIMEOUT_MS * 2) {
            activeSessions.delete(matchId);
        }
    }
}, 10 * 60 * 1000);

/**
 * POST /api/trivia/:matchId/start
 * Called by each player when they enter the Arena.
 * Creates the session on first call, returns questions (without answers) to both.
 */
triviaRouter.post('/:matchId/start', (req: Request, res: Response) => {
    const matchId = req.params.matchId as string;
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: "Missing address" });
    }

    let session = activeSessions.get(matchId);

    if (!session) {
        // First player to start — create session
        const questions = getSeededQuestions(matchId as string, QUESTIONS_PER_GAME);
        session = {
            matchId: matchId as string,
            questions,
            players: {
                [address]: { answers: [], score: 0, finished: false }
            },
            p1: address,
            p2: '',
            wagerAmount: req.body.wagerAmount || '1',
            startedAt: Date.now(),
            settled: false,
        };
        activeSessions.set(matchId as string, session);
    } else if (!session.players[address]) {
        // Second player joining
        session.players[address] = { answers: [], score: 0, finished: false };
        if (!session.p2) session.p2 = address;
    }

    // Return questions WITHOUT correctIndex
    const clientQuestions = stripAnswers(session!.questions);

    return res.json({
        status: 'ready',
        questions: clientQuestions,
        questionsCount: clientQuestions.length,
        matchId,
    });
});

/**
 * POST /api/trivia/:matchId/answer
 * Player submits an answer for one question.
 */
triviaRouter.post('/:matchId/answer', (req: Request, res: Response) => {
    const matchId = req.params.matchId as string;
    const { address, questionIndex, answerIndex } = req.body;

    const session = activeSessions.get(matchId);
    if (!session) {
        return res.status(404).json({ error: "Game not found" });
    }

    const player = session.players[address];
    if (!player) {
        return res.status(403).json({ error: "Player not in this game" });
    }

    if (player.finished) {
        return res.status(400).json({ error: "Already finished" });
    }

    // Check if this question was already answered
    const alreadyAnswered = player.answers.find(a => a.questionIndex === questionIndex);
    if (alreadyAnswered) {
        return res.status(400).json({ error: "Question already answered" });
    }

    // Record the answer
    const answer: PlayerAnswer = {
        questionIndex,
        answerIndex,
        timestamp: Date.now(),
    };
    player.answers.push(answer);

    // Check if correct
    const question = session.questions[questionIndex];
    const isCorrect = question && answerIndex === question.correctIndex;
    if (isCorrect) {
        player.score++;
    }

    return res.json({
        status: 'recorded',
        isCorrect,
        correctIndex: question.correctIndex,  // Reveal after answering
        currentScore: player.score,
        answeredCount: player.answers.length,
    });
});

/**
 * POST /api/trivia/:matchId/finish
 * Player signals they've finished all questions (or timed out).
 */
triviaRouter.post('/:matchId/finish', (req: Request, res: Response) => {
    const matchId = req.params.matchId as string;
    const { address } = req.body;

    const session = activeSessions.get(matchId);
    if (!session) {
        return res.status(404).json({ error: "Game not found" });
    }

    const player = session.players[address];
    if (!player) {
        return res.status(403).json({ error: "Player not in this game" });
    }

    player.finished = true;
    player.finishedAt = Date.now();

    // Check if both players are done
    const playerAddresses = Object.keys(session.players);
    const allFinished = playerAddresses.length >= 2 && 
                        playerAddresses.every(addr => session.players[addr].finished);

    if (allFinished) {
        session.settled = true;
    }

    return res.json({
        status: allFinished ? 'complete' : 'waiting_for_opponent',
        yourScore: player.score,
    });
});

/**
 * GET /api/trivia/:matchId/status
 * Poll for game status. Returns scores when both players are done.
 */
triviaRouter.get('/:matchId/status', (req: Request, res: Response) => {
    const matchId = req.params.matchId as string;
    const address = req.query.address as string;

    const session = activeSessions.get(matchId);
    if (!session) {
        return res.status(404).json({ error: "Game not found" });
    }

    const playerAddresses = Object.keys(session.players);
    const allFinished = playerAddresses.length >= 2 && 
                        playerAddresses.every(addr => session.players[addr].finished);

    // Check for game timeout — auto-finish absent players
    if (!allFinished && (Date.now() - session.startedAt > GAME_TIMEOUT_MS)) {
        for (const addr of playerAddresses) {
            if (!session.players[addr].finished) {
                session.players[addr].finished = true;
                session.players[addr].finishedAt = Date.now();
            }
        }
        session.settled = true;

        // Return complete status
        return res.json(buildCompleteResponse(session, address));
    }

    if (allFinished || session.settled) {
        return res.json(buildCompleteResponse(session, address));
    }

    // Still waiting
    const myPlayer = session.players[address];
    return res.json({
        status: 'in_progress',
        yourScore: myPlayer?.score || 0,
        yourFinished: myPlayer?.finished || false,
        opponentJoined: playerAddresses.length >= 2,
        opponentFinished: false,
    });
});

function buildCompleteResponse(session: TriviaSession, myAddress: string) {
    const playerAddresses = Object.keys(session.players);
    const opponentAddress = playerAddresses.find(a => a.toLowerCase() !== myAddress.toLowerCase()) || '';

    const myScore = session.players[myAddress]?.score || 0;
    const opponentScore = session.players[opponentAddress]?.score || 0;

    let outcome: 'WIN' | 'LOSS' | 'DRAW';
    if (myScore > opponentScore) outcome = 'WIN';
    else if (myScore < opponentScore) outcome = 'LOSS';
    else outcome = 'DRAW';

    return {
        status: 'complete',
        yourScore: myScore,
        opponentScore,
        outcome,
        wagerAmount: session.wagerAmount,
        matchId: session.matchId,
    };
}
