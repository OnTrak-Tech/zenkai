import { WebSocket, WebSocketServer } from 'ws';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celoAlfajores } from 'viem/chains';
import { GameTranscript, MoveRecord } from '@zenkai/shared';

// Load Game Server Private Key
const privateKey = process.env.GAME_SERVER_PK as `0x${string}` || "0x0000000000000000000000000000000000000000000000000000000000000001";
const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
    account,
    chain: celoAlfajores,
    transport: http()
}).extend(publicActions);

const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS as `0x${string}`;

type PlayerConnection = {
    ws: WebSocket;
    address: string;
    lastPing: number;
};

type GameSession = {
    matchId: string;
    gameType: string;
    p1?: PlayerConnection;
    p2?: PlayerConnection;
    transcript: GameTranscript;
    movesCount: number;
    lastAnchorTime: number;
};

const activeGames: Map<string, GameSession> = new Map();

// Helper: Call ZenkaiEscrow.recordForfeit
async function recordForfeit(matchId: string, forfeitingPlayer: string) {
    console.log(`[GameServer] Recording forfeit for match ${matchId}, player ${forfeitingPlayer}`);
    if (!ESCROW_ADDRESS) return; // Skip if no contract configured (e.g. tests)
    
    try {
        // Minimal ABI for recordForfeit
        const abi = [{
            "inputs": [
                { "internalType": "bytes32", "name": "matchId", "type": "bytes32" },
                { "internalType": "address", "name": "forfeitingPlayer", "type": "address" }
            ],
            "name": "recordForfeit",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }];

        // In a real implementation we would convert the string matchId to bytes32 properly based on our contract logic
        // For MVP we assume matchId is a bytes32 string
        const hash = await walletClient.writeContract({
            address: ESCROW_ADDRESS,
            abi,
            functionName: 'recordForfeit',
            args: [matchId as `0x${string}`, forfeitingPlayer as `0x${string}`]
        });
        console.log(`[GameServer] Forfeit tx hash: ${hash}`);
    } catch (e) {
        console.error(`[GameServer] Forfeit tx failed`, e);
    }
}

export function setupWebSocketServer(wss: WebSocketServer) {
    wss.on('connection', (ws: WebSocket, req) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const matchId = url.pathname.split('/').pop();
        const playerAddress = url.searchParams.get('address');

        if (!matchId || !playerAddress) {
            ws.close(1008, "Missing matchId or address");
            return;
        }

        let session = activeGames.get(matchId);
        if (!session) {
            session = {
                matchId,
                gameType: "Chess", // Fallback, should come from matchmaker DB in full app
                transcript: {
                    gameId: matchId,
                    gameType: "Chess",
                    seed: "0x0", // Should come from escrow
                    player1: playerAddress,
                    player2: "",
                    moves: []
                },
                movesCount: 0,
                lastAnchorTime: Date.now()
            };
            activeGames.set(matchId, session);
        }

        const connection: PlayerConnection = { ws, address: playerAddress, lastPing: Date.now() };

        if (!session.p1) session.p1 = connection;
        else if (!session.p2) {
            session.p2 = connection;
            session.transcript.player2 = playerAddress;
        } else {
            ws.close(1008, "Match full");
            return;
        }

        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());

            if (data.type === 'ping') {
                connection.lastPing = Date.now();
                ws.send(JSON.stringify({ type: 'pong' }));
                return;
            }

            if (data.type === 'move') {
                const moveRecord: MoveRecord = {
                    player: playerAddress,
                    moveData: data.payload,
                    timestamp: Date.now()
                };
                
                session!.transcript.moves.push(moveRecord);
                session!.movesCount++;

                // Relay to opponent
                const opponent = session!.p1?.address === playerAddress ? session!.p2 : session!.p1;
                if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
                    opponent.ws.send(JSON.stringify({ type: 'move', payload: data.payload, timestamp: moveRecord.timestamp }));
                }

                // Batch anchoring logic (stubbed)
                if (session!.movesCount % 10 === 0 || (Date.now() - session!.lastAnchorTime > 30000)) {
                    // console.log("Anchoring move hashes...");
                    session!.lastAnchorTime = Date.now();
                }
            }
            
            if (data.type === 'game_end') {
                // Emit final transcript
                session!.transcript.endTime = Date.now();
                session!.transcript.winner = data.winner;
                
                const finalPayload = JSON.stringify({ type: 'game_end', transcript: session!.transcript });
                if (session!.p1) session!.p1.ws.send(finalPayload);
                if (session!.p2) session!.p2.ws.send(finalPayload);
            }
        });

        ws.on('close', () => {
            // Disconnect timeout logic
            setTimeout(() => {
                const s = activeGames.get(matchId);
                if (s) {
                    // Check if player hasn't reconnected (this MVP simply records forfeit)
                    recordForfeit(matchId, playerAddress);
                }
            }, 60000); // 60s grace period
        });
    });
}
