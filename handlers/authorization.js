const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const Account = require("../models/Account");

const authAdmin = async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  try {
    const accessToken = req.headers["x-access-token"];
    const data = jwt.verify(accessToken, process.env.JWT_SECRET);
    const account = await Account.findOne({ _id: data._id });
    if (!account) {
      throw new Error();
    }

    const date = Math.floor(Date.now() / 1000);
    if (data.role === "Admin" && data.expireIn >= date) {
      res.locals.account = account;
      next();
    } else {
      return res.status(401, {
        message: "You are not allowed to access!",
      });
    }
  } catch (err) {
    res.status(401, { message: "You are not allowed to access!" });
    console.log(err);
  }
};

const authUser = async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  try {
    const accessToken = req.headers["x-access-token"];
    const data = jwt.verify(accessToken, process.env.JWT_SECRET);
    const account = await Account.findOne({ _id: data._id });
    if (!account) {
      throw new Error();
    }

    const date = Math.floor(Date.now() / 1000);
    if (data.role === "User" && data.expireIn >= date) {
      res.locals.account = account;
      next();
    } else {
      return res.status(401, {
        message: "You are not allowed to access!",
      });
    }
  } catch (err) {
    res.status(401, { message: "You are not allowed to access!" });
    console.log(err);
  }
};

const checkUser = async (req) => {
  try {
    const token = req.cookies.access_token;
    if (token) {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      const account = await Account.findOne({ _id: data._id });
      if (account) {
        return account;
      }
    }
    return;
  } catch (err) {
    return;
  }
};

module.exports = {
  authAdmin,
  authUser,
  checkUser,
};
