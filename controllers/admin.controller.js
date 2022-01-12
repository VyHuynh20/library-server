const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const removeVieCharacters = require("../handlers/removeVie");
const comparePassword = require("../middlewares/comparePassword");
const hashPassword = require("../middlewares/hashPassword");
const Account = require("../models/Account");
const Admin = require("../models/Admin");
const Book = require("../models/Book");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");
const Transaction = require("../models/Transaction");

exports.login = async function (req, res) {
  console.log(">>> login");
  try {
    const { username, password } = req.body;
    const adminCheck = await Admin.findOne({ username }).select("salt");
    //const { salt, hashed } = await hashPassword(password);
    if (adminCheck) {
      const hashed = await comparePassword(adminCheck.salt, password);
      const admin = await Admin.findOne({ username, password: hashed }).select(
        "_id name status"
      );
      if (admin) {
        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res.cookie("access_token", token, {
          maxAge: 24 * 60 * 60 * 100,
          httpOnly: true,
          // secure: true;
        });
        res.status(200).json({ admin });
      } else {
        return res.status(404).json({ error: "Sai tài khoản hoặc mật khẩu" });
      }
    } else {
      return res.status(404).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.logout = async function (req, res) {
  console.log(">>> logout");
  res
    .cookie("access_token", "", {
      maxAge: 0,
      httpOnly: true,
      // secure: true;
    })
    .status(200)
    .json("logout success");
};

exports.reSign = async function (req, res) {
  console.log(">>> resign");
  const admin = res.locals.admin;
  if (admin) {
    const { _id, name, status, avatar } = admin;
    return res.json({
      admin: { _id, name, status, avatar },
    });
  }
  return res.status(403).json({
    error: "no Authentication",
  });
};

exports.getAllBooks = async function (req, res) {
  try {
    let books = await Book.find()
      .populate({
        path: "tags",
        select: "_id name",
      })
      .select(
        "_id name tags price totalRead totalLike totalDislike  is_active"
      );
    const comments = await Comment.find();
    for (let index = 0; index < books.length; index++) {
      let element = books[index];
      let sum = 0;
      comments
        .filter((item) => item.book.toString() === element._id.toString())
        .forEach((item) => {
          sum += 1 + item.replies.length;
        });
      element._doc.totalComments = sum;
    }
    return res.status(200).json(books);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getBookDetail = async function (req, res) {
  try {
    let book = await Book.findById(req.params.bookId, [
      "_id",
      "name",
      "key",
      "image",
      "price",
      "description",
      "authors",
      "quote",
      "tags",
      "totalPages",
      "linkIntro",
      "link",
    ]).populate("tags", ["_id", "name"]);

    return res.status(200).json(book);
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getAllTags = async function (req, res) {
  try {
    const tags = await Tag.find().select("_id name is_active");

    return res.status(200).json(tags);
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getAllUsers = async function (req, res) {
  try {
    const users = await Account.find().select(
      "_id nickname name email avatar faculty is_banned dob gender"
    );

    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getUserDetail = async function (req, res) {
  try {
    let user = await Account.findById(req.params.userId);
    const transaction = await Transaction.find({
      user: user._id,
      type: "pomodoro",
    }).select("hoa");
    let sum = 0;
    transaction.forEach((element) => {
      sum += element.hoa * 5;
    });
    user._doc.pomodoro = sum;
    return res.status(200).json(user);
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.banUser = async function (req, res) {
  try {
    const { is_banned } = req.body;
    let user = await Account.findById(req.params.userId);
    if (user) {
      user.is_banned = is_banned;
      await user.save();

      return res.status(200).json({ is_banned, _id: user._id });
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.putBook = async function (req, res) {
  try {
    const {
      name,
      author,
      tags,
      description,
      image,
      quote,
      price,
      link,
      linkIntro,
      key,
      totalPages,
    } = req.body;

    const { bookId } = req.params;

    if (bookId !== "new") {
      let book = await Book.findById(bookId);
      if (book) {
        book.name = name;
        if (name) {
          book.nameNoSign = removeVieCharacters(name);
        }
        book.author = author;
        if (author) {
          book.authorNoSign = removeVieCharacters(author);
        }
        book.tags = tags;
        book.description = description;
        if (description) {
          book.descriptionNoSign = removeVieCharacters(description);
        }
        book.image = image;
        book.quote = quote;
        book.price = price;
        book.link = link;
        book.linkIntro = linkIntro;
        book.key = key;
        book.totalPages = totalPages;

        await book.save();
        book = await Book.findById(book._id, [
          "_id",
          "name",
          "key",
          "image",
          "price",
          "description",
          "authors",
          "quote",
          "tags",
          "totalPages",
          "linkIntro",
          "link",
        ]).populate("tags", ["_id", "name"]);
        return res.status(200).json(book);
      }
      return res.status(404).json({ message: "Not Found" });
    } else {
      let book = new Book();
      book.name = name;
      if (name) {
        book.nameNoSign = removeVieCharacters(name);
      }
      book.author = author;
      if (author) {
        book.authorNoSign = removeVieCharacters(author);
      }
      book.tags = tags;
      book.description = description;
      if (description) {
        book.descriptionNoSign = removeVieCharacters(description);
      }
      book.image = image;
      book.quote = quote;
      book.price = price;
      book.link = link;
      book.linkIntro = linkIntro;
      book.key = key;
      book.totalPages = totalPages;

      await book.save();
      book = await Book.findById(book._id, [
        "_id",
        "name",
        "key",
        "image",
        "price",
        "description",
        "authors",
        "quote",
        "tags",
        "totalPages",
        "linkIntro",
        "link",
      ]).populate("tags", ["_id", "name"]);

      return res.status(200).json(book);
    }
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.banBook = async function (req, res) {
  const { is_active } = req.body;
  try {
    let book = await Book.findById(req.params.bookId);
    if (book) {
      book.is_active = is_active;
      await book.save();

      return res.status(200).json({ is_active, _id: book._id });
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.deleteBook = async function (req, res) {
  try {
    let book = await Book.findOneAndDelete(req.params.bookId);
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.bookStatistical = async function (req, res) {
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

    
    return res.status(200).json({ totalNewBooks });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
