const ClothingItem = require("../models/clothingitem");

const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, FORBIDDEN } = require('../utils/errors');

const createItem = (req, res) => {

  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(CREATED).send({ data: item });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: "Invalid item data" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "An unexpected error occurred while creating the item." });
    });
};



const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(OK).send(items))
    .catch((e) => {
      console.error("Error in getItems:", e);
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
};

const getItemById = (req, res) => {
  const { id } = req.params;

  ClothingItem.findById(id)
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.status(OK).send(item);
    })
    .catch((e) => {
      console.error("Error in getItemById:", e);
      if (e.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
};


const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== userId) {
        return res.status(FORBIDDEN).send({ message: "You are not authorized to delete this item." });
      }

      return item.deleteOne()
        .then(() => res.send({ message: "Item deleted" }));
    })
    .catch((e) => {
      console.error("Error in deleteItem:", e);
      if (e.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      if (e.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
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
      console.error("Error in likeItem:", err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format." });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
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
      console.error("Error in dislikeItem:", err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format." });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  deleteItem,
  likeItem,
  dislikeItem,
}