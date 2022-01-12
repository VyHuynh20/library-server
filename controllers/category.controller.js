const Category = require("../models/Category");
const Tag = require("../models/Tag");

exports.listCategory = async function (req, res) {
    var categories = await Category.find({}).select(
        "_id thumbnail color quote tags"
    );

    for (subcategory of categories) {
        const tag = await Tag.find({ category: subcategory._id }, [
            "_id",
            "name",
        ]);

        if (tag) {
            for (subtag of tag) {
                subcategory.tags.push(subtag);
                console.log(subtag._id);
            }
        }
    }

    console.log({ maptag: categories });

    return res.json(categories);
};

exports.createCategory = async function (req, res) {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    var namenosign = removeVie(req.body.name);

    const category = new Category({
        name: req.body.name,
        quote: req.body.quote,
        nameNoSign: namenosign,
        thumbnail: req.body.thumbnail,
        is_active: req.body.status,
    });

    // save tag in the database
    await category
        .save(category)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Something went wrong",
            });
        });
};

exports.editCategory = (req, res) => {
    if (!req.body) {
        return res
            .status(400)
            .send({ message: "Data to update can not be empty" });
    }

    const id = req.params.categoryId;

    Category.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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

exports.deleteCategory = (req, res) => {
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
