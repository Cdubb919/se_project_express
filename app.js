const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", mainRouter); 

app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

module.exports = app;
