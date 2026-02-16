type LogPayload = Record<string, unknown>;

export const logger = {
  info(event: string, payload: LogPayload = {}) {
    console.info(JSON.stringify({ level: 'info', event, payload }));
  },
  error(event: string, payload: LogPayload = {}) {
    console.error(JSON.stringify({ level: 'error', event, payload }));
  }
};
