import '../styles/main.css';
import { getElementValue, showNotification } from '../utils';

interface SessionResponse {
	sessionId: string;
	userId: string;
}

class IndexPage {
	constructor() {
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		const submitButton = document.querySelector<HTMLButtonElement>('.submit-button');
		if (submitButton) {
			submitButton.addEventListener('click', () => this.createSession());
		}
	}

	private async createSession(): Promise<void> {
		const sessionName = getElementValue('sessionName');
		const displayName = getElementValue('displayName');
		const pointsInput = getElementValue('points');
		const points = pointsInput.split(',').map(Number).filter(Boolean);

		if (!this.validateInput(sessionName, points, displayName)) {
			return;
		}

		try {
			const response = await fetch('/create-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionName, points, displayName }),
			});

			const data: SessionResponse = await response.json();
			document.cookie = `userId=${data.userId}; path=/; Secure`;
			window.location.href = `/${data.sessionId}`;
		} catch (error) {
			console.error('Error creating session:', error);
			showNotification('Error creating session. Please try again.', true);
		}
	}

	private validateInput(sessionName: string, points: number[], displayName: string): boolean {
		if (!sessionName || points.length === 0 || !displayName) {
			showNotification(
				'Please enter a valid session name, display name, and voting points.',
				true,
			);
			return false;
		}
		return true;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new IndexPage();
});
