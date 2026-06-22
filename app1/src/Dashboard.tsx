import { useEffect, useState } from 'react';

const AUTH_ORIGIN = import.meta.env.VITE_AUTH_ORIGIN ?? 'http://localhost:5003';
const APP_ORIGIN = import.meta.env.VITE_APP_ORIGIN ?? 'http://localhost:5001';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:5005';

type AuthUser = {
	name?: string | null;
	email?: string | null;
};

type SessionResponse = {
	authenticated: boolean;
	user: AuthUser | null;
};

type ApiHelloResponse = {
	message: string;
	userId: string;
	isAdmin: boolean;
};

function getDisplayName(user: AuthUser | null) {
	return user?.name ?? user?.email ?? 'there';
}

export default function Dashboard() {
	const [session, setSession] = useState<SessionResponse | null>(null);
	const [apiResult, setApiResult] = useState<ApiHelloResponse | null>(null);
	const [apiError, setApiError] = useState('');
	const [isCallingApi, setIsCallingApi] = useState(false);

	const loginUrl = `${AUTH_ORIGIN}/login?returnTo=${encodeURIComponent(APP_ORIGIN)}`;
	const logoutUrl = `${AUTH_ORIGIN}/logout?returnTo=${encodeURIComponent(APP_ORIGIN)}`;

	useEffect(() => {
		fetch(`${AUTH_ORIGIN}/api/session`, {
			credentials: 'include'
		})
			.then((response) => response.json())
			.then((data: SessionResponse) => setSession(data))
			.catch(() => setSession({ authenticated: false, user: null }));
	}, []);

	async function callApi() {
		setApiError('');
		setApiResult(null);
		setIsCallingApi(true);

		try {
			const tokenRes = await fetch(`${AUTH_ORIGIN}/api/token`, {
				credentials: 'include'
			});

			if (!tokenRes.ok) {
				throw new Error('Could not get access token');
			}

			const { accessToken } = await tokenRes.json();

			const apiRes = await fetch(`${API_ORIGIN}/api/hello`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (!apiRes.ok) {
				throw new Error(`API error: ${apiRes.status}`);
			}

			const data: ApiHelloResponse = await apiRes.json();
			setApiResult(data);
		} catch (error) {
			setApiError(error instanceof Error ? error.message : 'API call failed');
		} finally {
			setIsCallingApi(false);
		}
	}

	return (
		<header style={{ padding: '1rem 2rem', borderBottom: '1px solid #ccc' }}>
			<strong>React App 1</strong>

			<div style={{ marginTop: '0.5rem' }}>
				{session === null ? (
					<p>Checking session...</p>
				) : session.authenticated ? (
					<>
						<p>Welcome, {getDisplayName(session.user)}</p>

						<button type="button" onClick={callApi} disabled={isCallingApi}>
							{isCallingApi ? 'Calling API...' : 'Call API'}
						</button>

						<a href={logoutUrl} style={{ marginLeft: '1rem' }}>
							Logout
						</a>

						{apiResult && (
							<pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
								{JSON.stringify(apiResult, null, 2)}
							</pre>
						)}

						{apiError && <p style={{ color: 'red' }}>{apiError}</p>}
					</>
				) : (
					<a href={loginUrl}>Login</a>
				)}
			</div>
		</header>
	);
}