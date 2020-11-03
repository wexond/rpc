export const getNoHandlerError = (channel: string, fnName: string) => new Error(`No handler set for '${fnName}' in channel '${channel}'`);
