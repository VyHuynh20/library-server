const express = require("express");
// cors: share resources
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const multer = require("multer");
const firebase = require("./config/firebase");
const uploadFile = require("./handlers/upload-file");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"], //Chan tat ca cac domain khac ngoai domain nay
    credentials: true, //Để bật cookie HTTP qua CORS
  })
);

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

// Import Routes
const accountRoute = require("./routes/account");
const bookRoute = require("./routes/book");
const tagRoute = require("./routes/tag");
const categoryRoute = require("./routes/category");
const bookcaseRoute = require("./routes/bookcase");
const noteRoute = require("./routes/note");
const commentRoute = require("./routes/comment");
const replyRoute = require("./routes/reply");
const transactionRoute = require("./routes/transaction");
const adminRoute = require("./routes/admin");

// Routes
app.get("/", (req, res) => {
  res.send("Library Management");
});
app.use("/accounts", accountRoute);
app.use("/books", bookRoute);
app.use("/tags", tagRoute);
app.use("/categories", categoryRoute);
app.use("/bookcases", bookcaseRoute);
app.use("/notes", noteRoute);
app.use("/comments", commentRoute);
app.use("/replies", replyRoute);
app.use("/transactions", transactionRoute);
app.use("/admin", adminRoute);

// Set up environment
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
