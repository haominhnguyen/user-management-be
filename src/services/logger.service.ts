import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements NestLoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    console.log(`[${new Date().toISOString()}] [${context || this.context || 'INFO'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${new Date().toISOString()}] [${context || this.context || 'ERROR'}] ${message}`, trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[${new Date().toISOString()}] [${context || this.context || 'WARN'}] ${message}`);
  }

  debug(message: string, context?: string) {
    console.debug(`[${new Date().toISOString()}] [${context || this.context || 'DEBUG'}] ${message}`);
  }

  verbose(message: string, context?: string) {
    console.log(`[${new Date().toISOString()}] [${context || this.context || 'VERBOSE'}] ${message}`);
  }
} 