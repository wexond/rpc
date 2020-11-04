import { RendererToMainChannel } from '@wexond/rpc-electron';

// Shared is a common file imported by both main process and renderers.

export interface LoggerService {
  log(message: string): boolean;
}

export const loggerChannel = new RendererToMainChannel<LoggerService>('logger');
