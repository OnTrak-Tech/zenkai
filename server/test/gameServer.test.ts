import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { setupWebSocketServer } from '../src/gameServer';

describe('Game Server WebSocket', () => {
    let server: Server;
    let wss: WebSocketServer;
    let port: number;

    beforeAll((done) => {
        server = createServer();
        server.listen(0, '127.0.0.1', () => {
            port = (server.address() as any).port;
            wss = new WebSocketServer({ server });
            setupWebSocketServer(wss);
            done();
        });
    });

    afterAll((done) => {
        wss.close();
        server.close(done);
    });

    it('should connect two players and relay moves', (done) => {
        const matchId = 'match_test_1';
        
        const ws1 = new WebSocket(`ws://127.0.0.1:${port}/game/${matchId}?address=0xPlayer1`);
        let ws2: WebSocket;

        ws1.on('open', () => {
            ws2 = new WebSocket(`ws://127.0.0.1:${port}/game/${matchId}?address=0xPlayer2`);
            
            ws2.on('open', () => {
                // Send a move from Player 1
                ws1.send(JSON.stringify({ type: 'move', payload: { from: 'e2', to: 'e4' } }));
            });

            ws2.on('message', (msg) => {
                const data = JSON.parse(msg.toString());
                expect(data.type).toBe('move');
                expect(data.payload.from).toBe('e2');
                expect(data.payload.to).toBe('e4');
                expect(data.timestamp).toBeDefined();
                
                ws1.close();
                ws2.close();
                done();
            });
        });
    });

    it('should reject a third player', (done) => {
        const matchId = 'match_test_2';
        
        const ws1 = new WebSocket(`ws://127.0.0.1:${port}/game/${matchId}?address=0xP1`);
        ws1.on('open', () => {
            const ws2 = new WebSocket(`ws://127.0.0.1:${port}/game/${matchId}?address=0xP2`);
            ws2.on('open', () => {
                const ws3 = new WebSocket(`ws://127.0.0.1:${port}/game/${matchId}?address=0xP3`);
                
                ws3.on('close', (code, reason) => {
                    expect(code).toBe(1008);
                    expect(reason.toString()).toBe('Match full');
                    ws1.close();
                    ws2.close();
                    done();
                });
            });
        });
    });
});
