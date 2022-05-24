require('dotenv').config();

const express = require('express');
const cors = require('cors');
const router = require('./router/index');
const errorMiddleware = require('./middleware/error-handling');

const UserDB = require('./repository/user-repository');
const UserDBModel = require('./models/user-model');

const PORT = process.env.MODULE_2_PORT || 8000;

const app = express();
app.disable('x-powered-by');

const userDBInstance = new UserDB(new UserDBModel());
const appRouter = router(userDBInstance);

// middlewares
app.use(express.json());
app.use(cors());
app.use('/api', appRouter);
app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
