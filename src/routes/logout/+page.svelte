<script lang="ts">
	import { onMount } from 'svelte';
	import { signOut } from '@auth/sveltekit/client';

	let { data } = $props();

	onMount(() => {
		signOut({ redirectTo: data.returnTo });
	});
</script>

<p>Signing out...</p>