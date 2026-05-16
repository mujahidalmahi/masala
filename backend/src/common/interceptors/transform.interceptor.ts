import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        if (data && typeof data === 'object' && 'success' in (data as any)) {
          return data as any;
        }
        if (data && typeof data === 'object' && 'data' in (data as any) && 'meta' in (data as any)) {
          return { success: true, ...data } as any;
        }
        return { success: true, data } as any;
      }),
    );
  }
}
