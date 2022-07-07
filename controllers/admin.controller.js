const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { bucket, uploadFirebase } = require("../config/firebase");
const { saveFile, readFile } = require("../handlers/fileHandler");
const mime = require("mime-types");
var path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  readFilePdfByUrl,
  readFilePdfByFilePath,
} = require("../handlers/pdf-upload");
const removeTemp = require("../handlers/removeTemp");
const removeVieCharacters = require("../handlers/removeVie");
const comparePassword = require("../middlewares/comparePassword");
const hashPassword = require("../middlewares/hashPassword");
const Account = require("../models/Account");
const Admin = require("../models/Admin");
const Book = require("../models/Book");
const Category = require("../models/Category");
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
      const admin = await Admin.findOne({
        username,
        password: hashed,
      }).select("_id name status");
      if (admin) {
        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res.cookie("access_token_admin", token, {
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
    .cookie("access_token_admin", "", {
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
    let books = await Book.find().populate({
      path: "tags",
      select: "_id name",
    });
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
      "author",
      "quote",
      "tags",
      "totalPages",
      "linkIntro",
      "totalRead",
      "totalLike",
      "totalDislike",
      "link",
      "is_active",
    ]).populate("tags", ["_id", "name"]);
    let totalComments = 0;
    let listComments = [];
    const comments = await Comment.find({ book: book._id.toString() })
      .select("_id user content status type")
      .populate({ path: "user", select: "_id avatar name nickname email" })
      .populate({
        path: "replies",
        select: "_id user content status",
        populate: { path: "user", select: "_id avatar name nickname email" },
      });
    comments.forEach((item) => {
      listComments = [...listComments, ...[item], ...item.replies];
      totalComments += 1 + item.replies.length;
    });
    book._doc.totalComments = totalComments;
    book._doc.listComments = listComments;
    return res.status(200).json(book);
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getTags = async function (req, res) {
  try {
    const tags = await Tag.find({ is_active: 1 }).select("_id name is_active");

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
    let user = await Account.findById(req.params.userId)
      .populate("listBooks", "_id image name")
      .populate("favoriteTags", "_id name");
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

exports.modifyUser = async function (req, res) {
  console.log(req.body);
  try {
    const { _id, name, avatar, nickname, faculty, gender, email, dob } =
      req.body;
    let exitUser = await Account.findOne({ email: email });
    let user = await Account.findById(_id);
    if (exitUser && exitUser._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Email is exit!" });
    }
    if (user) {
      user.nickname = nickname;
      user.faculty = faculty;
      user.name = name;
      user.email = email;
      user.avatar = avatar;
      user.dob = dob;
      user.gender = gender;
      await user.save();
      return res.status(200).json(user);
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.checkExistBookName = async function (req, res) {
  try {
    const { name } = req.body;
    nameNoSign = removeVieCharacters(name);
    if (name) {
      const existBook = await Book.find({ nameNoSign: nameNoSign });
      if (existBook.length > 0) {
        return res.status(406).json({ message: "name book is exist!" });
      } else {
        return res.status(200).json({});
      }
    } else {
      return res.status(403).json({ message: "bad request!" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.postBook = async function (req, res) {
  try {
    const { thumbnail, pdf } = req.files;
    const { detail } = req.body;
    let bookDesc;
    let pdfFilename;
    if (pdf) {
      pdfFilename = "pdf/src/test.pdf";
      const file = await readFile(pdf.tempFilePath);
      await saveFile(pdfFilename, file);
      removeTemp(pdf.tempFilePath);
    }else{
      return res.status(410).json({ message: "miss Book file!" });
    }
    if (detail) {
      bookDesc = JSON.parse(detail);
    } else {
      return res.status(405).json({ message: "miss Book detail!" });
    }

    bookDesc.nameNoSign = removeVieCharacters(bookDesc.name);
    bookDesc.authorNoSign = removeVieCharacters(bookDesc.author);
    //check exist book;
    const existBook = await Book.find({ nameNoSign: bookDesc.nameNoSign });
    if (existBook.length > 0) {
      return res.status(406).json({ message: "name book is exist!" });
    }

    let nameForUpload = "test";
    let passwordForEncrypting = uuidv4();

    if (thumbnail) {
      const thumbnailFilename =
        "pdf/src/thumbnail" + path.extname(thumbnail.name);
      console.log(">> save " + thumbnailFilename);
      const file = await readFile(thumbnail.tempFilePath);
      await saveFile(thumbnailFilename, file);
      removeTemp(thumbnail.tempFilePath);
      console.log(">> post " + thumbnailFilename + " into firebase");
      const url = await uploadFirebase(
        thumbnailFilename,
        "books/intro/" + nameForUpload
      );
      console.log({ thumbnailUrl: url });
      bookDesc.image = url;

      const { docPath, introPath, totalPages } = await readFilePdfByFilePath(
        pdfFilename,
        bookDesc.key,
        false,
        passwordForEncrypting
      );
      if (introPath) {
        const introUrl = await uploadFirebase(
          introPath,
          "books/intro/" + nameForUpload
        );
        console.log({ introUrl });
        bookDesc.linkIntro = introUrl;
      } else {
        return res.status(407).json({ message: "Create intro failure" });
      }
      if (docPath) {
        const docUrl = await uploadFirebase(
          docPath,
          "books/pdf/" + nameForUpload
        );
        console.log({ docUrl });
        bookDesc.link = docUrl;
        bookDesc.key = passwordForEncrypting;
      } else {
        return res
          .status(408)
          .json({ message: "Create encrypting Pdf failure" });
      }
      bookDesc.totalPages = totalPages;
    } else {
      const { thumbnailPath, docPath, introPath, totalPages } =
        await readFilePdfByFilePath(
          pdfFilename,
          bookDesc.key,
          true,
          passwordForEncrypting
        );
      if (thumbnailPath) {
        const thumbnailUrl = await uploadFirebase(
          thumbnailPath,
          "books/images/test"
        );
        console.log({ thumbnailUrl });
        bookDesc.image = thumbnailUrl;
      } else {
        return res.status(407).json({ message: "Create thumbnail failure" });
      }
      if (introPath) {
        const introUrl = await uploadFirebase(
          introPath,
          "books/intro/" + nameForUpload
        );
        console.log({ introUrl });
        bookDesc.linkIntro = introUrl;
      } else {
        return res.status(408).json({ message: "Create intro failure" });
      }
      if (docPath) {
        const docUrl = await uploadFirebase(
          docPath,
          "books/pdf/" + nameForUpload
        );
        console.log({ docUrl });
        bookDesc.link = docUrl;
        bookDesc.key = passwordForEncrypting;
      } else {
        return res
          .status(409)
          .json({ message: "Create encrypting Pdf failure" });
      }
      bookDesc.totalPages = totalPages;
    }
    console.log({ bookDesc });

    //create new Book
    let book = new Book({ ...bookDesc });
    await book.save();
    // book.name = bookDesc.name;
    // book.author = bookDesc.author;
    // book.nameNoSign = bookDesc.nameNoSign;
    // book.authorNoSign = bookDesc.authorNoSign;
    // book.quote = bookDesc.quote;
    // book.description = bookDesc.description;
    // book.price = bookDesc.price;
    // book.key = bookDesc.key;
    // book.tags = bookDesc.tags;
    // book.image = bookDesc.image;
    // book.link = bookDesc.link;
    // book.linkIntro = bookDesc.linkIntro;
    // book.totalPages = bookDesc.totalPages;

    return res.status(200).json(book);
  } catch (err) {
    console.log({ err });
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
          "is_active",
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
        "is_active",
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

// Category
exports.getAllCategories = async function (req, res) {
  try {
    let categories = await Category.find()
      .select("_id name thumbnail quote color is_active tags")
      .sort("-updatedAt")
      .populate({
        path: "tags",
        match: { is_active: { $eq: 1 } },
        select: "_id name",
      });
    return res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.createCategory = async function (req, res) {
  try {
    // validate request
    if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
    const { name, quote, thumbnail, color, tags } = req.body;

    var nameNoSign = removeVieCharacters(name);

    let category = new Category({
      name,
      quote,
      nameNoSign,
      thumbnail,
      is_active,
      color,
      tags,
    });

    // save tag in the database
    await category.save();

    category = await Category.findById(req.params.categoryId, [
      "_id",
      "name",
      "quote",
      "color",
      "thumbnail",
      "tags",
      "is_active",
    ]).populate({
      path: "tags",
      match: { is_active: { $eq: 1 } },
      select: "_id name",
    });

    return res.status(200).json(category);
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.editCategory = async function (req, res) {
  try {
    const { name, quote, thumbnail, color, tags } = req.body;
    if (!req.body) {
      return res
        .status(400)
        .send({ message: "Data to update can not be empty" });
    }
    const { categoryId } = req.params;

    let category = await Category.findById(categoryId);
    category.name = name;
    if (name) {
      category.nameNoSign = removeVieCharacters(name);
    }
    category.thumbnail = thumbnail;
    category.quote = quote;
    category.color = color;
    category.tags = tags;

    await category.save();

    category = await Category.findById(req.params.categoryId, [
      "_id",
      "name",
      "quote",
      "color",
      "thumbnail",
      "tags",
      "is_active",
    ]).populate({
      path: "tags",
      match: { is_active: { $eq: 1 } },
      select: "_id name",
    });

    return res.status(200).json(category);
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.deleteCategory = async function (req, res) {
  const id = req.params.categoryId;

  Category.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot Delete with id ${id}`,
        });
      } else {
        res.send({
          message: "Tag was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Tag with id=" + id,
      });
    });
};

exports.getCategoryDetail = async function (req, res) {
  try {
    let category = await Category.findById(req.params.categoryId, [
      "_id",
      "name",
      "quote",
      "color",
      "thumbnail",
      "tags",
    ]).populate({
      path: "tags",
      match: { is_active: { $eq: 1 } },
      select: "_id name",
    });

    return res.status(200).json(category);
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

exports.banCategory = async function (req, res) {
  try {
    const { is_active } = req.body;
    let category = await Category.findById(req.params.categoryId);
    if (category) {
      category.is_active = is_active;
      await category.save();

      return res.status(200).json({ is_active, _id: category._id });
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

//NOTE: tag
exports.getAllTags = async function (req, res) {
  try {
    let tags = await Tag.find()
      .select("_id name description is_active")
      .sort("-updatedAt");
    return res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getTagDetail = async function (req, res) {
  try {
    let tag = await Tag.findById(req.params.tagId, [
      "_id",
      "name",
      "description",
    ]);

    return res.status(200).json(tag);
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.createTag = async function (req, res) {
  // validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const { name, description } = req.body;

  const tag = new Tag({
    name: name,
    description: description,
  });

  // save tag in the database
  await tag.save();

  return res.status(200).json(tag);
};

exports.editTag = async function (req, res) {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }
  const { tagId } = req.params;
  const { name, description } = req.body;

  let tag = await Tag.findById(tagId);
  tag.name = name;
  tag.description = description;
  await tag.save();
  return res.status(200).json(tag);
};

exports.deleteTag = async function (req, res) {
  const id = req.params.tagId;

  Tag.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot Delete with id ${id}`,
        });
      } else {
        res.send({
          message: "Tag was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Tag with id=" + id,
      });
    });
};

exports.banTag = async function (req, res) {
  try {
    const { is_active } = req.body;
    let tag = await Tag.findById(req.params.tagId);
    if (tag) {
      tag.is_active = is_active;
      await tag.save();

      return res.status(200).json({ is_active, _id: tag._id });
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
    let totalLike = 0;
    let totalDislike = 0;
    //NOTE: new
    const today = new Date();
    let newBooks = books.filter(
      (item) =>
        item.createdAt.getMonth() == today.getMonth() &&
        item.createdAt.getFullYear() == today.getFullYear()
    );
    let totalNewBooks = newBooks.length;

    //NOTE: Total books
    let totalBooks = books.length;

    //NOTE: totalRead
    let totalRead = 0;
    books.forEach((element) => {
      totalRead += element.totalRead;
      totalLike += element.totalLike;
      totalDislike += element.totalDislike;
    });

    //NOTE: totalHoa
    let totalHoa = 0;
    const transactions = await Transaction.find();
    transactions.forEach((element) => {
      if (element.hoa > 0) {
        totalHoa += element.hoa;
      }
    });

    //NOTE: reach
    let totalReach = 0;
    const comments = await Comment.find();
    comments.forEach((element) => {
      totalReach += 1 + element.replies.length;
    });

    //NOTE: avg Reach
    let avgReach = (totalReach / totalBooks).toFixed(2);

    //NOTE: avg like & dislike
    let avgLike = (totalLike / totalBooks).toFixed(2);
    let avgDislike = (totalDislike / totalBooks).toFixed(2);

    return res.status(200).json({
      totalNewBooks,
      totalBooks,
      totalRead,
      totalHoa,
      totalReach,
      avgReach,
      avgLike,
      avgDislike,
    });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};

exports.topBooks = async function (req, res) {
  try {
    const books = await Book.find({ is_active: 1 });
    const comments = await Comment.find();
    let topBooks = [];
    books.forEach((element) => {
      let name = element.name;
      let author = element.author;
      let image = element.image;
      let _id = element._id;
      let totalRead = element.totalRead;
      let totalReach = 0;
      comments
        .filter((item) => item.book.toString() === element._id.toString())
        .forEach((element) => {
          totalReach += 1 + element.replies.length;
        });
      let totalReact = element.totalLike + element.totalDislike;
      let avgReact = 0;
      if (totalReact !== 0) {
        avgReact = Math.round((100 * element.totalLike) / totalReact);
      }
      let totalPoint = totalRead + totalReact + totalReach;
      topBooks.push({
        _id,
        name,
        author,
        image,
        totalRead,
        totalReach,
        totalReact,
        avgReact,
        totalPoint,
      });
    });
    topBooks.sort(function (a, b) {
      return b.totalPoint - a.totalPoint;
    });
    topBooks = topBooks.slice(0, 10);
    return res.status(200).json(topBooks);
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};

exports.booksByTags = async function (req, res) {
  try {
    const books = await Book.find({ is_active: 1 });
    let tags = await Tag.find();
    let data = [];
    let labels = [];
    for (let index = 0; index < tags.length; index++) {
      let element = tags[index];
      let countBooks = books.filter((item) =>
        item.tags.includes(element._id)
      ).length;
      labels.push(element.name);
      data.push(countBooks);
    }
    return res.status(200).json({ labels, data });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};

exports.hoaByMonth = async function (req, res) {
  try {
    const transactions = await Transaction.find().sort("-createdAt");
    const today = new Date();
    const thisYear = today.getFullYear();
    const lastYear = thisYear - 1;

    //NOTE: lastMonth
    let hoaByMonthLastYear = {
      year: lastYear,
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    let hoaByMonthThisYear = {
      year: thisYear,
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    transactions.forEach((element) => {
      if (element.createdAt.getFullYear() === thisYear) {
        if (element.hoa > 0) {
          hoaByMonthThisYear.data[element.createdAt.getMonth()] += element.hoa;
        }
      } else if (element.createdAt.getFullYear() === lastYear) {
        if (element.hoa > 0) {
          hoaByMonthLastYear.data[element.createdAt.getMonth()] += element.hoa;
        }
      } else {
        return res.status(200).json({ hoaByMonthLastYear, hoaByMonthThisYear });
      }
    });
    return res.status(200).json({ hoaByMonthLastYear, hoaByMonthThisYear });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};

exports.userStatistical = async function (req, res) {
  try {
    const users = await Account.find();

    //NOTE: new user
    const today = new Date();
    // let newUsers = users.filter(
    //   (item) =>
    //     item.createdAt.getMonth() == today.getMonth() &&
    //     item.createdAt.getFullYear() == today.getFullYear()
    // );
    let totalNewUsers = users.length;

    //NOTE: total Reach
    let totalReach = 0;
    const comments = await Comment.find().populate({
      path: "replies",
      select: "totalLike totalDislike",
    });
    comments.forEach((element) => {
      totalReach +=
        1 + element.totalLike + element.totalDislike + element.replies.length;
      element.replies.forEach((item) => {
        totalReach += item.totalLike + item.totalDislike;
      });
    });

    //NOTE: total Pomodoro
    let totalHoa = 0;
    const transactions = await Transaction.find({ type: "pomodoro" });
    transactions.forEach((element) => {
      if (element.hoa > 0) {
        totalHoa += element.hoa;
      }
    });
    let totalHourPomodoro = ((totalHoa * 5) / 60).toFixed(2);

    return res.status(200).json({
      totalNewUsers,
      totalReach,
      totalHoa,
      totalHourPomodoro,
    });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};

exports.userByFaculty = async function (req, res) {
  try {
    const users = await Account.find();
    let faculties = [];
    let userByFaculty = [];

    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      let i = faculties.indexOf(element.faculty);
      if (i > -1) {
        userByFaculty[i] += 1;
      } else {
        faculties.push(element.faculty);
        userByFaculty.push(1);
      }
    }

    return res.status(200).json({ faculties, userByFaculty });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};

exports.userByMonth = async function (req, res) {
  try {
    const users = await Account.find().sort("-createdAt");
    const today = new Date();
    const thisYear = today.getFullYear();
    const lastYear = thisYear - 1;

    //NOTE: lastMonth
    let userByMonthLastYear = {
      year: lastYear,
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    let userByMonthThisYear = {
      year: thisYear,
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    users.forEach((element) => {
      if (element.createdAt.getFullYear() === thisYear) {
        userByMonthThisYear.data[element.createdAt.getMonth()] += 1;
      } else if (element.createdAt.getFullYear() === lastYear) {
        userByMonthLastYear.data[element.createdAt.getMonth()] += 1;
      } else {
        return res
          .status(200)
          .json({ userByMonthLastYear, userByMonthThisYear });
      }
    });

    return res.status(200).json({ userByMonthLastYear, userByMonthThisYear });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: err || "Something went wrong" });
  }
};
