import { Server, Socket } from 'socket.io';
import { SessionService } from '../services/sessionService';
import { VoteService } from '../services/voteService';

export class SocketHandler {
  private socketToUserId: Map<string, string> = new Map();
  private userIdToSocket: Map<string, string> = new Map();

  constructor(
    private io: Server,
    private sessionService: SessionService,
    private voteService: VoteService
  ) {}

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
    console.log('Session:', this.sessionService.sessions);

    const userId = socket.handshake.query.userId as string;
    if (userId) {
      const existingSocketId = this.userIdToSocket.get(userId);
      if (existingSocketId) {
        this.socketToUserId.delete(existingSocketId);
      }
      this.socketToUserId.set(socket.id, userId);
      this.userIdToSocket.set(userId, socket.id);
    }
    console.log('socketToUserId:', this.socketToUserId);
    console.log('userIdToSocket:', this.userIdToSocket);

    socket.on('joinSession', (data: { sessionId: string; name: string }) => {
      const { sessionId, name } = data;
      console.log(`Join session request received for session ${sessionId} from ${name}`);
      console.log("session now ", this.sessionService.sessions);
      const session = this.sessionService.getSession(sessionId);
      const userId = this.socketToUserId.get(socket.id);

      if (!session || !userId) {
        socket.emit('error', 'Session not found');
        return;
      }

      socket.join(sessionId);
      this.sessionService.addUserToSession(sessionId, userId, name);
      
      const updatedSession = this.sessionService.getSession(sessionId);
      if (updatedSession) {
        const userList = Object.entries(updatedSession.users);
        this.io.to(sessionId).emit('userList', userList);
      }
    });

    socket.on('submitVote', (data: { vote: number }) => {
      const userId = this.socketToUserId.get(socket.id);
      const session = this.findUserSession(userId);
      if (!session || !userId) return;

      const currentVote = session.votes[userId];
      let positiveVote = true;
      if (currentVote === data.vote) {
        delete session.votes[userId];
        positiveVote = false;
      } else {
        session.votes[userId] = data.vote;
      }

      const updatedSession = this.sessionService.updateSession(session.id, { votes: session.votes });
      if(updatedSession){
        const votedUsers = Object.keys(updatedSession.votes);
        console.log("voted users: ", votedUsers)
        this.io.to(session.id).emit('voteUpdate', {
          votedUsers: votedUsers
        });
      }
    });

    socket.on('revealVotes', () => {
      const userId = this.socketToUserId.get(socket.id);
      const session = this.findUserSession(userId);
      if (!session) return;

      const results = this.voteService.processVotes(session.votes);
      this.io.to(session.id).emit('voteResults', results);

    });

    socket.on('restartSession', () => {
      const userId = this.socketToUserId.get(socket.id);
      const session = this.findUserSession(userId);
      if (!session) return;

      this.sessionService.updateSession(session.id, { votes: {} });
      this.io.to(session.id).emit('sessionRestarted');
    });

    socket.on('disconnect', () => {
      const userId = this.socketToUserId.get(socket.id);
      if (!userId) return;

      const session = this.findUserSession(userId);
      if (this.userIdToSocket.get(userId) === socket.id) {
        this.userIdToSocket.delete(userId);
        this.socketToUserId.delete(socket.id);
        
        if (session) {
          this.sessionService.removeUserFromSession(session.id, userId);
          const userList = Object.entries(session.users);
          this.io.to(session.id).emit('userList', userList);
        }
      }
    });

    socket.on('leaveSession', () => {
      const userId = this.socketToUserId.get(socket.id);
      if (!userId) return;
    
      const session = this.findUserSession(userId);
      if (!session) return;
    
      this.sessionService.removeUserFromSession(session.id, userId);
      socket.leave(session.id);
      this.socketToUserId.delete(socket.id);
      this.userIdToSocket.delete(userId);
    
      const updatedSession = this.sessionService.getSession(session.id);
      if (updatedSession) {
        const userList = Object.entries(updatedSession.users);
        this.io.to(session.id).emit('userList', userList);
      }
      
      console.log(`User ${userId} left session ${session.id}`);
    });

    socket.on('endSession', () => {
      const userId = this.socketToUserId.get(socket.id);
      const session = this.findUserSession(userId);
      
      if (!session || !userId || session.owner !== userId) {
        console.log('Cannot end session:', { userId, owner: session?.owner });
        return;
      }
      
      this.io.to(session.id).emit('sessionEnded');
      this.sessionService.deleteSession(session.id);
      
      const room = this.io.sockets.adapter.rooms.get(session.id);
      if (room) {
        room.forEach(socketId => {
          const socket = this.io.sockets.sockets.get(socketId);
          socket?.leave(session.id);
        });
      }
    });
  }

  private findUserSession(userId: string | undefined) {
    if (!userId) return null;
    
    for (const session of this.sessionService.sessions.values()) {
      if (session.users[userId]) {
        return session;
      }
    }
    return null;
  }
}