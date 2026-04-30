import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { formatLog } from 'src/utils/logger.utils';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(CustomExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isHttpException = exception instanceof HttpException;
        const statusCode = isHttpException ? exception.getStatus() : 500;
        const exceptionResponse = isHttpException ? exception.getResponse() : null;
        const responseMessage =
            (typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any)?.message)
            ?? 'Internal server error';

        const log = formatLog(request, statusCode);

        if (isHttpException) {
            this.logger.warn(`${log} - ${responseMessage}`);
        } else {
            this.logger.error(log, exception);
        }

        response.status(statusCode).json({
            statusCode,
            message: responseMessage
        });
    }
}
