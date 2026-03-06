import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

function getApiBaseUrl(): string {
  if (browser) {
    return dev
      ? `http://${window.location.hostname}:3000`
      : env.PUBLIC_API_BASE_URL;
  }
  if (dev) {
    return 'http://localhost:3000';
  }
  return 'http://nestjs:3000';
}

export const API_BASE_URL = getApiBaseUrl();
