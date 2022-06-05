const Account = require("../models/Account");
const Book = require("../models/Book");
const Tag = require("../models/Tag");
const Comment = require("../models/Comment");

const jwt = require("jsonwebtoken");

const removeVie = require("../handlers/removeVie");
const authUser = require("../middlewares/authUser");
const isLoggedIn = require("../middlewares/isLoggedIn");
const BookInBookcase = require("../models/BookInBookcase");
const { checkUser } = require("../handlers/authorization");
const groupBy = require("../handlers/groupBy");

exports.listBook = async function (req, res) {
  // Book.find({})
  //     .then((books) => res.status(200).json(books))
  //     .catch((err) => {
  //         res.status(404).json({ error: "No book found!" });
  //         console.log(err);
  //     });

  var options = {
    select:
      "_id name authors image quote tags totalLike totalDislike totalRead createdAt updatedAt",
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
    console.log("hello");
    let react = 0;
    let isHad = false;
    //is_active: 1
    let book = await Book.findOne({ _id: req.params.bookId }, [
      "_id",
      "name",
      "image",
      "price",
      "description",
      "author",
      "quote",
      "tags",
      "totalRead",
      "totalLike",
      "totalDislike",
      "liked",
      "disliked",
      "linkIntro",
      "is_active",
    ]).populate({
      path: "tags",
      match: { is_active: { $eq: 1 } },
      select: "_id name",
    });

    let account = await checkUser(req);

    if (account) {
      if (book.liked && book.liked.includes(account._id)) {
        react = 1;
      }
      if (book.disliked && book.disliked.includes(account._id)) {
        react = -1;
      }
      if (account.listBooks.includes(book._id)) {
        isHad = true;
      }
    }

    book._doc["react"] = react;
    book._doc["isHad"] = isHad;
    return res.status(200).json(book);
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
    .then((book) => res.json({ message: "Book entry deleted successfully" }))
    .catch((err) => res.status(404).json({ error: "No such a book" }));
};

exports.getBookbyTag = async function (req, res) {
  var tagId = req.params.tagId;

  console.log(tagId);

  Book.find({ tags: tagId, is_active: 1 }, [
    "_id",
    "name",
    "author",
    "quote",
    "tags",
    "image",
    "price",
    "totalLike",
    "totalDislike",
    "totalRead",
  ])
    .populate("tags", ["_id", "name"])
    .then((books) => res.status(200).json({ _id: tagId, books: books }))
    .catch((err) => {
      res.status(404).json({ error: "No book found!" });
      console.log(err);
    });
};

exports.getSlideshow = async function (req, res) {
  console.log("run here");
  Book.find({ is_active: 1 })
    .select("_id name image")
    .limit(5)
    .sort({ name: -1 })
    .then((books) => res.status(200).json(books))
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.search = async function (req, res) {
  console.log(">>> search");
  const { search, filter, sort, tagId = "", page = 0, size = 10 } = req.body;
  try {
    var newSearch = removeVie(search);
    console.log(newSearch);

    //NOTE: create sort option
    let sortOption = {};
    switch (sort) {
      case "new":
        sortOption = { createdAt: -1 };
        break;
      case "old":
        sortOption = { createdAt: 1 };
        break;
      case "most-read":
        sortOption = { totalRead: -1 };
        break;
      case "expensive":
        sortOption = { price: -1 };
        break;
      case "cheap":
        sortOption = { price: 1 };
        break;
      default:
        break;
    }

    let findOption = {};
    if (tagId && tagId.length == 24) {
      findOption = {
        $or: [
          { nameNoSign: { $regex: ".*" + newSearch + ".*" } },
          { descriptionNoSign: { $regex: ".*" + newSearch + ".*" } },
          { authorNoSign: { $regex: ".*" + newSearch + ".*" } },
        ],
        $and: [{ tags: { $in: tagId } }],
      };
    } else {
      findOption = {
        $or: [
          { nameNoSign: { $regex: ".*" + newSearch + ".*" } },
          { descriptionNoSign: { $regex: ".*" + newSearch + ".*" } },
          { authorNoSign: { $regex: ".*" + newSearch + ".*" } },
        ],
      };
    }

    let books = await Book.find({ ...findOption, is_active: 1 })
      .sort(sortOption)
      .select(
        "_id name nameNoSign price author authorNoSign tags description descriptionNoSign image is_active totalLike totalDislike liked disliked totalRead"
      );

    //NOTE: create filter books | all - Mien phi - Chua so huu - Da thich

    let account;
    switch (filter) {
      case "free":
        books = books.filter((item) => item.price == 0);
        break;
      case "liked":
        account = await checkUser(req);
        if (account) {
          books = books.filter((item) => item.liked.includes(account._id));
        }
        break;
      case "not-have":
        account = await checkUser(req);
        if (account) {
          const listBookUserHave = await BookInBookcase.find({
            user: account._id,
          });
          console.log({ listBookUserHave });
          books = books.filter(
            (item) =>
              listBookUserHave.filter(
                (element) => element.book.toString() == item._id.toString()
              ).length == 0
          );
        }
        break;
      default:
        break;
    }

    //NOTE: splice page
    const limit = books.length;

    if (books.length >= page * size) {
      books = books.slice((page - 1) * size, page * size);
    } else {
      books = books.slice((page - 1) * size, books.length);
    }

    return res.json({ books: books, page: page, size: size, limit: limit });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong" });
  }
};

exports.postReact = async function (req, res) {
  console.log(">>> post react");
  try {
    const { react } = req.body;
    const _id = req.params._id;
    const user = res.locals.account;
    let book = await Book.findById(_id);
    console.log({ before: book._doc });
    if (book) {
      //NOTE: delete in liked list
      let index = book._doc.liked.indexOf(user._id);
      if (index > -1) {
        book._doc.liked.splice(index, 1);
      }

      //NOTE: delete in disliked list
      index = book._doc.disliked.indexOf(user._id);
      if (index > -1) {
        book._doc.disliked.splice(index, 1);
      }

      //NOTE: modify react
      switch (react) {
        case 1:
          book.liked.push(user._id);
          break;
        case -1:
          book.disliked.push(user._id);
          break;
      }

      //NOTE: calculate total like and dislike
      book.totalLike = book.liked.length;
      book.totalDislike = book.disliked.length;

      book.save();

      return res.status(200).json(book);
    }
    return res.status(400).json({ message: "Not Found" });
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getBooksTrending = async function (req, res) {
  console.log(">>> get books trending");
  const TIME = 12;
  //day of 1 month ago
  try {
    let dateOfMonthAgo = new Date();
    dateOfMonthAgo.setMonth(dateOfMonthAgo.getMonth() - TIME);
    let iSODateOfMonthAgo = dateOfMonthAgo.toISOString();

    //get all books have updatedAt greater than day of 1 month ago
    let books = await Book.find({
      updatedAt: { $gte: iSODateOfMonthAgo },
    }).select("_id name image author totalLike totalDislike totalRead");

    //map id books list
    let booksId = books.map((item, index) => item._id);

    //get all comments have updatedAt greater than day of 1 month ago and book include in books list
    let comments = await Comment.find({
      updatedAt: { $gte: iSODateOfMonthAgo },
      book: { $in: booksId },
    }).select("_id book replies totalLike totalDislike");

    //filter by book Id
    let commentGroupByBook = groupBy("book", comments);

    //calculate the popularity of the books
    let popularityBooks = [];
    books.forEach((book) => {
      let totalReact = 0;
      let totalComment = 0;
      let commentsOfBook = commentGroupByBook.find(
        (c) => c.book.toString() == book._id.toString()
      );
      if (commentsOfBook) {
        totalComment = commentsOfBook.items.length;
        commentsOfBook.items.forEach((comment) => {
          totalReact +=
            comment.totalLike + comment.totalDislike + comment.replies.length;
        });
      }
      let rate =
        book.totalLike +
        book.totalDislike +
        book.totalRead +
        totalReact +
        totalComment;

      popularityBooks.push({
        ...book._doc,
        rate,
        totalComment,
        totalReact,
      });
    });

    popularityBooks.sort((a, b) => b.rate - a.rate);
    if(popularityBooks.length > 10){
      popularityBooks = popularityBooks.slice(0, 10);
    }

    return res.status(200).json(popularityBooks);
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};
