const Category = require("../models/Category");
const Tag = require("../models/Tag");

exports.listTag = async function (req, res) {
  Tag.find({ is_active: 1 })
    .select("_id name")
    .then((tags) => res.status(200).json(tags))
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong!" });
      console.log(err);
    });
};

exports.getTagOther = async function (req, res) {
  try {
    const categories = await Category.find({ is_active: 1 });
    let tagsInCategories = [];
    categories.forEach((element) => {
      tagsInCategories = [...tagsInCategories, ...element.tags];
    });
    let tags = await Tag.find({ is_active: 1 }).select("_id name");
    tags = tags.filter(
      (item) =>
        tagsInCategories.filter(
          (element) => element.toString() === item._id.toString()
        ).length === 0
    );
    return res.status(200).json(tags);
  } catch (err) {
    res.status(400).json({ error: "Something went wrong!" });
    console.log(err);
  }
};
