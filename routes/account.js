const accountController = require("../controllers/account.controller");
const authUser = require("../middlewares/authUser");

const express = require("express");
const router = express.Router();

// Log in Google: /accounts/login-google
router.post("/login-google", accountController.loginGoogle);

router.get("/", authUser, accountController.getAccountInfo);

router.put("/update/:accountId", authUser, accountController.editAccount);

router.get("/resign/", authUser, accountController.reSign);

module.exports = router;
