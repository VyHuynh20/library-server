const bcryptjs = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(6);
  const hashed = await bcryptjs.hash(password, salt);
  return { salt, hashed };
};
module.exports = hashPassword;
