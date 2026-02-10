/**
 * Convert ISO date string to Date object
 */
export function parseISODate(dateString: string | Date): Date {
    if (dateString instanceof Date) {
        return dateString;
    }
    return new Date(dateString);
}

/**
 * Format ISO date string to DD-MM-YYYY HH:mm format
 */
export function formatDateSlot(dateString: string | Date): string {
    const date = parseISODate(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}
