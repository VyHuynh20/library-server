const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
    "168686532840-8f6as6ppblu170r1v0f337cvpq29l43f.apps.googleusercontent.com"
);
const Account = require("../models/Account");

exports.loginGoogle = async function (req, res) {
    const { tokenId } = req.body;
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
                            const token = jwt.sign(
                                { _id: account._id },
                                process.env.JWT_SECRET,
                                { expiresIn: "24h" }
                            );
                            const { _id, name, email } = account;
                            res.json({
                                token,
                                user: { _id, name, email },
                            });
                        } else {
                            const newAccount = new Account({
                                email: email,
                                fullName: name,
                                avtGoogle: picture,
                                avt: picture,
                            });
                            console.log(newAccount);

                            newAccount.save((err, data) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).json({
                                        error: "Something went wrong",
                                    });
                                }

                                console.log(newAccount);

                                const token = jwt.sign(
                                    { _id: data._id },
                                    process.env.JWT_SECRET,
                                    { expiresIn: "24h" }
                                );
                                const { _id, name, email } = newAccount;
                                res.json({
                                    token,
                                    user: { _id, name, email },
                                });
                            });
                        }
                    }
                });
            }
        });
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
        res.json(account);
    } catch (error) {}
};

exports.editAccount = async function (req, res) {
    const { faculty, avatar, nickname, fullName, phoneNumber, dob, gender } =
        req.body;
    console.log({ bodyReq: req.body });
    try {
        const loggedInAccount = res.locals.account;

        if (loggedInAccount._id !== req.params.accountId) {
            return res.status(403).json({
                error: "You are not allowed to update info of other users",
            });
        }

        loggedInAccount.nickname = nickname;
        loggedInAccount.faculty = faculty;
        loggedInAccount.fullName = fullName;
        loggedInAccount.avatar = avatar;
        loggedInAccount.phoneNumber = phoneNumber;
        loggedInAccount.dob = dob;
        loggedInAccount.gender = gender;

        await loggedInAccount.save();

        return res.status(200).json(loggedInAccount);
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};

exports.reSign = async function (req, res) {
    console.log("resign");
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
