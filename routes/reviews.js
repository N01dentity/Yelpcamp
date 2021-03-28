const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const { reviewSchema } = require("../schemas.js");
const Review = require("../models/reviews");
const catchAsync = require("../utility/catchAsync");
const expressError = require("../utility/expressError");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");
const review= require("../controller/review");




router.post('/', validateReview, isLoggedIn, catchAsync(review.createReview));

router.delete("/:reviewsId", isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview));

module.exports = router;