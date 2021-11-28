var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

// Initialize firebase admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Cloud storage
const bucket = admin.storage().bucket("gs://library-713ea.appspot.com/");

module.exports = {
    bucket,
};
