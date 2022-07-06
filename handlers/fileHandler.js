const fs = require("fs");
const readFile = async (path) => {
  const fileSave = await fs.readFileSync(path);
  return fileSave;
};
const saveFile = (name, data) => {
  return new Promise((resolve, reject) => {
    // Saving File
    console.log(" |> Saving file " + name + " ...");
    fs.writeFile(name, data, function (err) {
      if (err) {
        console.log(" |> Save file fail!! : " + err);
        reject();
      } else {
        console.log(" |> The file was saved!");
        resolve();
      }
    });
  });
};

const deleteFile = (filename) => {
  fs.unlink(filename, function (err) {
    if (err) {
      console.log("SORRY NOT DELETED");
    }
    // if no error, file has been deleted successfully
    console.log("File deleted!");
  });
};

module.exports = {
  readFile,
  saveFile,
  deleteFile,
};
