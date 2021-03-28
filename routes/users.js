const express = require("express");
const router = express.Router();
const catchAsync = require("../utility/catchAsync");
const passport = require("passport");
const Users = require("../models/users");
const user = require("../controller/user");


router.route("/register")
    .get(user.renderRegisterForm)
    .post(catchAsync(user.createUser));

router.route("/login")
    .get(user.renderLoginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), user.login);

router.get("/logout", user.logout);

module.exports = router;