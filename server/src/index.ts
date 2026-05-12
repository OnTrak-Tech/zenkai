import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { matchmakerRouter } from './matchmaker';
import { setupWebSocketServer } from './gameServer';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ status: 'Zenkai Game Server', message: 'Server is running.' });
});

app.get('/health', (req, res) => {
    res.send({ status: 'ok' });
});

// Attach Matchmaker API
app.use('/api', matchmakerRouter);

// Create HTTP server
const server = createServer(app);

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server });
setupWebSocketServer(wss);

server.listen(port, () => {
    console.log(`Zenkai Game Server & Matchmaker running on port ${port}`);
});
