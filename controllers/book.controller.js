const Account = require("../models/Account");
const Book = require("../models/Book");
const Tag = require("../models/Tag");

const jwt = require("jsonwebtoken");

const removeVie = require("../handlers/removeVie");
const authUser = require("../middlewares/authUser");
const isLoggedIn = require("../middlewares/isLoggedIn");
const BookInBookcase = require("../models/BookInBookcase");
const { checkUser } = require("../handlers/authorization");

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
    let book = await Book.findById(req.params.bookId, [
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

    authUser();
    const account = res.locals.account;

    if (account) {
      if (book.liked && book.liked.includes(account._id)) {
        react = 1;
      }
      if (book.disliked && book.disliked.includes(account._id)) {
        react = 2;
      }
    }

    book["react"] = react;

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

  Book.find({ tags: tagId }, [
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
  Book.find({})
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

    let books = await Book.find(findOption)
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

exports.getComment = async function (req, res) {
  const bookId = res.params.bookId;
  var comments = await Comment.find({ book: bookId }, [
    "_id",
    "comment",
    "createdAt",
    "updatedAt",
    "user",
    "totalLike",
    "totalDislike",
    "replies",
  ])
    .populate("user", ["_id", "avatar", "name"])
    .populate("replies", [
      "_id",
      "comment",
      "user",
      "createdAt",
      "updatedAt",
      "totalLike",
      "totalDislike",
    ]);
  for (let comment of comments) {
    comment._doc.createdAt = moment(comment._doc.createdAt).format(
      "DD/MM/YYYY HH:mm"
    );
    comment._doc.updatedAt = moment(comment._doc.updatedAt).format(
      "DD/MM/YYYY HH:mm"
    );
    for (let item of comment._doc.replies) {
      item._doc.createdAt = moment(item._doc.createdAt).format(
        "DD/MM/YYYY HH:mm"
      );
      item._doc.updatedAt = moment(item._doc.updatedAt).format(
        "DD/MM/YYYY HH:mm"
      );
    }
  }

  let react = 0;
  try {
    isLoggedIn();
    const account = res.locals.account;

    if (account) {
      for (let comment of comments) {
        if (comment.liked && comment.liked.includes(account._id)) {
          react = 1;
        }
        if (comment.disliked && comment.disliked.includes(account._id)) {
          react = 2;
        }

        comment["react"] = react;
      }
    }
    return res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};
