const Bookcase = require("../models/BookInBookcase");
const Book = require("../models/Book");

const Note = require("../models/Note");

exports.getNotesByAccountId = async function (req, res) {
  const user = req.locals.account;

  Note.find({ user: user._id }, ["user", "book", "note", "page"])
    .populate("user", ["nickname", "avatar"])
    .populate("book", ["name", "authors", "tags", "image"])
    .then((bookcase) => {
      if (bookcase) {
        res.json(bookcase);
      } else {
        res.status(400).json({ message: "No book in bookcase found!" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
      console.log(err);
    });
};

exports.detailNoteinBook = async function (req, res) {
  const user = req.locals.account;
  const bookId = req.params.bookId;

  Bookcase.find({ user: user._id, book: bookId }, ["user", "book", "progress"])
    .populate("book", ["name", "authors", "tags", "image"])
    .then((bookcase) => {
      if (bookcase) {
        res.json(bookcase);
      } else {
        res.status(400).json({
          message: "No book in bookcase found!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
      console.log(err);
    });
};

exports.getNotesActiveByAccountId = async function (req, res) {
  const user = req.locals.account;

  Note.find({ user: user._id, status: 1 }, ["user", "book", "progress"])
    .populate("book", ["name", "authors", "tags", "image"])
    .then((bookcase) => {
      if (bookcase) {
        res.json(bookcase);
      } else {
        res.status(400).json({
          message: "No book in bookcase found!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
      console.log(err);
    });
};
