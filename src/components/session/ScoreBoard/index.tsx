import { memo, useMemo } from 'react';
import { AdminControls, AdminControlProps } from '../AdminControls';
import { User, VoteResults } from '@/types';

interface ResultControlProps extends AdminControlProps {
	voteResult: VoteResults | null;
	users: User[];
	isAdmin: boolean;
}

interface VoterDisplayProps {
	voters: Array<{ [key: string]: number }>;
	users: Record<string, string>;
	title: string;
	score: string;
	color: string;
}
const Stats = ({ title, value, color = 'bg-dark' }): JSX.Element => {
	return (
		<div className="col-lg-6 col-12">
			<div className={`card card-frame ms-sm-3 my-sm-3 ${color} text-white`}>
				<div className="card-body">
					<div className="font-weight-bolder">{title}</div>
					<div id="averageVotes" className="font-weight-bold">
						{value}
					</div>
				</div>
			</div>
		</div>
	);
};

const VoterDisplay = ({ voters, users, title, score, color }: VoterDisplayProps): JSX.Element => {
	return (
		<div className="col-lg-4 col-12" style={{ display: 'flex', flexDirection: 'column' }}>
			<div
				className={`card card-frame ms-sm-3 mt-sm-3 ${color} text-white`}
				style={{ flex: 1 }}
			>
				<div className="card-body">
					<div className="font-weight-bolder">{title}</div>
					<div id="highestVote" className="font-weight-bold">
						{score}
					</div>
					<div className="text-xxs">
						{voters.map((voter) => {
							const userId: string = Object.keys(voter)[0];
							const vote = voter[userId];
							const userName = users[userId];
							return (
								<span key={userId}>
									{userName}: {vote}
									<br />
								</span>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export const ScoreBoard = memo(
	({
		handleReveal,
		handleRestart,
		isRevealed,
		hasVote,
		voteResult,
		isAdmin,
		users,
	}: ResultControlProps) => {
		const sanitizedUsers = useMemo(() => {
			return users.reduce((map: Record<string, string>, item: User) => {
				map[item.id] = item.name;
				return map;
			}, {});
		}, [users]);
		console.log('users in score', sanitizedUsers);
		return (
			<div className="col-md-4">
				<div className="card card-profile">
					<div id="scoreAdmin" className="card-header text-center border-0">
						{isAdmin && (
							<AdminControls
								handleReveal={handleReveal}
								handleRestart={handleRestart}
								isRevealed={isRevealed}
								hasVote={hasVote}
							/>
						)}
						<h4>Result</h4>
					</div>
					{isRevealed && voteResult && (
						<div className="card-body pt-0">
							<div className="text-center mt-4">
								<div
									id="scoreBoard2"
									style={{ display: 'block' }}
									className="bg-gray-100"
								>
									<div className="row">
										{' '}
										<VoterDisplay
											voters={voteResult.highestVotes.voters}
											users={sanitizedUsers}
											title={'Highest Vote:'}
											score={voteResult.highestVotes.value.join(', ')}
											color={'bg-primary'}
										/>
										<VoterDisplay
											voters={voteResult.lowestVotes.voters}
											users={sanitizedUsers}
											title={'Lowest Vote:'}
											score={voteResult.lowestVotes.value.join(', ')}
											color={'bg-info'}
										/>
										<VoterDisplay
											voters={voteResult.otherVotes}
											users={sanitizedUsers}
											title={'Other Votes:'}
											score={''}
											color={'bg-success'}
										/>
									</div>
									<div className="row">
										<Stats title={'Average'} value={voteResult.average} />
										<Stats
											title={'Total'}
											value={voteResult.totalVoters}
											color={'bg-warning'}
										/>
									</div>

									{/* <div className="mb-4">
									<h5 className="mb-2">Average Score</h5>
									<p className="text-lg font-semibold">
										{voteResult.average.toFixed(2)}
									</p>
								</div>

								<div className="mb-4">
									<h5 className="mb-2">
										Highest Votes ({voteResult.highestVotes.value.join(', ')})
									</h5>
									<VoterDisplay
										voters={voteResult.highestVotes.voters}
										users={sanitizedUsers}
									/>
								</div>

								<div className="mb-4">
									<h5 className="mb-2">
										Lowest Votes ({voteResult.lowestVotes.value.join(', ')})
									</h5>
									<VoterDisplay
										voters={voteResult.lowestVotes.voters}
										users={sanitizedUsers}
									/>
								</div>

								{voteResult.otherVotes.length > 0 && (
									<div className="mb-4">
										<h5 className="mb-2">Other Votes</h5>
										<VoterDisplay
											voters={voteResult.otherVotes}
											users={sanitizedUsers}
										/>
									</div>
								)}

								<div>
									<h5 className="mb-2">Total Voters</h5>
									<p className="text-lg font-semibold">
										{voteResult.totalVoters}
									</p>
								</div> */}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	},
);

ScoreBoard.displayName = 'ScoreBoard';
