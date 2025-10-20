const ClothingItem = require("../models/clothingitem");

const createItem = (req, res) => {
  console.log(req.body);

  const { name, weather, imageUrl } = req.body;

  const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } = require('../utils/errors');

  ClothingItem.create({ name, weather, imageURL })
    .then((item) => {
      res.status(CREATED).send({ data: item });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: "Invalid item data" });
      }
      res.status(INTERNAL_SERVER_ERROR).send({ message: "An unexpected error occurred while creating the item." });
    });
};


const getItems = (req, res) => {
  ClothingItem.find({}).then((items) => res.status(OK).send(items))
    .catch((e) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Error from getItems", e })
    })
}


const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.send({ message: "Item deleted" }))
    .catch((e) => {
      if (e.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      } else if (e.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format" });
      }
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Error from deleteItem", error: e.message });
    });
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(OK).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format." });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(OK).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format." });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
}