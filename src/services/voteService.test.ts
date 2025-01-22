import { VoteService } from './voteService';
import { Vote } from '../types/session';

describe('VoteService', () => {
	let voteService: VoteService;

	beforeEach(() => {
		voteService = new VoteService();
	});

	describe('processVotes', () => {
		it('should return empty result for no votes', () => {
			const result = voteService.processVotes({});
			expect(result).toEqual({
				votes: {},
				average: 0,
				highestVotes: { value: [], voters: [] },
				lowestVotes: { value: [], voters: [] },
				otherVotes: [],
				totalVoters: 0,
			});
		});

		it('should correctly process votes with single highest value', () => {
			const votes: Vote = {
				user1: 5,
				user2: 5,
				user3: 3,
			};

			const result = voteService.processVotes(votes);
			expect(result.average).toBe(4.333333333333333);
			expect(result.highestVotes.value).toEqual([5]);
			expect(result.highestVotes.voters).toHaveLength(2);
			expect(result.lowestVotes.value).toEqual([3]);
			expect(result.totalVoters).toBe(3);
		});

		it('should correctly identify multiple highest values', () => {
			const votes: Vote = {
				user1: 5,
				user2: 5,
				user3: 3,
				user4: 3,
			};

			const result = voteService.processVotes(votes);
			expect(result.highestVotes.value).toEqual([3, 5]);
			expect(result.totalVoters).toBe(4);
		});
	});
});
