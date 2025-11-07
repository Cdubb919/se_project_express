const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;

  const message = err.message || "An unexpected error occurred on the server";

  res.status(statusCode).send({ message });
};

module.exports = errorHandler;
