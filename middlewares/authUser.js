const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const responsehandler = require("../helpers/respone-handler");
const { validationResult } = require("express-validator");

const authUser = async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return responsehandler(res, 400, err.array()[0].msg, {}, null);
    }
    try {
        const authHeader = req.header("authorization");
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const data = jwt.verify(token, process.env.JWT_SECRET);
        const account = await Account.findOne({ _id: data._id });
        if (!account) {
            return res.status(403).json({ error: "This token is not valid" });
        }

        if (data.expiredIn >= date) {
            res.locals.account = account;
            next();
        } else {
            const message = "Unauthorized";
            return responsehandler(res, 403, message, null, null);
        }
    } catch (err) {
        const message = "Unauthorized";
        return responsehandler(res, 403, message, null, null);
    }
};
module.exports = authUser;
