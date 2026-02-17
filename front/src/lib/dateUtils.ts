/**
 * Format ISO date string to HH:mm format
 */
export function displayTimeFromDate(dateString: string | Date): string {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

export function formatSlot(slotStart: string, slotEnd: string) {
    const slotStartDate = new Date(slotStart);
    const slotEndDate = new Date(slotEnd)

    const weekdayAndDate =
        slotStartDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    const startTime = slotStartDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    })
    const endTime = slotEndDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return `${weekdayAndDate} ${startTime} - ${endTime}`;
}

export function formatDateToLocale(dateString: string) {
    return new Date(dateString).toLocaleDateString()
}

const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

export function convertUTCDateToLocale(utcDate: Date) {
    const parts = formatter.formatToParts(utcDate);
    console.log(parts)

    const getPart = (type: string) =>
        parts.find(p => p.type === type)?.value ?? '';

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');


    return `${year}-${month}-${day}`;
}