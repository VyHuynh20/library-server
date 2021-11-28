const uploadFile = async (filename) => {
    const uuid = require("uuid-v4");
    const firebase = require("../config/firebase");
    // CHANGE: The path to your service account

    var bucket = firebase.bucket;

    /*D:\VY HUYNH\4rd Year\Tiểu luận chuyên ngành\Project\server\public\files*/

    //var filename = "../server/public/files/Martin 2009 Clean code.pdf";

    async function upload() {
        const metadata = {
            metadata: {
                // This line is very important. It's to create a download token.
                firebaseStorageDownloadTokens: uuid(),
            },
            contentType: "application/pdf",
            cacheControl: "public, max-age=31536000",
        };

        // Uploads a local file to the bucket
        const url = await bucket.upload(filename, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            metadata: metadata,
        });

        console.log(`${filename} uploaded.`);

        // get link
        console.log(url[0].metadata.mediaLink);
    }

    upload().catch(console.error);
};

module.exports = uploadFile;
