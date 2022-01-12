const bcryptjs = require("bcryptjs");

const comparePassword = async (salt, password) => {
  const hashed = await bcryptjs.hash(password, salt);
  return hashed;
};
module.exports = comparePassword;
