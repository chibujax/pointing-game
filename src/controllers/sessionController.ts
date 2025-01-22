import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionService } from '../services/sessionService';

export class SessionController {
	constructor(private sessionService: SessionService) {}

	public createSession = (req: Request, res: Response): void => {
		const { sessionName, displayName, points } = req.body;
		const userId = uuidv4();

		const session = this.sessionService.createSession({
			name: sessionName,
			users: { [userId]: displayName },
			votes: {},
			points,
			owner: userId,
		});

		res.cookie('sessionId', session.id, { secure: true });
		res.cookie('userId', userId, { secure: true });
		res.cookie('owner', userId, { secure: true });
		res.cookie('name', displayName, { secure: true });

		res.json({ sessionId: session.id, userId });
	};

	public joinSession = (req: Request, res: Response): void => {
		const { sessionId } = req.params;
		const session = this.sessionService.getSession(sessionId);

		if (session) {
			res.sendFile('session.html', { root: './public' });
		} else {
			res.status(404).send('Session not found');
		}
	};
}
