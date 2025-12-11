const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const {
  OK,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  CONFLICT_ERROR_CODE,
} = require('../utils/errors');

const { JWT_SECRET } = require('../utils/config');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userData = user.toObject();
      delete userData.password;
      res.status(CREATED).send(userData);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next({
          statusCode: CONFLICT_ERROR_CODE,
          message: 'Email already exists.',
        });
      }

      if (err.name === 'ValidationError') {
        return next({
          statusCode: BAD_REQUEST,
          message: 'Invalid user data.',
        });
      }

      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => ({
      statusCode: NOT_FOUND_ERROR_CODE,
      message: 'User not found.',
    }))
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next({
          statusCode: BAD_REQUEST,
          message: 'Invalid user ID format.',
        });
      }

      return next(err);
    });
};

const updateCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => ({
      statusCode: NOT_FOUND_ERROR_CODE,
      message: 'User not found.',
    }))
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next({
          statusCode: BAD_REQUEST,
          message: 'Invalid user data.',
        });
      }

      if (err.name === 'CastError') {
        return next({
          statusCode: BAD_REQUEST,
          message: 'Invalid user ID format.',
        });
      }

      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next({
      statusCode: BAD_REQUEST,
      message: 'Email and password are required.',
    });
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.status(OK).send({ token });
    })
    .catch((err) => {
      if (err.message === 'Incorrect email or password') {
        return next({
          statusCode: UNAUTHORIZED_ERROR_CODE,
          message: 'Incorrect email or password.',
        });
      }

      return next(err);
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  login,
};
