import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { SessionService } from '../services/sessionService';
import { VoteService } from '../services/voteService';

export class SocketHandler {
  constructor(
    private io: Server,
    private sessionService: SessionService,
    private voteService: VoteService
  ) {}

  public handleConnection(socket: Socket): void {
    let currentSessionId: string | null = null;
    let userId: string;

    // Extract userId from cookies
    const cookies = socket.handshake.headers.cookie?.split('; ') || [];
    const userIdCookie = cookies.find(row => row.startsWith('userId='));
    userId = userIdCookie ? userIdCookie.split('=')[1] : uuidv4();

    if (!userIdCookie) {
      socket.emit('setUserId', userId);
    }

    socket.on('joinSession', ({ sessionId, name }) => {
      const session = this.sessionService.getSession(sessionId);
      if (!session) {
        return socket.emit('sessionError', 'Session not found');
      }

      currentSessionId = sessionId;
      this.sessionService.addUserToSession(sessionId, userId, name);
      socket.join(sessionId);

      // Emit session info
      this.io.to(sessionId).emit('userList', Object.entries(session.users));
      this.io.to(sessionId).emit('updatePoints', session.points);
      this.io.to(sessionId).emit('sessionName', session.name);
      this.io.to(sessionId).emit('updateOwner', session.owner);
      this.sendCurrentVotesToUsers(sessionId);
    });

    // ... implement other socket event handlers similarly
  }

  private sendCurrentVotesToUsers(sessionId: string): void {
    const session = this.sessionService.getSession(sessionId);
    if (!session) return;

    const votedUsers = Object.entries(session.votes).reduce((result, [userId, vote]) => {
      if (vote !== undefined) {
        result[userId] = vote;
      }
      return result;
    }, {} as { [key: string]: number });

    this.io.to(sessionId).emit('currentVotes', votedUsers);
  }
}