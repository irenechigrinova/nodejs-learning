import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `OriginalUrl: ${request.originalUrl}; body: ${JSON.stringify(
              request.body,
            )}; execution time: ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
