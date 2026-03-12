import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

let internalApiUrl: string | undefined;

export function initApiBaseUrl(url: string) {
  internalApiUrl = url;
}

export function getApiBaseUrl(): string {
  if (browser) {
    return dev
      ? `http://${window.location.hostname}:3000`
      : env.PUBLIC_API_URL;
  }
  return internalApiUrl ?? env.PUBLIC_API_URL;
}
