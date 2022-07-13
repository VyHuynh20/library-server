const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  "168686532840-8f6as6ppblu170r1v0f337cvpq29l43f.apps.googleusercontent.com"
);
const Account = require("../models/Account");

exports.loginGoogle = async function (req, res) {
  const { tokenId } = req.body;
  console.log(tokenId);
  if (tokenId) {
    try {
      client
        .verifyIdToken({
          idToken: tokenId,
          audience:
            "168686532840-8f6as6ppblu170r1v0f337cvpq29l43f.apps.googleusercontent.com",
        })
        .then((response) => {
          const { email_verified, email, name, picture } = response.payload;
          // console.log(response.payload);

          if (email_verified) {
            Account.findOne({ email }).exec((err, account) => {
              if (err) {
                return res.status(400).json({
                  error: "Something went wrong",
                });
              } else {
                if (account) {
                  if (account.is_banned) {
                    return res
                      .status(403)
                      .json({ message: "Tài khoản đã bị khóa!" });
                  }

                  const token = jwt.sign(
                    { _id: account._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                  );
                  const { _id, name, email, avatar, hoa, cover } = account;

                  res.cookie("access_token", token, {
                    maxAge: 24 * 60 * 60 * 100,
                    httpOnly: true,
                    // secure: true;
                  });

                  res.status(200).json({
                    user: { _id, name, email, avatar, hoa, cover },
                  });
                } else {
                  const newAccount = new Account({
                    email: email,
                    fullName: name,
                    avatarGoogle: picture,
                    avatar: picture,
                    cover: picture,
                  });
                  console.log(newAccount);

                  newAccount.save((err, data) => {
                    if (err) {
                      console.log(err);
                      return res.status(400).json({
                        error: "Something went wrong",
                      });
                    }

                    const token = jwt.sign(
                      { _id: data._id },
                      process.env.JWT_SECRET,
                      { expiresIn: "24h" }
                    );
                    const { _id, name, email, avatar, hoa, cover } = newAccount;

                    res.cookie("access_token", token, {
                      maxAge: 24 * 60 * 60 * 100,
                      httpOnly: true,
                      // secure: true;
                    });
                    console.log({ res });
                    res.status(200).json({
                      user: { _id, name, email, avatar, hoa, cover },
                    });
                  });
                }
              }
            });
          }
        })
        .catch((e) => {
          res.status(400).json({ message: e.message });
        });
    } catch (error) {
      res.status(400).json({ message: "bad request" });
    }
  } else {
    res.status(400).json({ message: "bad request" });
  }
};

exports.getAccountById = async function (account) {
  try {
    const accountId = account._id;

    const account = await Account.findOne({ _id: accountId });

    return account;
  } catch (error) {
    return error;
  }
};

exports.getAccountInfo = async function (req, res) {
  try {
    const account = res.locals.account;
    console.log({ account });
    res.status(200).json(account);
  } catch (error) {}
};

exports.editAccount = async function (req, res) {
  const { faculty, avatar, nickname, name, dob, gender } = req.body;
  console.log({ bodyReq: req.body });
  try {
    let loggedInAccount = res.locals.account;

    loggedInAccount.nickname = nickname;
    loggedInAccount.faculty = faculty;
    loggedInAccount.name = name;
    loggedInAccount.avatar = avatar;
    loggedInAccount.dob = dob;
    loggedInAccount.gender = gender;

    await loggedInAccount.save();

    return res.status(200).json(loggedInAccount);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.reSign = async function (req, res) {
  console.log(">>> resign");
  const account = res.locals.account;
  if (account) {
    const { _id, name, email, avatar, hoa } = account;
    return res.json({
      user: { _id, name, email, avatar, hoa },
    });
  }
  return res.status(403).json({
    error: "no Authentication",
  });
};

exports.logout = async function (req, res) {
  res
    .cookie("access_token", "", {
      maxAge: 0,
      httpOnly: true,
      // secure: true;
    })
    .status(200)
    .json("logout success");
};

exports.getUserInfoForForum = async function (req, res) {
  const account = res.locals.account;
  const bookId = req.params.bookId;
  let user = await Account.findById(account._id).select(
    "_id name nickname email listBooks avatar hoa"
  );
  if (user) {
    user._doc["isRead"] = user.listBooks.includes(bookId);
    user._doc["totalBooks"] = user.listBooks.length;
    return res.status(200).json(user);
  }
  return res.status(400).json("something wrong");
};

exports.putChangeCover = async function (req, res) {
  try {
    const account = res.locals.account;
    const { cover } = req.body;
    let newAccount = await Account.findById(account._id);
    newAccount.cover = cover;
    await newAccount.save();
    return res.status(200).json(newAccount);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
