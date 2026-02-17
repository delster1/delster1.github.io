declare module 'astro:env/server' {
	export const BETTER_AUTH_URL: string;	
	export const AUTH_SECRET: string;	
	export const AUTH_GITHUB_ID: string;	
	export const AUTH_GITHUB_SECRET: string;	
	export const D3_EMAIL: string | undefined;	
	export const ALLOWED_EMAILS: string | undefined;	
	export const BETTER_AUTH_DATABASE_URL: string | undefined;	
	export const DB_PASSWORD: string | undefined;	
	export const PGPASSWORD: string | undefined;	
}
