<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	let loginName = $state('');
	let password = $state('');
	let errorMessage = $state('');
	async function submitLogin(event: SubmitEvent) {
		event.preventDefault();
		const response = await signIn('credentials', {
			loginName,
			password,
			redirect: false,
			redirectTo: '/'
		});
		if (response.ok) {
			window.location.assign(response.url ?? '/');
		} else {
			errorMessage = 'The username or password is incorrect.';
		}
	}
</script>

<form onsubmit={submitLogin}>
	<label>
		Email or username
		<input bind:value={loginName} autocomplete="username" required />
	</label>
	<label>
		Password
		<input type="password" bind:value={password} autocomplete="current-password" required />
	</label>
	{#if errorMessage}
		<p>{errorMessage}</p>
	{/if}
	<button type="submit">Login</button>
</form>
