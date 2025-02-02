import { SocketProvider } from '@/context/SocketContext';
import SessionPage from '.';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useVoteStore } from '@/stores/voteStore';
import { useVoting } from '../../hooks/useVoting';

const SessionPageWrapper = (): JSX.Element => {
	const navigate = useNavigate();
	const clearUser = useUserStore((state) => state.clear);
	const resetSession = useSessionStore((state) => state.reset);
	const resetVote = useVoteStore((state) => state.reset);
	const setUsers = useSessionStore((state) => state.setUsers);
	const { setVotedUsers } = useVoting();

	const handleSessionEnd = (): void => {
		clearUser();
		resetSession();
		resetVote();
		localStorage.removeItem('session-storage');
		localStorage.removeItem('user-storage');

		navigate('/');
	};

	const handleUserUpdate = (users: Array<[string, string]>): void => {
		const userObjects = users.map(([id, name]) => ({ id, name }));
		setUsers(userObjects);
	};

	return (
		<SocketProvider
			onSessionEnd={handleSessionEnd}
			onVoteUpdate={setVotedUsers}
			onUserUpdate={handleUserUpdate}
		>
			<SessionPage />
		</SocketProvider>
	);
};

export default SessionPageWrapper;
