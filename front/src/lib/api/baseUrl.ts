function getApiBaseUrl(): string {
    if (typeof window === 'undefined') {
        // SSR: return a placeholder, won't be used for actual fetch calls
        return 'http://localhost:3000';
    }

    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }

    return `http://${hostname}:3000`;
}

export const API_BASE_URL = getApiBaseUrl();



// export const API_BASE_URL = dev ? 'http://localhost:3000' : import.meta.env.BASE_URL;
