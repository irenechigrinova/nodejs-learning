import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as ExceptionFilterInterface,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class ExceptionFilter implements ExceptionFilterInterface {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorMessage = this.setErrorMessage(exception);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Internal server error';
    }

    console.log(exception);

    const errorResponse = this.getErrorResponse(status, errorMessage, request);

    // TODO Some possible way to log errors
    // const errorLog = this.getErrorLog(errorResponse, request, exception);
    // this.writeErrorLogToFile(errorLog);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
  ) => ({
    statusCode: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timeStamp: new Date(),
  });

  private setErrorMessage(exception: Record<string, any>) {
    if (exception.response && exception.response.message) {
      return Array.isArray(exception.response.message)
        ? exception.response.message.join('; ')
        : exception.message;
    }
    return exception.response || exception.message;
  }

  // TODO Logging errors helpers
  // private getErrorLog = (
  //   errorResponse: CustomHttpExceptionResponse,
  //   request: Request,
  //   exception: unknown,
  // ): string => {
  //   const { statusCode, error } = errorResponse;
  //   const { method, url } = request;
  //   const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${url}\n\n
  //   ${JSON.stringify(errorResponse)}\n\n
  //   User: ${JSON.stringify(request.user ?? 'Not signed in')}\n\n
  //   ${exception instanceof HttpException ? exception.stack : error}\n\n`;
  //   return errorLog;
  // };
  //
  // private writeErrorLogToFile = (errorLog: string): void => {
  //   fs.appendFile('error.log', errorLog, 'utf8', (err) => {
  //     if (err) throw err;
  //   });
  // };
}
