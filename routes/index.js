const express = require("express");
const { createUser, login } = require("../controllers/users");
const userRouter = require("./users");
const clothingItemRouter = require("./clothingitem");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", createUser);
router.post("/signin", login);

const { getItems } = require("../controllers/clothingitem");
router.get("/items", getItems);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

module.exports = router;


