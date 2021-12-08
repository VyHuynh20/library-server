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
