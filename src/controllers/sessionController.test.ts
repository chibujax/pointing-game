import fs from 'fs';
import path from 'path';
import { SessionService } from '../services/sessionService';
import { Session } from '../types/session';

jest.mock('fs');
jest.mock('path');

describe('SessionService', () => {
	let sessionService: SessionService;
	const mockSession: Partial<Session> = {
		name: 'Test Session',
		users: { user1: 'John' },
		votes: {},
		points: [1, 2, 3],
		owner: 'user1',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(path.join as jest.Mock).mockReturnValue('test/path/sessions.json');
		(fs.existsSync as jest.Mock).mockReturnValue(true);
		(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({}));
		sessionService = new SessionService();
	});

	describe('createSession', () => {
		it('should create a new session with correct data', () => {
			const session = sessionService.createSession(mockSession);
			expect(session).toMatchObject({
				...mockSession,
				id: expect.stringContaining('session_'),
			});
		});

		it('should save session to file', () => {
			sessionService.createSession(mockSession);
			expect(fs.writeFileSync).toHaveBeenCalled();
		});
	});

	describe('getSession', () => {
		it('should return null for non-existent session', () => {
			const result = sessionService.getSession('nonexistent');
			expect(result).toBeNull();
		});

		it('should return session if exists', () => {
			const session = sessionService.createSession(mockSession);
			const result = sessionService.getSession(session.id);
			expect(result).toEqual(session);
		});
	});

	describe('updateSession', () => {
		it('should update existing session', () => {
			const session = sessionService.createSession(mockSession);
			const updates = { name: 'Updated Session' };
			const result = sessionService.updateSession(session.id, updates);
			expect(result?.name).toBe('Updated Session');
		});

		it('should return null for non-existent session', () => {
			const result = sessionService.updateSession('nonexistent', { name: 'test' });
			expect(result).toBeNull();
		});
	});

	describe('deleteSession', () => {
		it('should delete existing session', () => {
			const session = sessionService.createSession(mockSession);
			const result = sessionService.deleteSession(session.id);
			expect(result).toBe(true);
			expect(sessionService.getSession(session.id)).toBeNull();
		});

		it('should return false for non-existent session', () => {
			const result = sessionService.deleteSession('nonexistent');
			expect(result).toBe(false);
		});
	});

	describe('addUserToSession', () => {
		it('should add user to existing session', () => {
			const session = sessionService.createSession(mockSession);
			const result = sessionService.addUserToSession(session.id, 'user2', 'Jane');
			expect(result).toBe(true);
			const updatedSession = sessionService.getSession(session.id);
			expect(updatedSession?.users['user2']).toBe('Jane');
		});

		it('should return false for non-existent session', () => {
			const result = sessionService.addUserToSession('nonexistent', 'user2', 'Jane');
			expect(result).toBe(false);
		});
	});
});
