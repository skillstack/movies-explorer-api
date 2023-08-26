const movieSchema = require('../models/movie');
const BadRequestError = require('../utils/errors/BadRequestError');
const NotFoundError = require('../utils/errors/NotFoundError');
const ForbiddenError = require('../utils/errors/ForbiddenError');
const { HTTP_STATUS_CREATED } = require('../utils/constants');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  movieSchema.find({ owner })
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;

  movieSchema.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.status(HTTP_STATUS_CREATED)
        .send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { _id } = req.params;
  const user = req.user._id;

  movieSchema.findById(_id)
    .orFail()
    .then((movie) => {
      const owner = movie.owner.toString();

      if (owner !== user) {
        return next(new ForbiddenError('В удалении отказано, вы не добавляли этот фильм'));
      }
      return movieSchema.deleteOne(movie)
        .then(() => res.send({ message: 'Фильм удален' }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при удалении фильма'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(`Фильм с указанным id: ${_id} не найден`));
      }
      return next(err);
    });
};
