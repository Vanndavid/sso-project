<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';

	let { data, form } = $props();

	let session = $derived(page.data.session);
	console.log('Session:', session);
	let editingUserId = $state<string | null>(null);
</script>

<h1>Welcome to SvelteKit</h1>

{#if session?.user}
	<p>Signed in as {session.user.name ?? session.user.email}</p>
	<button type="button" onclick={() => signOut({ redirectTo: '/' })}>
		Logout
	</button>
{:else}
	<p>You are not signed in.</p>
	<a href="/login">Login</a>
{/if}

{#if session?.user?.isAdmin}
	<hr />

	<h2>Users</h2>

	{#if form?.message}
		<p>{form.message}</p>
	{/if}

	<h3>Create user</h3>
	<form method="POST" action="?/create" use:enhance>
		<label>
			Username
			<input name="username" required />
		</label>
		<label>
			Display name
			<input name="displayName" required />
		</label>
		<label>
			Email
			<input name="email" type="email" required />
		</label>
		<label>
			Password
			<input name="password" type="password" required />
		</label>
		<button type="submit">Create</button>
	</form>

	<h3>All users</h3>
	<table border="1" cellpadding="6">
		<thead>
			<tr>
				<th>Login</th>
				<th>Display name</th>
				<th>Email</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user (user.id)}
				<tr>
					<td>{user.loginName}</td>
					<td>{user.displayName}</td>
					<td>{user.email}</td>
					<td>
						<button type="button" onclick={() => (editingUserId = user.id)}>
							Edit
						</button>
					</td>
				</tr>

				{#if editingUserId === user.id}
					<tr>
						<td colspan="4">
							<form method="POST" action="?/update" use:enhance>
								<input type="hidden" name="userId" value={user.id} />
								<label>
									Display name
									<input name="displayName" value={user.displayName} required />
								</label>
								<label>
									Email
									<input name="email" type="email" value={user.email} required />
								</label>
								<button type="submit">Save</button>
								<button type="button" onclick={() => (editingUserId = null)}>Cancel</button>
							</form>
						</td>
					</tr>
				{/if}
			{:else}
				<tr>
					<td colspan="4">No users found.</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}