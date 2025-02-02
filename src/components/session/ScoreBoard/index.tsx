{
	/* <div class="col-md-4">
<div class="card card-profile">
    <div id="scoreAdmin" style="display: none!important;" class="card-header text-center border-0">
        <div class="d-flex justify-content-between">
            <div id="revealBtn">
                <a href="javascript:reveal();" class="btn btn-sm btn-info mb-0">Reveal</a>
            </div>

            <a href="javascript:restart();" id="restart"
                class="btn btn-sm btn-dark float-right mb-0">Restart</a>
        </div>
    </div>
    <div class="card-body pt-0">
        <div class="text-center mt-4">
            <h5 id="average">
                Average: 0
            </h5>
            <h5 id="highestVote" style="display: none;">
                Highest Vote: 0
            </h5>
            <h5 id="lowestVote" style="display: none;">
                Lowest Vote: 0
            </h5>
            <h5 id="totalVoters" style="display: none;">
                Total Votes: 0
            </h5>
            <div id="allVoters" style="display: none; font-size: small;">
                Total Votes: 0
            </div>
        </div>
    </div>
</div>
</div> */
}
/**
 * This is the original app score board.
 * For a normal user, nothing shows until admin reveals the votes.
 */

import React from 'react';
import styled from 'styled-components';
import { VoteResults } from '../../../types';

interface ScoreBoardProps {
	results: VoteResults | null;
	revealed: boolean;
}

const BoardContainer = styled.div`
	background: white;
	border-radius: 8px;
	padding: 1.5rem;
	margin-bottom: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
`;

const StatTitle = styled.h5`
	margin: 0;
	color: var(--text-color);
`;

const StatValue = styled.span`
	font-weight: bold;
	color: var(--primary-color);
`;

const VoterList = styled.div`
	font-size: 0.875rem;
	color: var(--text-secondary);
	margin-top: 0.5rem;
`;

export const ScoreBoard = React.memo(({ results, revealed }: ScoreBoardProps) => {
	if (!revealed) return null;

	return (
		<div className="col-md-4">
			<div className="card card-profile">
				<BoardContainer>
					<StatHeader>
						<StatTitle>Average Score</StatTitle>
						<StatValue>{results?.average.toFixed(1)}</StatValue>
					</StatHeader>

					<StatHeader>
						<StatTitle>
							Highest Vote
							{results?.highestVotes && results?.highestVotes.value.length > 1
								? 's'
								: ''}
						</StatTitle>
						<StatValue>{results?.highestVotes.value.join(', ')}</StatValue>
					</StatHeader>
					<VoterList>
						{results?.highestVotes.voters.map((voter, index) => (
							<div key={index}>
								{Object.entries(voter).map(([id, vote]) => (
									<span key={id}>{vote}</span>
								))}
							</div>
						))}
					</VoterList>

					<StatHeader>
						<StatTitle>
							Lowest Vote
							{results?.lowestVotes && results?.lowestVotes.value.length > 1
								? 's'
								: ''}
						</StatTitle>
						<StatValue>{results?.lowestVotes.value.join(', ')}</StatValue>
					</StatHeader>
					<VoterList>
						{results?.lowestVotes.voters.map((voter, index) => (
							<div key={index}>
								{Object.entries(voter).map(([id, vote]) => (
									<span key={id}>{vote}</span>
								))}
							</div>
						))}
					</VoterList>

					<StatHeader>
						<StatTitle>Total Voters</StatTitle>
						<StatValue>{results?.totalVoters}</StatValue>
					</StatHeader>
				</BoardContainer>
			</div>
		</div>
	);
});

ScoreBoard.displayName = 'ScoreBoard';
