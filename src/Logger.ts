import * as chalk from 'chalk';

export type LogLevel = 'default' | 'warn' | 'info' | 'error';

/**
 * Handler for logging messages
 */
export class Logger {
  public warnings: number = 0;
  public errors: number = 0;

  /**
   * Logs messages as warnings
   * @param messages Messages to log
   */
  public warn(...messages: unknown[]): void {
    this.log('warn', chalk.keyword('orange')('[WARN]'), ...messages);

    this.warnings++;
  }

  /**
   * Logs messages as errors
   * @param messages Messages to log
   */
  public error(...messages: unknown[]): void {
    this.log('error', chalk.keyword('red')('[ERROR]'), ...messages);

    this.errors++;
  }

  /**
   * Logs messages as info
   * @param messages Messages to log
   */
  public info(...messages: unknown[]): void {
    this.log('info', chalk.keyword('cyan')('[INFO]'), ...messages);
  }

  /**
   * Logs messages without a status
   * @param messages Messages to log
   */
  public log(...messages: unknown[]): void {
    this.logWithLevel('default', ...messages);
  }

  /**
   * Logs messages with a level
   * @param level Logging level to use
   * @param messages Messages to log
   */
  public logWithLevel(level: LogLevel, ...messages: unknown[]): void {
    switch (level) {
      case 'error':
        console.error(...messages);
        break;
      case 'warn':
        console.warn(...messages);
        break;
      case 'info':
        console.info(...messages);
        break;
      default:
        console.log(...messages);
        break;
    }
  }

  /**
   * Logs an empty line
   */
  public empty(): void {
    this.log('');
  }
}
