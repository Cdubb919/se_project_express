const express = require('express');
const {
  validateUserBody,
  validateLogin,
  validateCardBody,
  validateId,
} = require('../middlewares/validation');

const auth = require('../middlewares/auth');
const userRouter = require('./users');
const clothingItemRouter = require('./clothingitem');

const {
  createUser,
  login,
} = require('../controllers/users');

const { getItems, getItemById } = require('../controllers/clothingitem');

const router = express.Router();

router.post('/signup', validateUserBody, createUser);
router.post('/signin', validateLogin, login);

router.get('/items', getItems);
router.get('/items/:id', validateId, getItemById);

router.use(auth);

router.use('/users', userRouter);
router.use('/items', clothingItemRouter);

module.exports = router;
