const admin = require("firebase-admin");
const { v1: uuidv1 } = require("uuid");
const mime = require("mime-types");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Cloud storage
const bucket = admin.storage().bucket("gs://library-online-3ec9d.appspot.com");

async function uploadFirebase(filePath, remoteFile) {
  let uuid = uuidv1();
  const fileMime = mime.lookup(filePath);
  return bucket
    .upload(filePath, {
      destination: remoteFile,
      uploadType: "media",
      metadata: {
        contentType: fileMime,
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    })
    .then((data) => {
      let file = data[0];
      return Promise.resolve(
        "https://firebasestorage.googleapis.com/v0/b/" +
          bucket.name +
          "/o/" +
          encodeURIComponent(file.name) +
          "?alt=media&token=" +
          uuid
      );
    })
    .catch((e) => Promise.reject());
}

module.exports = {
  bucket,
  uploadFirebase
};
