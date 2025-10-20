const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index.js");

const app = express();
const { PORT = 3001 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');

app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133'
  };
  next();
});

app.use(express.json());
app.use("/", mainRouter);

const routes = require("./routes")
app.use(routes)

app.listen(PORT, () => {
  console.log("Listening on port ${PORT}");
});