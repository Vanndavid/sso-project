// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare module '@auth/sveltekit' {
	interface User {
		id?: string;
		isAdmin?: boolean;
	}
	interface Session {
		user?: {
			id?: string | null;
			name?: string | null;
			email?: string | null;
			isAdmin?: boolean;
			image?: string | null;
			preferredUsername?: string;
		};
	}
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface PageData {
			session?: import('@auth/sveltekit').Session | null;
		}
		interface JWT {
			sub?: string;
			isAdmin?: boolean;
		}
	}
}

export {};
