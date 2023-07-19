const moviesRouter = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

const {
  movieIdValidation,
  createMovieValidation,
} = require('../middlewares/validation');

moviesRouter.get('/', getMovies);
moviesRouter.post('/', createMovieValidation, createMovie);
moviesRouter.delete('/:_id', movieIdValidation, deleteMovie);

module.exports = moviesRouter;
