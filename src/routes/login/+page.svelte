<script lang="ts">
	import { enhance } from '$app/forms';
	import { signIn } from '@auth/sveltekit/client';

	let { form } = $props();

	let loginName = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let showForgot = $state(false);

	async function submitLogin(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

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

<h1>Login</h1>

{#if form?.step === 'done'}
	<p>{form.message}</p>
	<a href="/login">Back to login</a>

{:else if form?.step === 'reset'}
	<p>Reset password for {form.loginName}</p>

	{#if form?.message}
		<p>{form.message}</p>
	{/if}

	<p>Dev code: <strong>{form.verificationCode}</strong></p>

	<form method="POST" action="?/resetPassword" use:enhance>
		<input type="hidden" name="userId" value={form.userId} />

		<label>
			Verification code
			<input name="verificationCode" value={form.verificationCode} required />
		</label>

		<label>
			New password
			<input type="password" name="password" autocomplete="new-password" required />
		</label>

		<button type="submit">Set new password</button>
	</form>

	<button type="button" onclick={() => (showForgot = false)}>Back to login</button>

{:else if showForgot}
	<p>Forgot password</p>

	{#if form?.message}
		<p>{form.message}</p>
	{/if}

	<form method="POST" action="?/requestCode" use:enhance>
		<label>
			Email or username
			<input name="loginName" bind:value={loginName} autocomplete="username" required />
		</label>

		<button type="submit">Send reset code</button>
	</form>

	<button type="button" onclick={() => (showForgot = false)}>Back to login</button>

{:else}
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

	<button type="button" onclick={() => (showForgot = true)}>Forgot password?</button>
{/if}