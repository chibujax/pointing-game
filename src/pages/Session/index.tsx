import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useSession } from '../../hooks/useSession';
import { useVoting } from '../../hooks/useVoting';
import { VoteCard } from '../../components/session/VoteCard';
import { UserBoard } from '../../components/session/UserCard';
import { ScoreBoard } from '../../components/session/ScoreBoard';
import { AdminControls } from '../../components/session/AdminControls';
import { JoinSession } from './JoinSession';
import { useUserStore } from '../../stores/userStore';
import { SessionHeader } from '@/components/layout/Header';
import mediacity from '../../assets/images/mediacity.jpg';
import { TopNav } from '@/components/ui/Topnav';
import { MidNav } from '@/components/ui/Midnav';
import { useSessionStore } from '@/stores/sessionStore';
import { useVoteStore } from '@/stores/voteStore';

const SessionPage = (): JSX.Element => {
	const { sessionId = '' } = useParams();
	const navigate = useNavigate();
	const [showJoin, setShowJoin] = useState(false);
	const [isValidating, setIsValidating] = useState(true);
	const [sessionName, setSessionName] = useState('');
	const { userId, displayName, isOwner, setUser, setSession } = useUserStore();
	const { session, start, leave, end, updateUsers, setOwner } = useSession();
	const { selectedVote, isRevealed, results, handleVote, handleReveal, resetVoting } =
		useVoting();
	const votedUsers = useVoteStore((state) => state.votedUsers);

	useEffect(() => {
		let isMounted = true;

		const validateSession = async (): Promise<void> => {
			if (!sessionId) return;
			try {
				const response = await fetch(`/api/validate-session/${sessionId}`);
				if (!response.ok) {
					navigate('/');
					return;
				}

				const sessionData = await response.json();
				if (!isMounted) return;

				if (userId && sessionData.users[userId]) {
					start(
						sessionId,
						displayName || '',
						sessionData.points,
						userId,
						sessionData.name,
						sessionData.owner === userId,
					);
					setSession(sessionId, sessionData.owner === userId);
					setShowJoin(false);
				} else if (!userId || !displayName) {
					setSessionName(sessionData.name);
					setShowJoin(true);
				} else {
					start(
						sessionId,
						displayName || '',
						sessionData.points,
						userId,
						sessionData.name,
						sessionData.owner === userId,
					);
					setSession(sessionId, sessionData.owner === userId);
					setShowJoin(false);
				}
			} catch (error) {
				if (isMounted) navigate('/');
			} finally {
				if (isMounted) setIsValidating(false);
			}
		};

		validateSession();
		return () => {
			isMounted = false;
		};
	}, [sessionId, userId, displayName]);

	const handleJoin = async (name: string): Promise<void> => {
		setUser(name);
		start(sessionId, displayName || '', session.points, userId || '', sessionName, false);
		setShowJoin(false);
	};

	const handleLeave = (): void => {
		leave();
		useUserStore.getState().clear();
		useSessionStore.getState().reset();
		useVoteStore.getState().reset();

		localStorage.removeItem('session-storage');
		localStorage.removeItem('user-storage');
		navigate('/');
	};

	if (isValidating) {
		return <div>Loading...</div>;
	}

	if (showJoin) {
		return <JoinSession onJoin={handleJoin} />;
	}

	//TODO: redirect to join
	if (!session.id) {
		return <div>Loading...</div>;
	}
	console.log('session is', session);
	return (
		<PageLayout sessionId={sessionId} sessionName={session.name || undefined} onLeave={leave}>
			<SessionHeader backgroundImage={mediacity} />
			<TopNav isAdmin={isOwner} handleExit={handleLeave} />
			<MidNav
				isAdmin={isOwner}
				sessionName={session.name}
				sessionTitle={''}
				handleEndSession={end}
			/>
			<div className="container-fluid py-4">
				<div className="row">
					<UserBoard
						points={session.points}
						users={session.users}
						votes={results?.votes}
						isRevealed={false}
						currentUserId={''}
						selectedVote={null}
						onVote={handleVote}
						votedUsers={votedUsers}
					/>
					<ScoreBoard results={results} revealed={isRevealed} />
				</div>
			</div>
			{/* <div>Welcome {displayName}</div> */}
			{/* <Grid>
        <div>
          <VotingArea>
            {session.points.map((point) => (
              <VoteCard
                key={point}
                value={point}
                isSelected={selectedVote === point}
                onClick={() => handleVote(point)}
                disabled={isRevealed}
              />
            ))}
          </VotingArea>

          <UsersGrid>
            {session.users.map(([id, name]) => (
              <UserCard
                key={id}
                id={id}
                name={name}
                hasVoted={!!results?.votes[id]}
                score={isRevealed ? results?.votes[id] : undefined}
                isOwner={session.isOwner}
              />
            ))}
          </UsersGrid>
        </div>

        <div>
          {session.isOwner && (
            <AdminControls
              onReveal={handleReveal}
              onRestart={resetVoting}
              onEnd={end}
              onTitleChange={() => {}}
              votingInProgress={!isRevealed && session.users.length > 0}
            />
          )}

          {results && (
            <ScoreBoard
              results={results}
              revealed={isRevealed}
            />
          )}
        </div>
      </Grid> */}
		</PageLayout>
	);
};

export default SessionPage;
