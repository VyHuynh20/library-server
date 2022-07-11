const authUser = require("../middlewares/authUser");
const pomodoroController = require("../controllers/pomodoro.controller");

const express = require("express");
const router = express.Router();

router.get("/getReportAllTime", authUser, pomodoroController.getReportAllTime);
router.post("/postReportByTime", authUser, pomodoroController.postReportByTime);

module.exports = router;
