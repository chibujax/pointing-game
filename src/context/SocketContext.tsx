import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { VoteResults } from '../types';
import { useUserStore } from '../stores/userStore';
import { config } from '../config';

interface SocketContextValue {
	isConnected: boolean;
	joinSession: (sessionId: string, name: string) => void;
	leaveSession: () => void;
	submitVote: (vote: number) => void;
	revealVotes: () => void;
	restartSession: () => void;
	endSession: () => void;
	setVoteTitle: (title: string) => void;
	on: <T = any>(event: string, handler: (data: T) => void) => void;
	off: <T = any>(event: string, handler: (data: T) => void) => void;
}

interface SocketProviderProps {
	children: React.ReactNode;
	onUserUpdate?: (users: Array<[string, string]>) => void;
	onVoteUpdate?: (votes: string[]) => void;
	onVoteReveal?: (results: VoteResults) => void;
	onSessionEnd?: () => void;
	onError?: (error: string) => void;
}

interface UserListProps {
	userList: Array<[string, string]>;
	votedUsers: string[];
}

export const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({
	children,
	onUserUpdate,
	onVoteUpdate,
	onVoteReveal,
	onSessionEnd,
	onError,
}: SocketProviderProps) => {
	const socketRef = useRef<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const userId = useUserStore((state) => state.userId);

	const connect = useCallback(() => {
		if (!socketRef.current) {
			socketRef.current = io(config.wsUrl, {
				query: { userId },
				transports: ['websocket'],
				autoConnect: true,
			});

			setupEventHandlers(socketRef.current);
		}
	}, [userId]);

	const setupEventHandlers = (socket: Socket) => {
		socket.on('connect', () => setIsConnected(true));
		socket.on('disconnect', () => setIsConnected(false));

		socket.on('userList', (props: UserListProps) => {
			console.log("Received userList event with users:", props);
			onUserUpdate?.(props.userList);
			onVoteUpdate?.(props.votedUsers);
		});

		socket.on('voteUpdate', (votes: string[]) => {
			console.log("Received voteUpdate event with votes:", votes);
			onVoteUpdate?.(votes);
		});

		socket.on('voteReveal', (results: VoteResults) => {
			onVoteReveal?.(results);
		});

		socket.on('sessionEnded', () => {
			onSessionEnd?.();
		});

		socket.on('error', (error: string) => {
			onError?.(error);
		});
	};

	const on = useCallback(<T = any>(event: string, handler: (data: T) => void) => {
		socketRef.current?.on(event, handler);
	}, []);

	const off = useCallback(<T = any,>(event: string, handler: (data: T) => void) => {
		socketRef.current?.off(event, handler);
	}, []);

	const joinSession = useCallback((sessionId: string, name: string) => {
		socketRef.current?.emit('joinSession', { sessionId, name });
	}, []);

	const leaveSession = useCallback(() => {
		console.log('Leaving session...');
		socketRef.current?.emit('leaveSession');
	}, []);

	const submitVote = useCallback((vote: number): void => {
		socketRef.current?.emit('submitVote', { vote });
	}, []);

	const revealVotes = useCallback(() => {
		socketRef.current?.emit('revealVotes');
	}, []);

	const restartSession = useCallback(() => {
		socketRef.current?.emit('restartSession');
	}, []);

	const endSession = useCallback(() => {
		console.log("ending session")
		socketRef.current?.emit('endSession');
	}, []);

	const setVoteTitle = useCallback((title: string) => {
		socketRef.current?.emit('setVoteTitle', { title });
	}, []);

	useEffect(() => {
		connect();
		return () => {
			socketRef.current?.disconnect();
			socketRef.current = null;
		};
	}, [connect]);

	return (
		<SocketContext.Provider
			value={{
				isConnected,
				joinSession,
				leaveSession,
				submitVote,
				revealVotes,
				restartSession,
				endSession,
				setVoteTitle,
				on,
				off,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
};
