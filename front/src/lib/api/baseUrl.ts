import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

function getApiBaseUrl(): string {
  if (browser) {
    return dev
      ? `http://${window.location.hostname}:3000`
      : env.PUBLIC_API_URL;
  }
  if (dev) {
    return 'http://localhost:3000';
  }
  return env.PUBLIC_INTERNAL_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();
