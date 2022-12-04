const express = require("express");
const router = express.Router();
const { signup, login, forgotPassword, changePassword } = require("../controllers/authController");

//ROUTES
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/forgot-password/:token").post(changePassword);


module.exports = router;