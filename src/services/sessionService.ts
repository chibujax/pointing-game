import fs from 'fs';
import path from 'path';
import { Session } from '../types/session';

export class SessionService {
	private sessions: { [sessionId: string]: Session };
	private readonly sessionsFilePath: string;

	constructor() {
		this.sessionsFilePath = path.join(__dirname, '../../sessions.json');
		this.sessions = this.loadSessions();
	}

	private loadSessions(): { [sessionId: string]: Session } {
		try {
			if (fs.existsSync(this.sessionsFilePath)) {
				return JSON.parse(fs.readFileSync(this.sessionsFilePath, 'utf8'));
			}
		} catch (error) {
			console.error('Error loading sessions:', error);
		}
		return {};
	}

	private saveSessionsToFile(): void {
		try {
			fs.writeFileSync(this.sessionsFilePath, JSON.stringify(this.sessions, null, 2), 'utf8');
		} catch (error) {
			console.error('Error saving sessions:', error);
		}
	}

	public createSession(sessionData: Partial<Session>): Session {
		const sessionId = `session_${Date.now()}`;
		const session: Session = {
			id: sessionId,
			...sessionData,
		} as Session;

		this.sessions[sessionId] = session;
		this.saveSessionsToFile();
		return session;
	}

	public getSession(sessionId: string): Session | null {
		return this.sessions[sessionId] || null;
	}

	public updateSession(sessionId: string, updates: Partial<Session>): Session | null {
		if (!this.sessions[sessionId]) return null;

		this.sessions[sessionId] = {
			...this.sessions[sessionId],
			...updates,
		};

		this.saveSessionsToFile();
		return this.sessions[sessionId];
	}

	public deleteSession(sessionId: string): boolean {
		if (!this.sessions[sessionId]) return false;

		delete this.sessions[sessionId];
		this.saveSessionsToFile();
		return true;
	}

	public addUserToSession(sessionId: string, userId: string, name: string): boolean {
		const session = this.sessions[sessionId];
		if (!session) return false;

		session.users[userId] = name;
		this.saveSessionsToFile();
		return true;
	}

	public removeUserFromSession(sessionId: string, userId: string): boolean {
		const session = this.sessions[sessionId];
		if (!session) return false;

		delete session.users[userId];
		delete session.votes[userId];
		this.saveSessionsToFile();
		return true;
	}
}
