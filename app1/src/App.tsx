import { useEffect, useState } from 'react';
import './App.css';

const AUTH_ORIGIN = import.meta.env.VITE_AUTH_ORIGIN ?? 'http://localhost:5003';
const APP_ORIGIN = import.meta.env.VITE_APP_ORIGIN ?? 'http://localhost:5001';

type AuthUser = {
	name?: string | null;
	email?: string | null;
};

type SessionResponse = {
	authenticated: boolean;
	user: AuthUser | null;
};

function getDisplayName(user: AuthUser | null) {
	return user?.name ?? user?.email ?? 'there';
}

export default function App() {
	const [session, setSession] = useState<SessionResponse | null>(null);

	const loginUrl = `${AUTH_ORIGIN}/login?returnTo=${encodeURIComponent(APP_ORIGIN)}`;
	const logoutUrl = `${AUTH_ORIGIN}/logout?returnTo=${encodeURIComponent(APP_ORIGIN)}`;

	useEffect(() => {
		fetch(`${AUTH_ORIGIN}/api/session`, {
			credentials: 'include'
		})
			.then((response) => response.json())
			.then((data: SessionResponse) => {
        console.log('Session Set:');
        setSession(data)
      })
			.catch(() => setSession({ authenticated: false, user: null }));
	}, []);

	return (
		<header style={{ padding: '1rem 2rem', borderBottom: '1px solid #ccc' }}>
			<strong>React App 1</strong>

			<div style={{ marginTop: '0.5rem' }}>
				{session === null ? (
					<p>Checking session...</p>
				) : session.authenticated ? (
					<>
						<p>Welcome, {getDisplayName(session.user)}</p>
						<a href={logoutUrl}>Logout</a>
					</>
				) : (
					<a href={loginUrl}>Login</a>
				)}
			</div>
		</header>
	);
}