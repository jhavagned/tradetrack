const validateLogin = ({ email, password }) => {
  if (!email || typeof email !== "string") {
    return "Valid email is required";
  }

  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};

module.exports = {
  validateLogin,
};
