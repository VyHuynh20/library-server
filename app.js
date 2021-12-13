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
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

// Import Routes
const accountRoute = require("./routes/account");
const bookRoute = require("./routes/book");
const tagRoute = require("./routes/tag");
const categoryRoute = require("./routes/category");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Library Management");
});
app.use("/accounts", accountRoute);
app.use("/books", bookRoute);
app.use("/tags", tagRoute);
app.use("/categories", categoryRoute);

// Set up environment
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
