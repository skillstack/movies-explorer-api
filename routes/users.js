const usersRouter = require('express').Router();
const {
  getLoginUser,
  updateUser,
  logoutUser,
} = require('../controllers/users');

const {
  updateUserValidation,
} = require('../middlewares/validation');

usersRouter.get('/me', getLoginUser);
usersRouter.patch('/me', updateUserValidation, updateUser);
usersRouter.get('/signout', logoutUser);

module.exports = usersRouter;
