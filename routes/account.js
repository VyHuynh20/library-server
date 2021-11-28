const accountController = require("../controllers/account.controller");

const express = require("express");
const router = express.Router();

// Register: /accounts/register
router.post("/register", accountController.register);
// Log in Google: /accounts/login-google
router.post("/login-google", accountController.loginGoogle);
// Sign up Google: /accounts/register-google
router.post("/register-google", accountController.registerGoogle);

module.exports = router;
