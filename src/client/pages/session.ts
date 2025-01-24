import '../styles/main.css';
import { SocketClient } from '../socket/index';
import { VoteResults } from '../types/index';
import {
	getCookie,
	showElement,
	hideElement,
	getElementValue,
	showNotification,
	clearCookies,
	sanitizeInput,
} from '../utils';

class SessionPage {
	private socket: SocketClient;
	private sessionId: string;

	constructor() {
		this.sessionId = window.location.pathname.split('/')[1];
		this.socket = new SocketClient();
		this.setupSocketHandlers();
		this.setupEventListeners();
		this.initializeSession();
	}

	private setupSocketHandlers(): void {
		this.socket.on('userList', this.updateUserList.bind(this));
		this.socket.on('updatePoints', this.updatePoints.bind(this));
		this.socket.on('voteReceived', this.handleVoteReceived.bind(this));
		this.socket.on('revealVotes', this.handleRevealVotes.bind(this));
		this.socket.on('sessionEnded', this.handleSessionEnded.bind(this));
		this.socket.on('sessionError', this.handleSessionError.bind(this));
		this.socket.on('sessionName', this.updateSessionName.bind(this));
		this.socket.on('updateOwner', this.updateOwner.bind(this));
		this.socket.on('updateVoteTitle', this.updateVoteTitle.bind(this));
	}

