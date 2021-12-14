const accountController = require("../controllers/account.controller");
const authUser = require("../middlewares/authUser");

const express = require("express");
const router = express.Router();

// Log in Google: /accounts/login-google
router.post("/login-google", accountController.loginGoogle);

//NOTE: get account info
router.get("/", authUser, accountController.getAccountInfo);

//NOTE: update account info
router.put("/", authUser, accountController.editAccount);

router.get("/resign/", authUser, accountController.reSign);

router.get("/logout/", accountController.logout);

module.exports = router;
