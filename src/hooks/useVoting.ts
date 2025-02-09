import { useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { VoteResults } from '../types';

export const useVoting = () => {
	const { submitVote, revealVotes, restartSession } = useSocket();
	const [selectedVote, setSelectedVote] = useState<number | null>(null);
	const [isRevealed, setIsRevealed] = useState(false);
	const [results, setResults] = useState<VoteResults | null>(null);

	const handleVote = useCallback(
		(vote: number) => {
			console.log('handleVote hook called');
			setSelectedVote(vote);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			submitVote(vote);
		},
		[submitVote],
	);

	const handleReveal = useCallback(() => {
		console.log('handleVote hook called');
		revealVotes();
		// console.log('Received vote results:', voteResults);
		// setResults(voteResults);
		// revealVotes();
		// setIsRevealed(true);
	}, [revealVotes]);

	const resetVoting = useCallback(() => {
		console.log('handleVote hook called');
		//setSelectedVote(null);
		//setIsRevealed(false);
		restartSession();
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
