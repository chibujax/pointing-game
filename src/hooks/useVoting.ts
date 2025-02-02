import { useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { VoteResults } from '../types';

export const useVoting = () => {
	const { submitVote, revealVotes } = useSocket();
	const [selectedVote, setSelectedVote] = useState<number | null>(null);
	const [isRevealed, setIsRevealed] = useState(false);
	const [results, setResults] = useState<VoteResults | null>(null);

	const handleVote = useCallback(
		(vote: number) => {
			setSelectedVote(vote);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			submitVote(vote);
		},
		[submitVote],
	);

	const handleReveal = useCallback(() => {
		setIsRevealed(true);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		revealVotes();
	}, [revealVotes]);

	const resetVoting = useCallback(() => {
		setSelectedVote(null);
		setIsRevealed(false);
		setResults(null);
	}, []);

	return {
		selectedVote,
		isRevealed,
		results,
		handleVote,
		handleReveal,
		resetVoting,
	};
};
