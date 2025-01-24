export interface Vote {
	[userId: string]: number;
}

export interface VoteResults {
	votes: Vote;
	average: number;
	highestVotes: {
		value: number[];
		voters: Array<{ [userId: string]: number }>;
	};
	lowestVotes: {
		value: number[];
		voters: Array<{ [userId: string]: number }>;
	};
	otherVotes: Array<{ [userId: string]: number }>;
	totalVoters: number;
}

export interface User {
	id: string;
	name: string;
}

export interface SessionState {
	id: string;
	name: string;
	users: { [userId: string]: string };
	votes: Vote;
	points: number[];
	owner: string;
	voteTitle?: string;
}
