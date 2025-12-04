const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { OK, CREATED } = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} = require('../utils/customErrors');

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
        return next(new ConflictError('Email already exists.'));
      }

      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Invalid user data.'));
      }

      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => new NotFoundError('User not found.'))
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid user ID format.'));
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
    .orFail(() => new NotFoundError('User not found.'))
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Invalid user data.'));
      }

      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid user ID format.'));
      }

      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email and password are required.'));
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(OK).send({ token });
    })
    .catch((err) => {
      if (err.message === 'Incorrect email or password') {
        return next(new UnauthorizedError('Incorrect email or password.'));
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
