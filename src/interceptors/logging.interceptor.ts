import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from '../services/logger.service';
import { v4 as uuidv4 } from 'uuid';
import * as chalk from 'chalk';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const traceId = request.headers['x-trace-id'] || uuidv4();
    this.logger.setTraceId(traceId);

    const method = request.method;
    const url = request.url;
    const now = Date.now();

    // Format request log
    const requestBody = this.sanitizeData(request.body);
    const requestQuery = Object.keys(request.query || {}).length > 0 ? request.query : undefined;
    const requestParams = Object.keys(request.params || {}).length > 0 ? request.params : undefined;

    this.logger.log({
      type: 'Request',
      message: `${method} ${url}`,
      details: {
        ...(requestBody && { body: requestBody }),
        ...(requestQuery && { query: requestQuery }),
        ...(requestParams && { params: requestParams }),
        headers: this.formatHeaders(request.headers)
      }
    });

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const responseTime = Date.now() - now;
          // Format success response log
          this.logger.log({
            type: 'Response',
            message: `${method} ${url} - ${responseTime}ms`,
            details: {
              statusCode: context.switchToHttp().getResponse().statusCode,
              ...(data && { body: this.sanitizeData(data) })
            }
          });
        },
        error: (error: any) => {
          const responseTime = Date.now() - now;
          // Format error response log
          this.logger.error({
            type: 'Error',
            message: `${method} ${url} - ${responseTime}ms`,
            details: {
              name: error.name,
              message: error.message,
              code: error.code || error.status,
              ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            }
          });
        },
      }),
    );
  }

  private formatHeaders(headers: any): any {
    const formatted = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token', 'x-trace-id'];
    
    sensitiveHeaders.forEach(header => {
      if (header in formatted) {
        formatted[header] = '[HIDDEN INFORMATION]';
      }
    });

    // Add useful headers only
    return {
      'content-type': formatted['content-type'],
      'user-agent': formatted['user-agent'],
      ...(formatted['x-trace-id'] && { 'x-trace-id': formatted['x-trace-id'] }),
      ...(formatted['authorization'] && { authorization: '[HIDDEN INFORMATION]' })
    };
  }

  private sanitizeData(data: any): any {
    if (!data) return undefined;
    
    // If data is an array, sanitize each item
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    // If data is an object, create a sanitized copy
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'authorization', 'refreshToken', 'credit_card'];
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[HIDDEN INFORMATION]';
        }
      });

      // Recursively sanitize nested objects
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      });

      return sanitized;
    }

    return data;
  }
} 