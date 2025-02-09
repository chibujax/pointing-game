import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useSession } from '../../hooks/useSession';
import { useVoting } from '../../hooks/useVoting';
import { UserBoard } from '../../components/session/UserCard';
import { ScoreBoard } from '../../components/session/ScoreBoard';
import { JoinSession } from './JoinSession';
import { useUserStore } from '../../stores/userStore';
import { SessionHeader } from '@/components/layout/Header';
import mediacity from '../../assets/images/mediacity.jpg';
import { TopNav } from '@/components/ui/Topnav';
import { MidNav } from '@/components/ui/Midnav';
import { useSessionStore } from '@/stores/sessionStore';
import { useVoteStore } from '@/stores/voteStore';
import { Session } from '@/types';

const SessionPage = (): JSX.Element => {
	const { sessionId = '' } = useParams();
	const navigate = useNavigate();
	const [showJoin, setShowJoin] = useState(false);
	const [isValidating, setIsValidating] = useState(true);
	const [sessionName, setSessionName] = useState('');
	const { userId, displayName, isOwner, setUser, setSession } = useUserStore();
	const { session, start, leave, end } = useSession();
	const { handleVote, handleReveal, resetVoting } = useVoting();
	const votedUsers = useVoteStore((state) => state.votedUsers);
	const results = useVoteStore((state) => state.results);
	const isRevealed = useVoteStore((state) => state.isRevealed);
	const startSession = (
		sessionData: Session,
		id: string,
		userName: string,
		showJoin: boolean = false,
	): void => {
		const isSessionOwner = sessionData.owner === id;
		console.log('session getting session name', sessionData);
		start(sessionData.id, userName, sessionData.points, id, sessionData.name, isSessionOwner);
		setSession(sessionId, isSessionOwner);
		setShowJoin(showJoin);
	};

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
					startSession(sessionData, userId, displayName || '');
				} else if (!userId || !displayName) {
					setSessionName(sessionData.name);
					setShowJoin(true);
				} else {
					startSession(sessionData, userId, displayName || '');
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

	if (isValidating) return <div>Loading...</div>;

	if (showJoin) return <JoinSession onJoin={handleJoin} />;

	if (!session.id) return <div>Loading...</div>;

	console.log('session is', session);
	const hasVote = results !== null;
	console.log(`isRevealed: ${isRevealed}`, results, votedUsers);
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
					<ScoreBoard
						voteResult={results}
						isRevealed={isRevealed}
						handleReveal={handleReveal}
						handleRestart={resetVoting}
						hasVote={hasVote}
						users={session.users}
						isAdmin={isOwner}
					/>
				</div>
			</div>
		</PageLayout>
	);
};

export default SessionPage;
