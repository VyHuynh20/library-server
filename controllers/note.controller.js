const Bookcase = require("../models/BookInBookcase");
const Book = require("../models/Book");

const Note = require("../models/Note");
const Account = require("../models/Account");

exports.getNotesByAccountId = async function (req, res) {
  console.log(">>> get notes");
  const user = res.locals.account;
  Note.find({ user: user._id }, [
    "user",
    "book",
    "content",
    "image",
    "name",
    "page",
  ])
    .populate("book", ["_id", "name", "image"])
    .sort("-updatedAt")
    .then((bookcase) => {
      if (bookcase) {
        res.status(200).json(bookcase);
      } else {
        res.status(400).json({ message: "No book in bookcase found!" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
      console.log(err);
    });
};

exports.getNoteDetail = async function (req, res) {
  try {
    const user = res.locals.account;
    const _id = req.params._id;

    let note = await Note.findOne({ _id: _id, user: user._id })
      .select("_id name book user content page status")
      .populate("book", ["_id", "name", "link", "key", "image"]);
    if (note) {
      note.status = 1;
      await note.save();
      return res.status(200).json(note);
    } else {
      res.status(400).json({
        message: "No book in bookcase found!",
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log({ err });
  }
};

exports.getNotesActiveByAccountId = async function (req, res) {
  console.log(">>> get notes active");
  try {
    const user = res.locals.account;
    console.log({ user });
    const notes = await Note.find({ user: user._id, status: 1 })
      .select("_id name book user image status")
      .populate("book", ["_id", "name"])
      .sort("-updatedAt");
    if (notes) {
      return res.status(200).json(notes);
    }
    return res.status(400).json({
      message: "No note in bookcase found!",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log({ err });
  }
};

exports.postNewNote = async function (req, res) {
  console.log(">>> create new note");
  try {
    let user = res.locals.account;
    let account = await Account.findById(user._id);
    const { name, book, image } = req.body;
    if (user.listBooks.includes(book)) {
      let note = new Note({
        name: name,
        book: book,
        image: image,
        user: account._id,
      });
      await note.save();

      account.listNotes.push(note._id);
      await account.save();
      return res.status(200).json(note);
    }
    return res.status(404).json({ message: "Not found" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.putNote = async function (req, res) {
  try {
    const user = res.locals.account;
    const { _id, name, content, page } = req.body;
    let note = await Note.findOne({ _id: _id, user: user._id });
    if (note) {
      note.name = name;
      note.content = content;
      note.page = page;

      await note.save();
      return res.status(200).json(note);
    }
    return res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log({ e });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.deleteNote = async function (req, res) {
  try {
    const user = res.locals.account;
    const _id = req.params._id;
    let note = await Note.findByIdAndDelete({ _id: _id, user: user._id });
    if (note) {
      return res.status(200).json({ message: "delete success!" });
    }
    return res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log({ e });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.changeNoteInfo = async function (req, res) {
  try {
    const user = res.locals.account;
    const { _id, name, image } = req.body;
    let note = await Note.findOne({ _id: _id, user: user._id });
    if (note) {
      note.name = name;
      note.image = image;
      await note.save();
      return res.status(200).json(note);
    }
    return res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log({ e });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.closeNote = async function (req, res) {
  try {
    const user = res.locals.account;
    const _id = req.params._id;
    let note = await Note.findOne({ _id: _id, user: user._id });
    if (note) {
      note.status = 2;
      await note.save();
      return res.status(200).json({ message: "close note success" });
    }
    return res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log({ e });
    res.status(500).json({ message: "Something went wrong" });
  }
};
