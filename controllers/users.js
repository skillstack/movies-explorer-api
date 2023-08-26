const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/user');
const BadRequestError = require('../utils/errors/BadRequestError');
const ConflictError = require('../utils/errors/ConflictError');
const NotFoundError = require('../utils/errors/NotFoundError');
const { HTTP_STATUS_CREATED } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getLoginUser = (req, res, next) => {
  userSchema.findById(req.user._id)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при запросе пользователя'));
      }
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(`Пользователь по указанному id: ${req.user._id} не найден`));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      userSchema.create({
        name, email, password: hash,
      })
        .then((user) => {
          const userData = user.toObject({ useProjection: true });
          res.status(HTTP_STATUS_CREATED)
            .send(userData);
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(new ConflictError('Пользователь с указанным e-mail уже существует'));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret', { expiresIn: '7d' });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      };

      res.cookie('jwt', token, cookieOptions);
      res.send({ message: 'Успешная аутентификация', email });
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;

  userSchema.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с указанным e-mail уже существует'));
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении пользователя'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(`Пользователь по указанному id: ${req.user._id} не найден`));
      }
      return next(err);
    });
};

module.exports.logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('jwt').send({ message: 'Вы вышли' });
  } catch (err) {
    next(err);
  }
};
