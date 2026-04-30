// /server/src/modules/auth/repositories/user.repository.js

const users = new Map();

/**
 * userId -> { userId, email, passwordHash }
 */

const createUser = (user) => {
  users.set(user.email, user);
};

const findByEmail = (email) => {
  return users.get(email);
};

const clearUsers = () => {
  users.clear();
};

module.exports = {
  createUser,
  findByEmail,
  clearUsers,
};
