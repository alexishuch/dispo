import { convertDatetoDateArray, convertDateToGCalFormat } from "$lib/helpers/date.tools";
import { createEvent } from 'ics';

export function buildGoogleCalendarUrl(title: string, start: string, end: string): string {
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', title);
    url.searchParams.set('dates', `${convertDateToGCalFormat(start)}/${convertDateToGCalFormat(end)}`);
    return url.toString();
}

export function createICSFile(title: string, start: string, end: string): Promise<File> {
    return new Promise((resolve, reject) => {
        createEvent(
            {
                start: convertDatetoDateArray(start),
                end: convertDatetoDateArray(end),
                title,
            },
            (error, value) => {
                if (error) reject(error);
                else resolve(new File([value], `${title}.ics`, { type: 'text/calendar' }));
            },
        );
    });
}

export function detectPlatform(ua: string) {
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    return {
        isAndroid: /Android/.test(ua),
        isIOS,
        isSafariIOS: isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Ecosia/.test(ua),
        isMac: /Macintosh/.test(ua) && !isIOS,
    };
}
