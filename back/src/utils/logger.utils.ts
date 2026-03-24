import { Request } from 'express';

export function formatLog(req: Request, statusCode: number): string {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.get('x-forwarded-for') || req.ip || '';

    console.log(">>>>> x-forwarded-for", req.get('x-forwarded-for'));
    console.log(">>>>> IP", req.ip);

    return `${method} ${originalUrl} ${statusCode} - ${userAgent} - ${ip}`;
}
