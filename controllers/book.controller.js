const Book = require("../models/Book");
const Tag = require("../models/Tag");

const removeVie = require("../handlers/removeVie");

exports.listBook = async function (req, res) {
    Book.find({})
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            res.status(404).json({ error: "No book found!" });
            console.log(err);
        });
};

exports.createBook = async function (req, res) {
    const book = new Book(req.body);

    book.namenosign = removeVie(book.name);

    await book.save();
    return res.status(200).json(book);
};

exports.detailBook = async function (req, res) {
    Book.findById(req.params.bookId, [
        "_id",
        "name",
        "authors",
        "quote",
        "tags",
    ])
        .populate("tags", ["name", "description"])
        .then((book) => {
            if (book) {
                res.json(book);

                // print tag in tags
                book.tags.forEach((tag) => {
                    console.log(tag.name);
                });
            } else {
                res.status(400).json({ message: "No book found!" });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Something went wrong" });
            console.log(err);
        });
};

exports.editBook = async function (req, res) {
    Book.findByIdAndUpdate(req.params.bookId, req.body)
        .then((book) => res.json(book))
        .catch((err) => {
            res.status(500).json({ message: "Something went wrong" });
            console.log(err);
        });
};

exports.deleteBook = async function (req, res) {
    Book.findByIdAndRemove(req.params.bookId, req.body)
        .then((book) =>
            res.json({ message: "Book entry deleted successfully" })
        )
        .catch((err) => res.status(404).json({ error: "No such a book" }));
};

exports.getBookbyTag = async function (req, res) {
    var tagId = await Tag.findOne({ name: req.params.tagName }).select("_id");

    console.log(tagId);

    Book.find({ tags: tagId }, ["_id", "name", "authors", "quote", "tags"])
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            res.status(404).json({ error: "No book found!" });
            console.log(err);
        });
};
