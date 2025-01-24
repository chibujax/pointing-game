const COOKIE_NAMES = ['name', 'owner', 'sessionId', 'userId'] as const;
type CookieName = (typeof COOKIE_NAMES)[number];

export function getCookie(name: CookieName): string | undefined {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift();
	return undefined;
}

export function showElement(id: string, style: string = 'block'): void {
	const element = document.getElementById(id);
	if (element) {
		element.style.display = style;
	}
}

export function hideElement(id: string, important: boolean = false): void {
	const element = document.getElementById(id);
	if (element) {
		element.style.display = important ? 'none !important' : 'none';
	}
}

export function getElementValue(id: string): string {
	const element = document.getElementById(id) as HTMLInputElement | null;
	return element?.value || '';
}

export function showNotification(message: string, isError: boolean = false): void {
	const notification = document.getElementById('notification');
	if (!notification) return;

	notification.textContent = message;
	notification.classList.add('show');
	notification.classList.remove('hide');

	if (isError) {
		notification.classList.add('alert-danger');
	} else {
		notification.classList.add('alert-info');
	}

	setTimeout(() => {
		if (!notification) return;
		notification.classList.remove('show');
		notification.classList.add('hide');
	}, 3000);
}

export function clearCookies(): void {
	COOKIE_NAMES.forEach((name) => {
		document.cookie = `${name}=; Max-Age=-99999999; path=/`;
	});
}

export function sanitizeInput(input: string): string {
	const temp = document.createElement('div');
	temp.textContent = input;
	return temp.innerHTML;
}
