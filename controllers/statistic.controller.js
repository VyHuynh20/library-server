const Book = require("../models/Book");

exports.getBookStatics = async function (req, res) {
    try {
        let books = await Book.find().select(
            "price totalRead createdAt totalLike totalDislike"
        );
        //NOTE: new
        const today = new Date();
        let newBooks = books.filter(
            (item) =>
                item.createdAt.getMonth() == today.getMonth() &&
                item.createdAt.getFullYear() == today.getFullYear()
        );
        let totalNewBooks = newBooks.length;

        // Total books
        let totalBooks = await Book.countDocuments();

        // Sold
        let soldListBook = books.filter((item) => item.totalRead > 0);
        let soldBooks = soldListBook.length;

        return res.status(200).json({ totalNewBooks, totalBooks, soldBooks });
    } catch (err) {
        res.status(500).json({ message: err || "Something went wrong" });
    }
};
