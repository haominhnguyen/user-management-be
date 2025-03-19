import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private context?: string;
  private traceId: string;

  constructor(context?: string) {
    this.context = context;
    this.traceId = uuidv4();
  }

  error(message: any, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.error({
      level: 'error',
      timestamp,
      context: context || this.context,
      traceId: this.traceId,
      message,
      trace,
    });
  }

  warn(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    console.warn({
      level: 'warn',
      timestamp,
      context: context || this.context,
      traceId: this.traceId,
      message,
    });
  }

  log(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    console.log({
      level: 'info',
      timestamp,
      context: context || this.context,
      traceId: this.traceId,
      message,
    });
  }

  debug(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    console.debug({
      level: 'debug',
      timestamp,
      context: context || this.context,
      traceId: this.traceId,
      message,
    });
  }

  verbose(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    console.info({
      level: 'verbose',
      timestamp,
      context: context || this.context,
      traceId: this.traceId,
      message,
    });
  }

  setTraceId(traceId: string) {
    this.traceId = traceId;
  }

  getTraceId(): string {
    return this.traceId;
  }
} 