	private setupEventListeners(): void {
		const voteTitleInput = document.getElementById('voteTitle');
		if (voteTitleInput) {
			voteTitleInput.addEventListener('keydown', (event: KeyboardEvent) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					this.setVoteTitle();
				}
			});
		}
	}

	private initializeSession(): void {
		const userId = getCookie('userId');
		const name = getCookie('name');

		if (userId && name && getCookie('sessionId') === this.sessionId) {
			this.socket.joinSession(this.sessionId, name, userId);
			hideElement('join');
			showElement('mainContent');
		} else {
			hideElement('mainContent');
		}
	}

	private updateUserList(users: [string, string][]): void {
		const userList = document.getElementById('users');
		if (!userList) return;

		userList.innerHTML = '';
		users.forEach(([id, name]) => {
			userList.appendChild(this.createUserCard(id, name));
		});
	}

	private createUserCard(id: string, name: string): HTMLElement {
		const cardTemplate = `
      <div class="col-xl-3 col-sm-6 mb-4">
        <div class="card bg-gradient-info move-on-hover" id="${id}">
          <div class="card-body">
            <div class="d-flex">
              <h5 class="mb-0 text-white" id="${id}name">${name}</h5>
              <div class="ms-auto">
                <h6 class="text-white text-end mb-0 mt-n2"></h6>
              </div>
            </div>
            <p class="text-white mb-0" id="${id}score"></p>
          </div>
        </div>
      </div>
    `;

		const div = document.createElement('div');
		div.innerHTML = cardTemplate.trim();
		return div.firstChild as HTMLElement;
	}

	private updatePoints(points: number[]): void {
		const votesDiv = document.getElementById('votes');
		if (!votesDiv) return;

		votesDiv.innerHTML = '';
		points.forEach((point) => {
			const button = document.createElement('button');
			button.id = `${point}name`;
			button.className = 'btn bg-gradient-secondary btn-sm';
			button.textContent = point.toString();
			button.onclick = () => this.vote(point);
			votesDiv.appendChild(button);
		});
	}

	private vote(point: number): void {
		this.socket.vote(point);
	}

	private handleVoteReceived(userId: string): void {
		showElement('revealBtn');
		const userElement = document.getElementById(userId);
		if (userElement) {
			userElement.classList.add('bg-gradient-success');
			userElement.classList.remove('bg-gradient-info');
		}
	}

	private handleRevealVotes(data: VoteResults): void {
		this.updateVoteDisplay(data);
		hideElement('revealBtn', true);
		showElement('scoreBoard2');
	}

	private updateVoteDisplay(data: VoteResults): void {
		const { votes, average, highestVotes, lowestVotes, otherVotes, totalVoters } = data;

		// Update individual votes
		Object.entries(votes).forEach(([userId, vote]) => {
			const userElement = document.getElementById(`${userId}score`);
			if (userElement) {
				userElement.textContent = vote.toString();
			}
		});

		// Update statistics
		this.updateStatistics(average, highestVotes, lowestVotes, otherVotes, totalVoters);
	}

	private updateStatistics(
		average: number,
		highestVotes: { value: number[]; voters: Array<{ [key: string]: number }> },
		lowestVotes: { value: number[]; voters: Array<{ [key: string]: number }> },
		otherVotes: Array<{ [key: string]: number }>,
		totalVoters: number,
	): void {
		// Update averages
		const averageElement = document.getElementById('averageVotes');
		if (averageElement) {
			averageElement.textContent = average.toFixed(2);
		}

		// Update highest votes
		this.updateVoteSection('highestVote', 'highestVoter', highestVotes);

		// Update lowest votes
		this.updateVoteSection('lowestVote', 'lowestVoteLabel', lowestVotes);

		// Update other votes
		const otherVotesElement = document.getElementById('otherVotes');
		if (otherVotesElement) {
			otherVotesElement.innerHTML = this.formatVoterList(otherVotes);
		}

		// Update total
		const totalElement = document.getElementById('totalVotes');
		if (totalElement) {
			totalElement.textContent = totalVoters.toString();
		}
	}

	private updateVoteSection(
		valueId: string,
		voterId: string,
		data: { value: number[]; voters: Array<{ [key: string]: number }> },
	): void {
		const valueElement = document.getElementById(valueId);
		const voterElement = document.getElementById(voterId);

		if (valueElement) {
			valueElement.textContent = data.value.join(', ');
		}
		if (voterElement) {
			voterElement.innerHTML = this.formatVoterList(data.voters);
		}
	}

	private formatVoterList(voters: Array<{ [key: string]: number }>): string {
		return voters
			.map((voter) => {
				const userId = Object.keys(voter)[0];
				const vote = voter[userId];
				const userName = document.getElementById(`${userId}name`)?.textContent || userId;
				return `${userName}:${vote} <br>`;
			})
			.join('');
	}

	private handleSessionEnded(): void {
		showNotification('The session has ended.');
		clearCookies();
		window.location.href = '/';
	}

	private handleSessionError(message: string): void {
		showNotification(message, true);
		window.location.href = '/';
	}

	private updateSessionName(name: string): void {
		const element = document.getElementById('sessionName');
		if (element) {
			element.textContent = `Session: ${name}`;
		}
	}

	private updateOwner(sessionOwner: string): void {
		const userId = getCookie('userId');
		if (userId === sessionOwner) {
			this.showAdminControls();
		} else {
			this.hideAdminControls();
		}
	}

	private showAdminControls(): void {
		showElement('scoreAdmin');
		hideElement('revealBtn');
		showElement('end');
		showElement('titleChange', 'flex');
	}

	private hideAdminControls(): void {
		hideElement('end');
		hideElement('revealBtn');
		hideElement('restart');
		hideElement('titleChange');
	}

	private updateVoteTitle(title: string): void {
		const element = document.getElementById('voteTitleDisplay');
		if (element) {
			element.textContent = `Vote Title: ${title || ''}`;
		}
	}

	private async setVoteTitle(): Promise<void> {
		const voteTitle = getElementValue('voteTitle');
		if (voteTitle.length < 3) return;

		const sanitizedVoteTitle = sanitizeInput(voteTitle);
		try {
			const response = await fetch('/set-vote-title', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: this.sessionId, voteTitle: sanitizedVoteTitle }),
			});

			const data = await response.json();
			if (data.success) {
				showNotification('Vote title updated.');
			} else {
				showNotification('Error updating vote title.', true);
			}
		} catch (error) {
			console.error('Error setting vote title:', error);
			showNotification('Error setting vote title. Please try again.', true);
		}
	}
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new SessionPage();
});
