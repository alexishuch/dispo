import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { formatLog } from 'src/utils/logger.utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        res.on('finish', () => {
            const { statusCode } = res;
            if (statusCode < 400) {
                this.logger.log(formatLog(req, statusCode));
            }
        });

        next();
    }
}