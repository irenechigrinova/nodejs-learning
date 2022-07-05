import 'dotenv/config';
import 'reflect-metadata';
import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';

import Logger from './logger';

import errorMiddleware from './middleware/error-handling';
import AppDataSource from './data-source';

import rootRouter from './router';

const PORT = process.env.MODULE_2_PORT || 8000;

const app = express();
app.disable('x-powered-by');

// middlewares
app.use(express.json());
app.use(cors());
app.use(Logger.httpLogger);
app.use('/api/v1', rootRouter);
app.use(errorMiddleware);

app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ error: 'Server error', details: { message: 'url not found' } });
});

app.listen(PORT, () => {
  AppDataSource.initialize()
    .then(() => {
      console.log(`Server started on PORT = ${PORT}`);
    })
    .catch((error) => Logger.logger('error').error(JSON.stringify(error)));
});
