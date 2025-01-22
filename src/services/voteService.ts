import { Session, Vote, VoteResults } from '../types/session';

export class VoteService {
  public processVotes(votes: Vote): VoteResults {
    if (Object.keys(votes).length === 0) {
      return this.getEmptyVoteResult();
    }

    const voteEntries = Object.entries(votes);
    const totalVoters = voteEntries.length;

    const voteCount: { [key: number]: number } = {};
    voteEntries.forEach(([, vote]) => {
      voteCount[vote] = (voteCount[vote] || 0) + 1;
    });

    const maxVoteCount = Math.max(...Object.values(voteCount));
    const minVoteCount = Math.min(...Object.values(voteCount));

    const highestVoteValues = Object.entries(voteCount)
      .filter(([, count]) => count === maxVoteCount)
      .map(([value]) => parseInt(value));

    const lowestVoteValues = Object.entries(voteCount)
      .filter(([, count]) => count === minVoteCount)
      .map(([value]) => parseInt(value));


    const highestVotes: Array<{ [key: string]: number }> = [];
    const lowestVotes: Array<{ [key: string]: number }> = [];
    const otherVotes: Array<{ [key: string]: number }> = [];

    voteEntries.forEach(([userId, vote]) => {
      const voteObj = { [userId]: vote };
      if (highestVoteValues.includes(vote)) {
        highestVotes.push(voteObj);
      } else if (lowestVoteValues.includes(vote)) {
        lowestVotes.push(voteObj);
      } else {
        otherVotes.push(voteObj);
      }
    });

    const sum = voteEntries.reduce((acc, [, vote]) => acc + vote, 0);
    const average = sum / totalVoters;

    return {
      votes,
      average,
      highestVotes: { value: highestVoteValues, voters: highestVotes },
      lowestVotes: { value: lowestVoteValues, voters: lowestVotes },
      otherVotes,
      totalVoters,
    };
  }

  private getEmptyVoteResult(): VoteResults {
    return {
      votes: {},
      average: 0,
      highestVotes: { value: [], voters: [] },
      lowestVotes: { value: [], voters: [] },
      otherVotes: [],
      totalVoters: 0,
    };
  }
}