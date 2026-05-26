import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logLevel: string;

  constructor(configService?: ConfigService) {
    this.logLevel = configService?.get('LOG_LEVEL') || 'info';
  }

  log(message: string, context?: string) {
    console.log(`[${context || 'LOG'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${context || 'ERROR'}] ${message}`, trace || '');
  }

  warn(message: string, context?: string) {
    console.warn(`[${context || 'WARN'}] ${message}`);
  }

  debug(message: string, context?: string) {
    if (this.logLevel === 'debug') {
      console.log(`[${context || 'DEBUG'}] ${message}`);
    }
  }

  verbose(message: string, context?: string) {
    if (this.logLevel === 'debug' || this.logLevel === 'verbose') {
      console.log(`[${context || 'VERBOSE'}] ${message}`);
    }
  }
}
