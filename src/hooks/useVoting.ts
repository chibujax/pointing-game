import { useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

interface UseVoting {
	handleVote: (vote: number) => void;
	handleReveal: () => void;
	resetVoting: () => void;
}

export const useVoting = (): UseVoting => {
	const { submitVote, revealVotes, restartSession } = useSocket();
	const handleVote = useCallback(
		(vote: number) => {
			submitVote(vote);
		},
		[submitVote],
	);

	const handleReveal = useCallback(() => {
		revealVotes();
	}, [revealVotes]);

	const resetVoting = useCallback(() => {
		restartSession();
	}, [restartSession]);

	return {
		handleVote,
		handleReveal,
		resetVoting,
	};
};
