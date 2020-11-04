import { WorkerChannel } from '@wexond/rpc-node';

export interface LoggerService {
  log(message: string): boolean;
}

export const loggerChannel = new WorkerChannel<LoggerService>('logger');
