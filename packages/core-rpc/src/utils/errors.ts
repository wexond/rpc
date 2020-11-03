export const getNoHandlerError = (channel: string, fnName: string) => {
  return new Error(`No handler set for '${fnName}' in channel '${channel}'`);
};
