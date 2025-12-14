const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');

const { JWT_SECRET } = require('../utils/config');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({ name, avatar, email, password: hash })
    )
    .then((user) => {
      const userData = user.toObject();
      delete userData.password;
      res.status(201).send(userData);
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
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('User not found.'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid user ID format.'));
      }

      return next(err);
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => new NotFoundError('User not found.'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Invalid user data.'));
      }

      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid user ID format.'));
      }

      return next(err);
    });

  return null;
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new BadRequestError('Email and password are required.')
    );
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      return res.send({ token });
    })
    .catch(() =>
      next(new UnauthorizedError('Incorrect email or password.'))
    );

  return null;
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  login,
};
