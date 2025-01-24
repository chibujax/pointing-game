import { Socket, io } from 'socket.io-client';

export class SocketClient {
	private socket: Socket;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private handlers: Map<string, ((...args: any[]) => void)[]> = new Map();

	constructor() {
		this.socket = io();
		this.setupBaseHandlers();
	}

	private setupBaseHandlers(): void {
		this.socket.on('setUserId', (userId: string) => {
			document.cookie = `userId=${userId}; path=/; Secure`;
		});

		this.socket.on('sessionError', (message: string) => {
			const handlers = this.handlers.get('sessionError') || [];
			handlers.forEach((handler) => handler(message));
		});
	}

	public on<T>(event: string, handler: (data: T) => void): void {
		const handlers = this.handlers.get(event) || [];
		handlers.push(handler);
		this.handlers.set(event, handlers);
		this.socket.on(event, handler);
	}

	public emit<T>(event: string, data: T): void {
		this.socket.emit(event, data);
	}

	public joinSession(sessionId: string, name: string, userId: string): void {
		this.emit('joinSession', { sessionId, name, userId });
		this.emit('getTitle', { sessionId });
	}

	public vote(point: number): void {
		this.emit('vote', { vote: point });
	}

	public disconnect(): void {
		this.socket.disconnect();
	}
}
