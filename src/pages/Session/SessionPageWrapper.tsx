import { SocketProvider } from '@/context/SocketContext';
import SessionPage from '.';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useVoteStore } from '@/stores/voteStore';

const SessionPageWrapper = (): JSX.Element => {
	const navigate = useNavigate();
	const clearUser = useUserStore((state) => state.clear);
	const resetSession = useSessionStore((state) => state.reset);
	const resetVote = useVoteStore((state) => state.reset);
	const setUsers = useSessionStore((state) => state.setUsers);

	const handleSessionEnd = (): void => {
		clearUser();
		resetSession();
		resetVote();
		localStorage.removeItem('session-storage');
		localStorage.removeItem('user-storage');
		navigate('/');
	};

	const handleUserUpdate = (users: Array<[string, string]>): void => {
		console.log("wrapper update", users)
		const userObjects = users.map(([id, name]) => ({ id, name }));
		setUsers(userObjects);
	};

	const handleVoteUpdate = (votedUsers: string[]): void => {
		console.log('sessionWraper setting votedUsers', votedUsers);
		useVoteStore.getState().setVotedUsers(votedUsers);
	};

	return (
		<SocketProvider
			onSessionEnd={handleSessionEnd}
			onVoteUpdate={handleVoteUpdate}
			onUserUpdate={handleUserUpdate}
		>
			<SessionPage />
		</SocketProvider>
	);
};

export default SessionPageWrapper;
