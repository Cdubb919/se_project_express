const express = require('express');
const {
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require('../controllers/clothingitem');

const { validateCardBody, validateId } = require('../middlewares/validation');

const router = express.Router();

router.post('/', validateCardBody, createItem);

router.delete('/:itemId', validateId, deleteItem);

router.put('/:itemId/likes', validateId, likeItem);
router.delete('/:itemId/likes', validateId, dislikeItem);

module.exports = router;
