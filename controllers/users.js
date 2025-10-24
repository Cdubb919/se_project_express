const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch((err) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  User.create({ name, avatar, email, password })
    .then((user) => {
      const userData = user.toObject();
      delete userData.password;
      res.status(CREATED).send(userData);
    })
    .catch((err) => {
      console.error(err);

      if (err.code === 11000) {
        return res.status(409).send({ message: 'Email already exists.' });
      }

      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }

      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: 'User not found.' });
      }

      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Invalid user ID format.' });
      }

      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const updateCurrentUser = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: 'User not found.' });
      }

      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }

      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};


const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(OK).send({ token });
    })
    .catch((err) => {
      console.error(err);
      res.status(401).send({ message: 'Incorrect email or password' });
    });
};

module.exports = { getUsers, createUser, getCurrentUser, login, updateCurrentUser };



