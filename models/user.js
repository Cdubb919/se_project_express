const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
});

userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  const user = await this.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Incorrect email or password');
  }

  const matched = await bcrypt.compare(password, user.password);

  if (!matched) {
    throw new Error('Incorrect email or password');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);
