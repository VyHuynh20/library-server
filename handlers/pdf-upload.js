const { PDFNet } = require("@pdftron/pdfnet-node");
const fs = require("fs");
const readFilePdfByUrl = async (url) => {
  let page = 0;
  let introPage = 5;
  async function read() {
    let doc = await PDFNet.PDFDoc.createFromURL(url);
    await doc.initStdSecurityHandlerUString("1234");
    doc.initSecurityHandler();
    doc.removeSecurity();
    page = await doc.getPageCount();
    if (page < 10) {
      introPage = 1;
    }
    const intro = await PDFNet.PDFDoc.create();
    await intro.insertPages(
      1,
      doc,
      1,
      introPage,
      PDFNet.PDFDoc.InsertFlag.e_none
    );

    const pdfdraw = await PDFNet.PDFDraw.create(92);
    const pg = await doc.getPage(1);
    // await pdfdraw.export(pg, "pdf/thumbnail.png", "PNG");
    const pngBuffer = await pdfdraw.exportStream(currPage, "PNG");
    doc = await encryptingPdf(doc);
    await doc.save("pdf/doc.pdf", PDFNet.SDFDoc.SaveOptions.e_linearized);
    await intro.save("pdf/intro.pdf", PDFNet.SDFDoc.SaveOptions.e_linearized);
    console.log({ pngBuffer });
  }
  // add your own license key as the second parameter, e.g. in place of 'YOUR_LICENSE_KEY'.
  PDFNet.runWithCleanup(
    read,
    "demo:1656921694267:7a49f5e30300000000d6fe276d28c01b00cf2e91c97c84146b54dcfbc7"
  )
    .catch(function (error) {
      console.log("Error: " + JSON.stringify(error));
      return error;
    })
    .then(function () {
      PDFNet.shutdown();
      console.log({ page });
      return { message: "success" };
    });
};

async function readFilePdfByFilePath(filename, key, createThumbnail, password) {
  let page = 0;
  let introPage = 5;
  const docPath = "pdf/des/doc.pdf";
  const thumbnailPath = "pdf/des/thumbnail.png";
  const introPath = "pdf/des/intro.pdf";
  async function read() {
    console.log({ filename });
    //get file
    const doc = await PDFNet.PDFDoc.createFromFilePath(filename);
    if (key) {
      console.log("unlock pdf with " + key);
      await doc.initStdSecurityHandlerUString(key);
    }
    //remove current security
    doc.removeSecurity();
    //create new handle security
    doc.initSecurityHandler();

    //split file to intro file
    page = await doc.getPageCount();
    if (page < 10) {
      introPage = 1;
    }
    const intro = await PDFNet.PDFDoc.create();
    await intro.insertPages(
      1,
      doc,
      1,
      introPage,
      PDFNet.PDFDoc.InsertFlag.e_none
    );

    if (createThumbnail) {
      //create thumbnail
      const pdfdraw = await PDFNet.PDFDraw.create(92);
      const pg = await doc.getPage(1);
      await pdfdraw.export(pg, thumbnailPath, "PNG");
    }

    if (password) {
      const newHandler = await PDFNet.SecurityHandler.createDefault();
      // Set a new password required to open a document
      const user_password = password;
      newHandler.changeUserPasswordUString(user_password);
      // Set Permissions
      newHandler.setPermission(
        PDFNet.SecurityHandler.Permission.e_print,
        false
      );
      newHandler.setPermission(
        PDFNet.SecurityHandler.Permission.e_extract_content,
        true
      );
      // Note: document takes the ownership of newHandler.
      doc.setSecurityHandler(newHandler);
    }

    await doc.save(docPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
    await intro.save(introPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
  }
  // add your own license key as the second parameter, e.g. in place of 'YOUR_LICENSE_KEY'.
  return new Promise((resolve, reject) => {
    PDFNet.runWithCleanup(
      read,
      "demo:1656921694267:7a49f5e30300000000d6fe276d28c01b00cf2e91c97c84146b54dcfbc7"
    )
      .catch(function (error) {
        // PDFNet.shutdown();
        console.log("Error: " + JSON.stringify(error));
        reject();
      })
      .then(function () {
        // PDFNet.shutdown();
        console.log({ page });
        resolve({ docPath, introPath, thumbnailPath });
      });
  });
}

async function encryptingPdf(doc) {
  let _doc = doc;
  const newHandler = await PDFNet.SecurityHandler.createDefault();
  // Set a new password required to open a document
  const user_password = "test";
  newHandler.changeUserPasswordUString(user_password);
  // Set Permissions
  newHandler.setPermission(PDFNet.SecurityHandler.Permission.e_print, false);
  newHandler.setPermission(
    PDFNet.SecurityHandler.Permission.e_extract_content,
    true
  );
  // Note: document takes the ownership of newHandler.
  _doc.setSecurityHandler(newHandler);
  return _doc;
}

module.exports = {
  readFilePdfByUrl,
  readFilePdfByFilePath,
};
