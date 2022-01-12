const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

const authAdmin = async (req, res, next) => {
  const token = req.cookies.access_token;
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json(err);
  }
  try {
    // const authHeader = req.header("authorization");
    // if (!authHeader.startsWith("Bearer ")) {
    //     return res.status(401).json({ error: "Unauthorized" });
    // }
    // const token = authHeader.substring(7, authHeader.length);
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ _id: data._id });

    if (!admin) {
      return res.status(403).json({ error: "This token is not valid" });
    }

    const date = Math.floor(Date.now() / 1000);
    if (data.exp >= date) {
      res.locals.admin = admin;
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
module.exports = authAdmin;
