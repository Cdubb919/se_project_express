const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  CONFLICT,
  UNAUTHORIZED,
} = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch((err) => {
      console.error("Error in getUsers:", err);
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
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
      console.error("Error in createUser:", err);

      if (err.code === 11000) {
        return res.status(CONFLICT).send({ message: 'Email already exists.' });
      }

      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Invalid user data' });
      }

      res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      console.error("Error in getCurrentUser:", err);

      if (err.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: 'User not found.' });
      }

      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Invalid user ID format.' });
      }

      res.status(INTERNAL_SERVER_ERROR).send({ message: "An error has occurred on the server" });
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
      console.error("Error in updateCurrentUser:", err);

      if (err.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: 'User not found.' });
      }

      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Invalid user data' });
      }

      res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(BAD_REQUEST).send({ message: 'Email and password are required' });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(OK).send({ token });
    })
    .catch((err) => {
      console.error("Error in login:", err);

      if (err.message === 'Incorrect email or password') {
        return res.status(UNAUTHORIZED).send({ message: 'Incorrect email or password' });
      }

      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: 'An error has occurred on the server' });
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  login,
};



