const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;

  res.status(statusCode).send({
    message:
      statusCode === INTERNAL_SERVER_ERROR
        ? "An error occurred on the server"
        : err.message,
  });
};

module.exports = errorHandler;
