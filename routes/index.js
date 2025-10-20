const router = require("express").Router();

const userRouter = require("./users");

router.use("/users", userRouter);

const clothingItem = require("./clothingitem")

router.use("/items", clothingItem);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" })
})

module.exports = router;