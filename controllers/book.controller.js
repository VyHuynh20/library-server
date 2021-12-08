const Book = require("../models/Book");
const Tag = require("../models/Tag");

const removeVie = require("../handlers/removeVie");

exports.listBook = async function (req, res) {
    // Book.find({})
    //     .then((books) => res.status(200).json(books))
    //     .catch((err) => {
    //         res.status(404).json({ error: "No book found!" });
    //         console.log(err);
    //     });

    var options = {
        select: "_id name authors image quote tags totalLike totalDislike totalRead createdAt updatedAt",
        page: parseInt(req.body.page) || 1,
        limit: parseInt(req.body.limit) || 10,
        populate: { path: "tags", select: "name" },
    };
    if (req.body.search) {
        let search = removeVietnameseTones(req.query.search);
        var query = {
            namenosign: { $regex: ".*" + search + ".*" },
        };
        var books = await Book.paginate(query, options);
    } else {
        var books = await Book.paginate({}, options);
    }

    return res.json(books);
};

exports.createBook = async function (req, res) {
    const book = new Book(req.body);

    book.namenosign = removeVie(book.name);

    await book.save();
    return res.status(200).json(book);
};

exports.detailBook = async function (req, res) {
    try {
        // react: 1 - like , 2 - dislike, 3 - none
        const react = 0;
        const books = Book.findById(req.params.bookId, [
            "_id",
            "name",
            "image",
            "price",
            "description",
            "authors",
            "quote",
            "tags",
            "totalRead",
            "totalLike",
            "totalDislike",
            "liked",
            "disliked",
            "linkIntro",
        ]).populate("tags", ["_id", "name"]);
        const account = res.locals.account;
        if (account) {
            if (books.liked.includes(account._id)) {
                react = 1;
            }
            if (books.disliked.includes(account._id)) {
                react = 2;
            }
        }

        return res.status(200).json({ book: books }, { react: react });
    } catch (err) {
        return res.status(400).json({ error: "Something went wrong!" });
    }
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

    Book.find({ tags: tagId }, [
        "_id",
        "name",
        "authors",
        "quote",
        "tags",
        "image",
        "price",
        "totalLike",
        "totalDislike",
        "totalRead",
    ])
        .populate("tags", ["_id", "name"])
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            res.status(404).json({ error: "No book found!" });
            console.log(err);
        });
};

exports.getSlideshow = async function (req, res) {
    Book.find({})
        .select("_id name image")
        .limit(5)
        .sort({ name: -1 })
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            res.status(400).json({ error: "Something went wrong" });
            console.log(err);
        });
};
