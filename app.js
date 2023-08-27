require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const router = require('./routes/router');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handleError');
const { createUser, login } = require('./controllers/users');
const { createUserValidation, loginValidation } = require('./middlewares/validation');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV, PORT = 3000, MONGO_DB } = process.env;
const app = express();

const corsOptions = {
  origin: 'https://vitaliydiploma.nomoredomainsicu.ru',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(cookieParser());
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', loginValidation, login);
app.post('/signup', createUserValidation, createUser);
app.use(auth);
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(handleError);

mongoose.connect(NODE_ENV === 'production' ? MONGO_DB : 'mongodb://127.0.0.1:27017/bitfilmsdb', {});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
