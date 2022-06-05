const Bookcase = require("../models/BookInBookcase");
const Book = require("../models/Book");

const removeVie = require("../handlers/removeVie");
const Note = require("../models/Note");
const Account = require("../models/Account");
const BookInBookcase = require("../models/BookInBookcase");
const createTransaction = require("../middlewares/createTransaction");

exports.get = async function (req, res) {
  console.log(">>> get Bookcase info");
  const { _id, name, nickname, email, avatar, listBooks, listNotes, cover } =
    res.locals.account;
  return res.status(200).json({
    _id,
    name,
    nickname,
    email,
    avatar,
    listBooks,
    listNotes,
    cover,
  });
};

exports.addBookToBookcase = async function (req, res) {
  const user = res.locals.account;
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
      user: user._id,
      book: bookId,
    });
    await bookcase.save();
    return res.status(200).json(bookcase);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  }
};

exports.listBookInBookcase = async function (req, res) {
  console.log(">>> get books in bookcase");
  const user = res.locals.account;
  Bookcase.find({ user: user._id }, ["user", "book", "progress"])
    .populate({
      path: "book",
      select: ["_id", "name", "authors", "tags", "image"],
      populate: { path: "tags" },
    })

    .then((bookcase) => {
      res.status(200).json(bookcase);
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
      console.log(err);
    });
};

exports.deleteBook = async function (req, res) {
  const user = res.locals.account;
  const { bookId } = req.params;
  console.log("remove " + bookId);
  try {
    const bookcase = await Bookcase.deleteMany({
      user: user._id,
      book: bookId,
    });

    if (bookcase) {
      let newUser = await Account.findById(user._id).populate({
        path: "listNotes",
        select: "_id book ",
      });
      console.log({ newUser });
      newUser.listBooks = newUser._doc.listBooks.filter(
        (item) => item.toString() !== bookId
      );
      newUser.listNotes = newUser._doc.listNotes.filter(
        (item) => item.book.toString() !== bookId
      );
      await newUser.save();
      const note = await Note.deleteMany({
        user: user._id,
        book: bookId,
      });
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

exports.buyBook = async function (req, res) {
  console.log(">>> buy book");
  try {
    let account = res.locals.account;
    const { bookId } = req.body;
    console.log({ bookId });
    let book = await Book.findById(bookId);
    if (account.listBooks.includes(bookId)) {
      //NOTE: sách đã có trong tủ sách
      return res.status(210).json({ message: "book is exit in bookcase" });
    }
    if (account.hoa < book.price) {
      //NOTE: thanh toán thất bại, hoa không đủ
      return res.status(211).json({ message: "failed" });
    }
    let newBookInBookCase = new BookInBookcase({
      user: account._id,
      book: book._id,
      key: book.key,
    });

    //NOTE: create Transaction
    const userId = account._id;
    const type = "buy-book";
    const message = `Mua quyền sách '${book.name} [${book._id}]'`;
    const hoa = 0 - book.price;
    const transaction = createTransaction({ type, message, userId, hoa });
    if (transaction) {
      book.totalRead = book.totalRead + 1;
      account.listBooks.push(bookId);
      await account.save();
      await newBookInBookCase.save();
      await book.save();
      return res.status(200).json(newBookInBookCase);
    }
    return res.status(211).json({ message: "failed" });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.buyAndReadNow = async function (req, res) {
  try {
    let account = res.locals.account;
    const { bookId } = req.body;
    let book = await Book.findById(bookId);
    if (account.listBooks.includes(bookId)) {
      //NOTE: sách đã có trong tủ sách
      return res.status(210).json({ message: "book is exit in bookcase" });
    }
    if (account.hoa < book.price) {
      //NOTE: thanh toán thất bại, hoa không đủ
      return res.status(211).json({ message: "failed" });
    }
    let newBookInBookCase = new BookInBookcase({
      user: account._id,
      book: book._id,
      key: book.key,
    });

    //NOTE: create Transaction
    const userId = account._id;
    const type = "buy-book";
    const message = `Mua quyền sách '${book.name} [${book._id}]'`;
    const hoa = 0 - book.price;
    const transaction = createTransaction({ type, message, userId, hoa });
    if (transaction) {
      book.totalRead = book.totalRead + 1;
      account.listBooks.push(bookId);
      //NOTE: create new note
      let newNote = new Note({
        user: account._id,
        name: "Note - " + book.name,
        book: book._id,
        image: book.image,
      });
      await newNote.save();
      await account.save();
      await book.save();
      await newBookInBookCase.save();
      return res.status(200).json(newNote);
    }
    return res.status(211).json({ message: "failed" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getBookInBookcase = async function (req, res) {
  try {
    let account = res.locals.account;
    const { _id } = req.params;
    const book = await Bookcase.findOne({
      book: _id,
      user: account._id,
    }).populate({
      path: "book",
      select: ["_id", "image", "name", "link", "key"],
    });
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.refundBook = async function (req, res) {
  try {
    let account = res.locals.account;
    let booksRefund = await Bookcase.find({
      user: account._id,
      progress: 100,
      isRefunded: 0,
    }).populate({ path: "book", select: "_id name price" });
    if (booksRefund.length === 0) {
      return res.status(200).json({ bookNumber: 0, hoa: 0, totalHoa: 0 });
    }

    let bookNumber = 0;
    let hoaNumber = 0;
    let totalHoaNumber = 0;
    for (let index = 0; index < booksRefund.length; index++) {
      let element = booksRefund[index];
      const type = "refund";
      const hoa = (element.book.price + 1 - ((element.book.price + 1) % 2)) / 2;
      const userId = account._id;
      const message = `Đọc hoàn thành quyển sách '${element.name} [${element._id}]'`;
      const transaction = await createTransaction({
        type,
        message,
        userId,
        hoa,
      });
      hoaNumber += transaction.hoa;
      totalHoaNumber = transaction.totalHoa;
      bookNumber += 1;
      element.isRefunded = 1;
      await element.save();
    }
    return res.status(200).json({
      bookNumber: bookNumber,
      hoa: hoaNumber,
      totalHoa: totalHoaNumber,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
