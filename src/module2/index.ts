require('dotenv').config();

const express = require('express');
const cors = require('cors');
const router = require('./router/index');
const DB = require('./controllers/db-controller');

const PORT = process.env.MODULE_2_PORT || 8000;

const app = express();
app.disable('x-powered-by');

const dbInstance = new DB();
const appRouter = router(dbInstance);

// middlewares
app.use(express.json());
app.use(cors());
app.use('/api', appRouter);

app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
