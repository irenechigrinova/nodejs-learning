import winston from 'winston';
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from 'winston/lib/winston/transports';
import morgan from 'morgan';

export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports: (ConsoleTransportInstance | FileTransportInstance)[] = [
  new winston.transports.Console(),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  transports.push(new winston.transports.File({ filename: 'logs/all.log' }));
}

const winstonLogger = (level: string) =>
  winston.createLogger({
    exitOnError: false,
    level,
    levels,
    format,
    transports,
    exceptionHandlers: [
      process.env.NODE_ENV === 'production'
        ? new winston.transports.File({ filename: 'exception.log' })
        : new winston.transports.Console(),
    ],
    rejectionHandlers: [
      process.env.NODE_ENV === 'production'
        ? new winston.transports.File({ filename: 'rejections.log' })
        : new winston.transports.Console(),
    ],
  });

export default {
  logger: winstonLogger,
  httpLogger: morgan((tokens, req, res) => {
    const loggerMethod = tokens.status(req, res) === '200' ? 'info' : 'error';
    const logger = winstonLogger(loggerMethod);
    const msg = [
      `method: ${tokens.method(req, res)}`,
      `url: ${tokens.url(req, res)}`,
      `request body: ${JSON.stringify((req as any).body || {})}`,
      `status: ${tokens.status(req, res)}`,
      `execution time: ${tokens['response-time'](req, res)} ms`,
    ].join('; ');
    logger[loggerMethod](msg);
    return null;
  }),
};
