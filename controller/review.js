const Campground = require("../models/campground");
const Review = require("../models/reviews");


module.exports.createReview =async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Successfully created a review");
    //const redirectUrl = req.session.returnTo;
    res.redirect(`/campgrounds/${campground._id}`);

};

module.exports.deleteReview =async (req, res) => {
    const { id, reviewsId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } })
    await Review.findByIdAndDelete(reviewsId);
    req.flash("success", "Successfully deleted the review ");
    res.redirect(`/campgrounds/${id}`)

};