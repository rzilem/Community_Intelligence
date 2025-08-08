type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const prefix = '[CommunityIntelligence]';

const log = (level: LogLevel, message: string, meta?: Record<string, any>) => {
  const payload = meta ? `${message} :: ${JSON.stringify(meta)}` : message;
  // Keep simple for now; could be extended to remote logging later
  switch (level) {
    case 'debug':
      return console.debug?.(`${prefix} ${payload}`);
    case 'info':
      return console.info?.(`${prefix} ${payload}`);
    case 'warn':
      return console.warn?.(`${prefix} ${payload}`);
    case 'error':
      return console.error?.(`${prefix} ${payload}`);
  }
};

export const logger = {
  debug: (message: string, meta?: Record<string, any>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, any>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, any>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, any>) => log('error', message, meta),
};
