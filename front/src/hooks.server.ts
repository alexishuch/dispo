import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { initApiBaseUrl } from '$lib/api/baseUrl';

initApiBaseUrl(dev ? 'http://localhost:3000' : env.INTERNAL_API_URL);