import * as chalk from 'chalk';

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
    console.warn(chalk.keyword('orange')('[WARN]'), ...messages);

    this.warnings++;
  }

  /**
   * Logs messages as errors
   * @param messages Messages to log
   */
  public error(...messages: unknown[]): void {
    console.warn(chalk.keyword('red')('[ERROR]'), ...messages);

    this.errors++;
  }

  /**
   * Logs messages as info
   * @param messages Messages to log
   */
  public info(...messages: unknown[]): void {
    console.warn(chalk.keyword('cyan')('[INFO]'), ...messages);
  }

  /**
   * Logs messages without a status
   * @param messages Messages to log
   */
  public log(...messages: unknown[]): void {
    console.log(...messages);
  }

  /**
   * Logs an empty line
   */
  public empty(): void {
    console.log('');
  }
}
