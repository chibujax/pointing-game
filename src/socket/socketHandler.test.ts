import { Server, Socket } from 'socket.io';
import { SocketHandler } from './socketHandler';
import { SessionService } from '../services/sessionService';
import { VoteService } from '../services/voteService';

jest.mock('socket.io');
jest.mock('../services/sessionService');
jest.mock('../services/voteService');

describe('SocketHandler', () => {
	let socketHandler: SocketHandler;
	let mockIo: jest.Mocked<Server>;
	let mockSocket: jest.Mocked<Socket>;
	let mockSessionService: jest.Mocked<SessionService>;
	let mockVoteService: jest.Mocked<VoteService>;

	beforeEach(() => {
		mockIo = {
			to: jest.fn().mockReturnThis(),
			emit: jest.fn(),
		} as unknown as jest.Mocked<Server>;

		mockSessionService = {
			createSession: jest.fn(),
			getSession: jest.fn(),
			updateSession: jest.fn(),
			deleteSession: jest.fn(),
			addUserToSession: jest.fn(),
			removeUserFromSession: jest.fn(),
		} as unknown as jest.Mocked<SessionService>;

		mockVoteService = {
			processVotes: jest.fn(),
		} as unknown as jest.Mocked<VoteService>;

		socketHandler = new SocketHandler(mockIo, mockSessionService, mockVoteService);

		mockSocket = {
			handshake: {
				headers: { cookie: '' },
			},
			emit: jest.fn(),
			on: jest.fn(),
			join: jest.fn(),
		} as unknown as jest.Mocked<Socket>;

		mockIo.to = jest.fn().mockReturnThis();
		mockIo.emit = jest.fn();
	});

	describe('handleConnection', () => {
		it('should set userId for new connection without cookie', () => {
			socketHandler.handleConnection(mockSocket);
			expect(mockSocket.emit).toHaveBeenCalledWith('setUserId', expect.any(String));
		});

		it('should use existing userId from cookie', () => {
			mockSocket.handshake.headers.cookie = 'userId=existing-user-id';
			socketHandler.handleConnection(mockSocket);
			expect(mockSocket.emit).not.toHaveBeenCalledWith('setUserId', expect.any(String));
		});

		it('should handle joinSession event', () => {
			const mockSession = {
				id: 'test-session',
				name: 'Test Session',
				users: {},
				votes: {},
				points: [1, 2, 3],
				owner: 'owner-id',
			};

			mockSessionService.getSession.mockReturnValue(mockSession);
			mockSessionService.addUserToSession.mockReturnValue(true);

			mockSocket.on.mockImplementation((event, callback) => {
				if (event === 'joinSession') {
					callback({ sessionId: 'test-session', name: 'Test User' });
				}
				return mockSocket;
			});

			socketHandler.handleConnection(mockSocket);

			expect(mockSocket.join).toHaveBeenCalledWith('test-session');
			expect(mockIo.to).toHaveBeenCalledWith('test-session');
		});

		it('should handle session not found error', () => {
			mockSessionService.getSession.mockReturnValue(null);

			mockSocket.on.mockImplementation((event, callback) => {
				if (event === 'joinSession') {
					callback({ sessionId: 'nonexistent', name: 'Test User' });
				}
				return mockSocket;
			});

			socketHandler.handleConnection(mockSocket);

			expect(mockSocket.emit).toHaveBeenCalledWith('sessionError', 'Session not found');
		});
	});
});
