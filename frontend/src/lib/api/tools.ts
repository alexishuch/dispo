import { error, isHttpError } from '@sveltejs/kit';
import { getApiBaseUrl } from './baseUrl';

async function fetchApi(path: string, options?: RequestInit): Promise<Response> {
  const url = new URL(path, getApiBaseUrl());

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Server is unreachable.');
  }

  if (!res.ok && res.status !== 422) {
    await handleResponseError(res);
  }

  return res;
}

export async function handleApiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetchApi(path, options);

  if (res.status === 204) {
    throw new Error('Expected JSON response but got no content.');
  }

  return (await res.json());
}

export async function handleApiRequestVoid(
  path: string,
  options?: RequestInit,
): Promise<void> {
  await fetchApi(path, options);
}

export async function handleResponseError(res: Response): Promise<never> {
  let payload: any = null;
  try {
    payload = await res.json();
  } catch { }

  const message = payload?.message ?? 'Request failed';

  throw error(res.status, { message });
}

export function getErrorMessage(error: unknown): string {
  if (isHttpError(error)) {
    return `${error.status} - ${error.body.message}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const anyErr = error as any;
    if (
      typeof anyErr.status === 'number' &&
      typeof anyErr.message === 'string'
    ) {
      return `${anyErr.status} - ${anyErr.message}`;
    }
    if (typeof anyErr.message === 'string') return anyErr.message;
  }

  return 'Unknown error.';
}
