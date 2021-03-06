const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

const isLoggedIn = async (req, res, next) => {
    try {
        const authHeader = req.header("authorization");
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.substring(7, authHeader.length);
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const account = await Account.findOne({ _id: data._id });

        if (!account) {
            return res.status(403).json({ error: "This token is not valid" });
        }

        const date = Math.floor(Date.now() / 1000);
        if (data.exp >= date) {
            res.locals.account = account;
            next();
        } else {
            const message = "Unauthorized";
            return res.status(400).json(message);
        }
    } catch (err) {
        const message = "Unauthorized";
        return res.status(403).json(message);
    }
};
module.exports = isLoggedIn;
