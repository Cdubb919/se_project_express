module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
};

const { JWT_SECRET = "super-strong-secret" } = process.env;

module.exports = {
  JWT_SECRET,
};