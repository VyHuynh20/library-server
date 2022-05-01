const Category = require("../models/Category");
const Tag = require("../models/Tag");

exports.listCategory = async function (req, res) {
  var categories = await Category.find({ is_active: 1 })
    .select("_id name thumbnail color quote tags")
    .populate({
      path: "tags",
      match: { is_active: { $eq: 1 } },
      select: "_id name description",
    });

  console.log({ maptag: categories });

  return res.json(categories);
};
