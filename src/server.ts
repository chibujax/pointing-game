import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import { SessionService } from './services/sessionService';
import { VoteService } from './services/voteService';
import { SessionController } from './controllers/sessionController';
import { SocketHandler } from './socket/socketHandler';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const sessionService = new SessionService();
const voteService = new VoteService();
const sessionController = new SessionController(sessionService);
const socketHandler = new SocketHandler(io, sessionService, voteService);

app.use(express.static('dist/public'));
app.use(cookieParser());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../dist/public/images')));

app.get('/', (req, res) => res.sendFile('index.html', { root: '.dist/public' }));
app.post('/create-session', sessionController.createSession);
app.get('/:sessionId', sessionController.joinSession);

io.on('connection', (socket) => socketHandler.handleConnection(socket));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
