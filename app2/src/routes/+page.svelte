<script lang="ts">
	import { onMount } from 'svelte';

	const AUTH = import.meta.env.VITE_AUTH_ORIGIN ?? 'http://localhost:5003';
	const APP = import.meta.env.VITE_APP_ORIGIN ?? 'http://localhost:5002';

	type Session = {
		authenticated: boolean;
		user: { name?: string; email?: string } | null;
	};

	let session = $state<Session | null>(null);

	const loginUrl = `${AUTH}/login?returnTo=${encodeURIComponent(APP)}`;
	const logoutUrl = `${AUTH}/logout?returnTo=${encodeURIComponent(APP)}`;

	onMount(() => {
		fetch(`${AUTH}/api/session`, { credentials: 'include' })
			.then((r) => r.json())
			.then((data: Session) => (session = data))
			.catch(() => (session = { authenticated: false, user: null }));
	});
</script>

<header style="padding: 1rem 2rem; border-bottom: 1px solid #ccc">
	<strong>SvelteKit App 2</strong>

	<div style="margin-top: 0.5rem">
		{#if session === null}
			<p>Checking session...</p>
		{:else if session.authenticated}
			<p>Welcome, {session.user?.name ?? session.user?.email}</p>
			<a href={logoutUrl}>Logout</a>
		{:else}
			<a href={loginUrl}>Login</a>
		{/if}
	</div>
</header>