const Bookcase = require("../models/Bookcase");
const Book = require("../models/Book");

const removeVie = require("../handlers/removeVie");

exports.addBooktoBookcase = async function (req, res) {
    const user = req.account.locals.account;
    const bookId = req.body;
    try {
        const existingBook = await Bookcase.findOne({
            user: user._id,
            book: bookId,
        });
        if (existingBook) {
            return res
                .status(400)
                .json({ error: "This book is already in your bookcase" });
        }
        const bookcase = new Bookcase({
            user: userId,
            book: bookId,
        });
        await bookcase.save();
        return res.status(200).json(bookcase);
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};

exports.detailBookcase = async function (req, res) {
    const user = req.account.locals.account;

    Bookcase.findOne({ user: user._id }, ["user", "book", "progress"])
        .populate("book", ["name", "authors", "tags"])
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

exports.removeBook = async function (req, res) {
    const user = req.account.locals.account;
    const bookId = req.body;
    try {
        const bookcase = await Bookcase.findByIdAndDelete({
            user: user._id,
            book: bookId,
        });
        if (bookcase) {
            return res.status(200).json({ error: "Remove successfully!" });
        }
        res.status(404).json({ error: "Not found!" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};

exports.updateBookcase = async function (req, res) {
    const bookcaseId = req.params.bookcaseId;
    const progress = req.body;
    try {
        const bookcase = await Bookcase.findOne({ _id: bookcaseId });
        bookcase.progress = progress;

        if (progress > 0) {
            bookcase.status = 1;
        }
        if ((progress = 100)) {
            bookcase.status = 2;
        }
        return res.status(200).json({ error: "Update successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};
