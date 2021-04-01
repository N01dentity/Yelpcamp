const express = require("express");
const router = express.Router();
const campgrounds = require("../controller/campground");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas.js");
const catchAsync = require("../utility/catchAsync");
const expressError = require("../utility/expressError");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary")
const upload = multer({ storage });

router.route("/")
    .get(catchAsync(campgrounds.index))
    
    .post(isLoggedIn, upload.array("images"), validateCampground, catchAsync(campgrounds.createCampgrounds));
/*.post( (req, res) => {
    console.log(req.body, req.files);
    res.send("DId it worked?");
})*/
router.route("/filter")
    .post(catchAsync(campgrounds.filter));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, upload.array("images"), validateCampground, catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.editForm));


module.exports = router;