const express = require("express");
// cors: share resources
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const multer = require("multer");
const firebase = require("./config/firebase");
const uploadFile = require("./handlers/upload-file");

require("dotenv").config();

const app = express();

// cơ chế truyền tập tin
app.use(cors({ origin: true, credentials: true }));

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded()); //Parse URL-encoded bodies

//app.use(upload.single("file"));

// Import Routes
const accountRoute = require("./routes/account");
const bookRoute = require("./routes/book");

// Routes
app.get("/", (req, res) => {
    res.send("Library Management");
});
app.use("/accounts", accountRoute);
app.use("/books", bookRoute);

// Set up environment
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
