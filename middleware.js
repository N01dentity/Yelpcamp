const Campground = require("./models/campground");
const expressError = require("./utility/expressError");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const Review = require("./models/reviews");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You have to login first");
        return res.redirect("/login");
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);

    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id);
    if (!campgrounds.author.equals(req.user._id)) {
        req.flash("error", "You don't have access to this page");
        return res.redirect(`/campgrounds/${campgrounds._id}`)
    }
    next();
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewsId } = req.params;
    const review = await Review.findById(reviewsId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have access to this page");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    } else {
        next();
    }
}
