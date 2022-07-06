const fs = require("fs");

const removeTemp = function (path) {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = removeTemp;
