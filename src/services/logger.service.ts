import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as chalk from 'chalk';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private context?: string;
  private traceId: string;

  constructor(context?: string) {
    this.context = context;
    this.traceId = uuidv4();
  }

  private formatMessage(level: string, message: any, trace?: string) {
    const timestamp = new Date().toLocaleTimeString();
    let logMessage = '';

    // Format timestamp and level
    logMessage += chalk.gray(`[${timestamp}] `);
    switch (level) {
      case 'error':
        logMessage += chalk.red.bold(`[${level.toUpperCase()}] `);
        break;
      case 'warn':
        logMessage += chalk.yellow.bold(`[${level.toUpperCase()}] `);
        break;
      case 'info':
        logMessage += chalk.blue.bold(`[${level.toUpperCase()}] `);
        break;
      case 'debug':
        logMessage += chalk.cyan.bold(`[${level.toUpperCase()}] `);
        break;
      default:
        logMessage += chalk.white.bold(`[${level.toUpperCase()}] `);
    }

    // Add context and traceId
    logMessage += chalk.green(`[${this.context || 'APP'}] `);
    logMessage += chalk.gray(`(${this.traceId.slice(0, 8)}) `);

    // Format the message
    if (typeof message === 'object') {
      if (message.type && message.message) {
        logMessage += chalk.white.bold(`${message.type}: `) + chalk.white(message.message);
        
        // Format details if they exist
        if (message.details) {
          const details = message.details;
          logMessage += '\n';
          
          // Format headers
          if (details.headers) {
            logMessage += chalk.gray('Headers:\n') + 
              Object.entries(details.headers)
                .map(([key, value]) => `  ${chalk.cyan(key)}: ${chalk.white(value)}`)
                .join('\n');
          }

          // Format body
          if (details.body) {
            logMessage += '\n' + chalk.gray('Body:\n') + 
              chalk.white(JSON.stringify(details.body, null, 2))
                .split('\n')
                .map(line => '  ' + line)
                .join('\n');
          }

          // Format query parameters
          if (details.query) {
            logMessage += '\n' + chalk.gray('Query Parameters:\n') + 
              Object.entries(details.query)
                .map(([key, value]) => `  ${chalk.cyan(key)}: ${chalk.white(value)}`)
                .join('\n');
          }

          // Format route parameters
          if (details.params) {
            logMessage += '\n' + chalk.gray('Route Parameters:\n') + 
              Object.entries(details.params)
                .map(([key, value]) => `  ${chalk.cyan(key)}: ${chalk.white(value)}`)
                .join('\n');
          }

          // Format status code for responses
          if (details.statusCode) {
            logMessage += '\n' + chalk.gray('Status: ') + 
              chalk.white(details.statusCode);
          }

          // Format error details
          if (details.name || details.code) {
            logMessage += '\n' + chalk.gray('Error Details:');
            if (details.name) logMessage += '\n  ' + chalk.red(`Name: ${details.name}`);
            if (details.code) logMessage += '\n  ' + chalk.red(`Code: ${details.code}`);
            if (details.message) logMessage += '\n  ' + chalk.red(`Message: ${details.message}`);
          }
        }
      } else {
        logMessage += chalk.white(JSON.stringify(message, null, 2));
      }
    } else {
      logMessage += chalk.white(message);
    }

    // Add trace for errors
    if (trace) {
      logMessage += '\n' + chalk.red(trace);
    }

    return logMessage;
  }

  error(message: any, trace?: string, context?: string) {
    if (context) this.context = context;
    console.error(this.formatMessage('error', message, trace));
  }

  warn(message: any, context?: string) {
    if (context) this.context = context;
    console.warn(this.formatMessage('warn', message));
  }

  log(message: any, context?: string) {
    if (context) this.context = context;
    console.log(this.formatMessage('info', message));
  }

  debug(message: any, context?: string) {
    if (context) this.context = context;
    console.debug(this.formatMessage('debug', message));
  }

  verbose(message: any, context?: string) {
    if (context) this.context = context;
    console.info(this.formatMessage('verbose', message));
  }

  setTraceId(traceId: string) {
    this.traceId = traceId;
  }

  getTraceId(): string {
    return this.traceId;
  }
} 