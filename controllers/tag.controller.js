const Category = require("../models/Category");
const Tag = require("../models/Tag");

exports.listTag = async function (req, res) {
    Tag.find({})
        .select("_id name category")
        .populate("category", "_id name")
        .then((tags) => res.status(200).json(tags))
        .catch((err) => {
            res.status(400).json({ error: "Something went wrong!" });
            console.log(err);
        });
};

exports.getTagOther = async function (req, res) {
    Tag.find({ category: null })
        .select("_id name")
        .then((tags) => res.status(200).json(tags))
        .catch((err) => {
            res.status(400).json({ error: "Something went wrong!" });
            console.log(err);
        });
};

exports.createTag = async function (req, res) {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const tag = new Tag({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        is_active: req.body.status,
    });

    // save tag in the database
    await tag.save(tag);

    var categoryFind = await Category.findById(req.body.category);
    var categoryMain = await Category.find();

    if (categoryFind) {
        categoryMain.listTag.push(tag._id);
    }

    tag = await Tag.findById(tag._id, [
        "_id",
        "name",
        "description",
        "category",
    ]).populate("category", ["_id", "name"]);

    return res.status(200).json(tag);
};

exports.editTag = (req, res) => {
    if (!req.body) {
        return res
            .status(400)
            .send({ message: "Data to update can not be empty" });
    }

    const id = req.params.tagId;

    Tag.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot Update Tag with ${id}!`,
                });
            } else {
                res.send(data);
            }
        })
        .catch((err) => {
            res.status(500).send({ message: "Error Update information" });
        });
};

exports.deleteTag = (req, res) => {
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
