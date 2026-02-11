import { dev } from "$app/environment";

export const API_BASE_URL = dev ? 'http://localhost:3000' : import.meta.env.BASE_URL;
