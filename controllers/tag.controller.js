const Tag = require("../models/Tag");

exports.listTag = async function (req, res) {
    Tag.find({})
        .select("_id name")
        .then((tags) => res.status(200).json(tags))
        .catch((err) => {
            res.status(400).json({ error: "Something went wrong!" });
            console.log(err);
        });
};
