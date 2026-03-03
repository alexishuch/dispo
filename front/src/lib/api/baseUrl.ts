import { browser, dev } from '$app/environment';
import {
    env
} from '$env/dynamic/public';

function getApiBaseUrl(): string {
    if (dev) {
        return 'http://localhost:3000'
    }

    if (!browser) {
        return 'http://dispo_nestjs:3000';
    }

    return env.PUBLIC_API_BASE_URL;
}

export const API_BASE_URL = getApiBaseUrl();