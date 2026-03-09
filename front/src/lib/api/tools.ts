import { API_BASE_URL } from './baseUrl';

export async function handleApiRequest<T>(
  path: string,
  options?: RequestInit,
  expectResponse?: true
): Promise<T>;

export async function handleApiRequest<T>(
  path: string,
  options?: RequestInit,
  expectResponse?: false
): Promise<void>;

export async function handleApiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T | void> {
  let res: Response;
  const url = new URL(path, API_BASE_URL);

  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Server is unreachable.');
  }

  if (res.ok || res.status === 422) {
    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
  }

  await handleResponseError(res);
}

export class HttpError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export async function handleResponseError(res: Response): Promise<never> {
  let payload: any = null;
  try {
    payload = await res.json();
  } catch { }

  const message = payload?.message ?? 'Request failed';

  throw new HttpError(message, res.status);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    return error.status ? `${error.status} - ${error.message}` : error.message;
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
