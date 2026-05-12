import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { GameType, STAKE_TIER } from '@zenkai/shared';

export const matchmakerRouter = express.Router();

type QueueEntry = {
    queueId: string;
    address: string;
    gameType: GameType;
    stakeTier: STAKE_TIER;
    timestamp: number;
};

// Queue state
const waitingQueue: QueueEntry[] = [];
const activeMatches: Map<string, { matchId: string; p1: string; p2: string }> = new Map();

// For testing
export function resetMatchmaker() {
    waitingQueue.length = 0;
    activeMatches.clear();
}

// Helper to find a match
function findMatch(entry: QueueEntry): QueueEntry | undefined {
    return waitingQueue.find(
        (q) => q.gameType === entry.gameType && 
               q.stakeTier === entry.stakeTier && 
               q.address !== entry.address
    );
}

// 1. POST /queue - Enqueue player
matchmakerRouter.post('/queue', (req: Request, res: Response) => {
    const { address, gameType, stakeTier } = req.body;

    if (!address || !gameType || !stakeTier) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if player is already in queue
    const existingIdx = waitingQueue.findIndex(q => q.address === address);
    if (existingIdx !== -1) {
        // Just return their existing queueId
        return res.json({ queueId: waitingQueue[existingIdx].queueId });
    }

    const entry: QueueEntry = {
        queueId: crypto.randomUUID(),
        address,
        gameType,
        stakeTier,
        timestamp: Date.now()
    };

    const opponent = findMatch(entry);

    if (opponent) {
        // Match found!
        const matchId = `match_${crypto.randomUUID()}`;
        
        // Remove opponent from waiting queue
        waitingQueue.splice(waitingQueue.indexOf(opponent), 1);
        
        // Save active match state for both
        activeMatches.set(entry.queueId, { matchId, p1: opponent.address, p2: entry.address });
        activeMatches.set(opponent.queueId, { matchId, p1: opponent.address, p2: entry.address });
        
        return res.json({ queueId: entry.queueId, status: "matched", matchId });
    }

    // No opponent found, add to queue
    waitingQueue.push(entry);
    res.json({ queueId: entry.queueId, status: "waiting" });
});

// 2. GET /queue/:id - Poll for match status
matchmakerRouter.get('/queue/:id', (req: Request, res: Response) => {
    const queueId = req.params.id as string;

    // Check if matched
    const match = activeMatches.get(queueId);
    if (match) {
        // Optional: Clean up state after some time, but keeping it is fine for MVP
        return res.json({ status: "matched", matchId: match.matchId, p1: match.p1, p2: match.p2 });
    }

    // Check if still waiting
    const queueEntry = waitingQueue.find(q => q.queueId === queueId);
    if (queueEntry) {
        // 60-second timeout check
        if (Date.now() - queueEntry.timestamp > 60000) {
            waitingQueue.splice(waitingQueue.indexOf(queueEntry), 1);
            return res.json({ status: "timeout" });
        }
        return res.json({ status: "waiting" });
    }

    return res.status(404).json({ error: "Queue ID not found" });
});
