import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

let internalApiUrl: string | undefined;

// This function is only called by hooks.server.ts to get private server URL variable
export function initApiBaseUrl(url: string) {
  internalApiUrl = url;
}

export function getApiBaseUrl(): string {
  if (browser) {
    const devLocalUrl = `http://${window.location.hostname}:3000`;
    return dev
      ? devLocalUrl
      : env.PUBLIC_API_URL;
  }
  return internalApiUrl ?? env.PUBLIC_API_URL;
}
