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

exports.editAccount = async function (req, res) {
    const { username, avt, fullName, phone, dob, gender } = req.body;
    try {
        const loggedInAccount = res.locals.account;

        if (loggedInAccount._id !== req.params.accountId) {
            return res.status(403).json({
                error: "You are not allowed to update info of other users",
            });
        }

        const existingUsername = Account.findOne({ userName: username });
        if (existingUsername) {
            return res
                .status(400)
                .json({ message: "Username is already existed" });
        }

        loggedInAccount.userName = username;
        loggedInAccount.fullName = fullName;
        loggedInAccount.avt = avt;
        loggedInAccount.phone = phone;
        loggedInAccount.dob = dob;
        loggedInAccount.gender = gender;

        await loggedInAccount.save();

        return res.status(200).json(loggedInAccount);
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};

/*

exports.register = async function (req, res) {
    var { username, email, password, fullName, phone, avt, dob, gender } =
        req.body;

    try {
        const existingEmail = await Account.findOne({ email: email });
        const existingUsername = await Account.findOne({ user_name: username });

        if (existingEmail || existingUsername) {
            return res
                .status(400)
                .json({ message: "Email or Username is already existed" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const account = new Account({
            userName: username,
            email: email,
            password: hashedPassword,
            fullName: fullName,
            phoneNumber: phone,
            avt: avt,
            dob: dob,
            gender: gender,
        });

        await account.save();

        res.status(200).json(account);
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};
*/
