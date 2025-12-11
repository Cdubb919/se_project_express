const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const {
  UNAUTHORIZED_ERROR_CODE,
} = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next({
      statusCode: UNAUTHORIZED_ERROR_CODE,
      message: "Authorization required",
    });
  }

  const token = authorization.replace("Bearer ", "");

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next({
      statusCode: UNAUTHORIZED_ERROR_CODE,
      message: "Authorization required",
    });
  }

  req.user = payload;
  return next();
};

module.exports = auth;
