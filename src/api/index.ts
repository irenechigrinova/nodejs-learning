import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import router from './router/index';
import errorMiddleware from './middleware/error-handling';
import AppDataSource from './data-source';
import User from './entities/User';
import UserRepository from './repository/user-repository';

const PORT = process.env.MODULE_2_PORT || 8000;

const app = express();
app.disable('x-powered-by');

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const appRouter = router(userRepository);

// middlewares
app.use(express.json());
app.use(cors());
app.use('/api/v1', appRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  AppDataSource.initialize()
    .then(() => {
      console.log(`Server started on PORT = ${PORT}`);
    })
    .catch((error) => console.log(error));
});
