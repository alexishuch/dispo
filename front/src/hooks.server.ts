import { env } from '$env/dynamic/private';
import { initApiBaseUrl } from '$lib/api/baseUrl';

initApiBaseUrl(env.INTERNAL_API_URL);