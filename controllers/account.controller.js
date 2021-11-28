const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Account = require("../models/Account");

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
            phone: phone,
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

exports.loginGoogle = async function (req, res) {
    const { tokenId } = req.body;
    client
        .verifyIdToken({
            idToken: tokenId,
            audience:
                "168686532840-8f6as6ppblu170r1v0f337cvpq29l43f.apps.googleusercontent.com",
        })
        .then((res) => {
            const { email, name, picture } = res.payload;
            console.log(res.payload);

            const existingAccount = await Account.findOne({ email: email });

            // Register account
            if (!existingAccount) {
                const account = new Account({
                    email: email,
                    fullName: name,
                    avtGoogle: picture,
                    avt: picture,
                });

                await account.save();

                res.status(200).json(account);
            }

            // Log In account
            res.status(200).json(getAccount(existingAccount));
        });
    /*
    var { email, password } = req.body;
    try {
        const existingAccount = await Account.findOne({ email: email });
        if (!existingAccount) {
            return res.status(404).json({ message: "Email is not existed" });
        } else {
            const checkPassword = await bcrypt.compare(
                password,
                existingAccount.password
            );
            if (!checkPassword) {
                return res.status(400).json({ message: "Invalid login" });
            }
            if (existingAccount.is_banned === 1) {
                return res
                    .status(400)
                    .json({ message: "Your account is banned" });
            } else {
                const accessToken = jwt.sign(
                    {
                        _id: existingAccount._id,
                        email: existingAccount.email,
                        role: existingAccount.role,
                        expireIn: process.env.JWT_EXPIRED_TIME,
                    },
                    process.env.JWT_SECRET
                );
                res.status(200).json({ result: existingAccount, accessToken });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
    */
};

exports.registerGoogle = async function (req, res) {
    var { email, password, firstname, lastname } = req.body;

    try {
        const existingAccount = await Account.findOne({ email: email });

        if (existingAccount) {
            return res.status(400).json({ message: "User is already existed" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const username = Math.floor(Math.random() * 100 + 1);

        const account = new Account({
            userName: `${firstname}${username}`,
            email: email,
            password: hashedPassword,
            fullName: `${firstname} ${lastname}`,
        });

        await account.save();

        res.status(200).json(account);
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(err);
    }
};

exports.getAccountById = function (account) {
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

        const existingUsername = await Account.findOne({ userName: username });
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
