const usersRouter = require('express').Router();
const {
  getLoginUser,
  updateUser,
} = require('../controllers/users');

const {
  updateUserValidation,
} = require('../middlewares/validation');

usersRouter.get('/me', getLoginUser);
usersRouter.patch('/me', updateUserValidation, updateUser);

module.exports = usersRouter;
