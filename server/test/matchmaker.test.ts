import request from 'supertest';
import express from 'express';
import { matchmakerRouter, resetMatchmaker } from '../src/matchmaker';

const app = express();
app.use(express.json());
app.use('/api', matchmakerRouter);

describe('Matchmaker API', () => {
    beforeEach(() => {
        resetMatchmaker();
    });

    it('should queue a player and return queueId', async () => {
        const res = await request(app)
            .post('/api/queue')
            .send({
                address: '0xPlayer1',
                gameType: 'Chess',
                stakeTier: 'Practice'
            });
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('waiting');
        expect(res.body.queueId).toBeDefined();
    });

    it('should match two players in the same bucket', async () => {
        const p1 = await request(app)
            .post('/api/queue')
            .send({ address: '0xAlice', gameType: 'Trivia', stakeTier: 'Pro' });
        
        expect(p1.body.status).toBe('waiting');

        const p2 = await request(app)
            .post('/api/queue')
            .send({ address: '0xBob', gameType: 'Trivia', stakeTier: 'Pro' });

        expect(p2.body.status).toBe('matched');
        expect(p2.body.matchId).toBeDefined();

        // Check P1 status now
        const p1Status = await request(app).get(`/api/queue/${p1.body.queueId}`);
        expect(p1Status.body.status).toBe('matched');
        expect(p1Status.body.matchId).toBe(p2.body.matchId);
    });

    it('should not match players in different buckets', async () => {
        const p1 = await request(app)
            .post('/api/queue')
            .send({ address: '0xCharlie', gameType: 'Chess', stakeTier: 'Standard' });
        
        const p2 = await request(app)
            .post('/api/queue')
            .send({ address: '0xDave', gameType: 'Chess', stakeTier: 'Elite' });

        expect(p1.body.status).toBe('waiting');
        expect(p2.body.status).toBe('waiting');
    });

    it('should reject duplicate address in queue', async () => {
        const p1 = await request(app)
            .post('/api/queue')
            .send({ address: '0xEve', gameType: 'Chess', stakeTier: 'Practice' });
        
        const p2 = await request(app)
            .post('/api/queue')
            .send({ address: '0xEve', gameType: 'Chess', stakeTier: 'Practice' });

        // Should return the same queueId
        expect(p1.body.queueId).toBe(p2.body.queueId);
    });
});
