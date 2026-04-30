import { error } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getErrorMessage, handleApiRequest } from './tools';

describe('handleApiRequest', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws a friendly error when the server is unreachable', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('network error'));

        const result = handleApiRequest('/users');

        await expect(result).rejects.toThrow('Server is unreachable.');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('returns parsed JSON when the response is ok', async () => {
        const data = { id: 1, name: 'Ada' };

        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(data), {
                status: 200,
            }),
        );

        const result = await handleApiRequest<typeof data>('/users/1');

        expect(result).toEqual(data);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('returns undefined when the response is ok but the body is empty', async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response('', {
                status: 200,
            }),
        );

        const result = await handleApiRequest('/users/1');

        expect(result).toBeUndefined();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('returns parsed JSON when the response status is 422', async () => {
        const data = { errors: { email: ['Invalid email'] } };

        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(data), {
                status: 422,
            }),
        );

        const result = await handleApiRequest<typeof data>('/users');

        expect(result).toEqual(data);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('throws when the response is not ok and not 422', async () => {
        const message = 'Generic server error';
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({ message }), {
                status: 500,
            }),
        );

        const result = handleApiRequest('/users');

        await expect(result).rejects.toThrow(message);
    });
});

describe('getErrorMessage', () => {
    it('should return an error message from an HttpError', () => {
        let httpError: unknown;
        try { error(404, { message: 'Not Found' }); } catch (e) { httpError = e; }

        const result = getErrorMessage(httpError);

        expect(result).toBe('404 - Not Found');
    });

    it('should return an error message from an Error', () => {
        let error = new Error("Load failed");

        const result = getErrorMessage(error);

        expect(result).toBe("Load failed");
    });

    it('should return an error message from a thrown object with a status', () => {
        let error = {
            message: 'Something happened',
            status: 500
        };

        const result = getErrorMessage(error);

        expect(result).toBe("500 - Something happened");
    });

    it('should return an error message from a thrown object', () => {
        let error = {
            message: 'Something happened',
        };

        const result = getErrorMessage(error);

        expect(result).toBe("Something happened");
    });

    it('should return a generic error message', () => {
        const result = getErrorMessage(undefined);

        expect(result).toBe("Unknown error.");
    });
});