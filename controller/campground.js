const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas.js");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    let campgrounds = await Campground.find({});
    res.render("./campgrounds/index", { campgrounds });
};

module.exports.filter=async(req,res)=>{
    const searchName=req.body.campgrounds.title;
    console.log(searchName);
   // Campground.createIndex({name:"text",description:"text"})
    let campgrounds =await Campground.find({title:{$regex:searchName,$options:'i'}});
    //let campgrounds =await Campgrounds.find({$text:{$search:searchName}});
   res.render("./campgrounds/filter",{campgrounds});
   //res.send(campgrounds);
}

module.exports.renderNewForm = (req, res) => {
    res.render("./campgrounds/new");
};

module.exports.createCampgrounds = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campgrounds.location,
        limit: 1
    }).send()
    console.log(geoData);

    // const { error } = campgroundSchema.validate(req.body);
    const newCampground = new Campground(req.body.campgrounds);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.author = req.user._id;
    console.log(newCampground, req.file)
    await newCampground.save();
    req.flash("success", "Successfully created a campground");
    res.redirect(`/campgrounds/${newCampground._id}`)
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: "author"
        }
    }).populate("author");
    console.log(campgrounds);
    if (!campgrounds) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds")
    }
    res.render("./campgrounds/show", { campgrounds });
};

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id);
    if (!campgrounds) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    if (!campgrounds.author.equals(req.user._id)) {
        req.flash("error", "You don't have access to this page");
        return res.redirect(`/campgrounds/${campgrounds._id}`)
    }
    res.render("./campgrounds/edit", { campgrounds });

};

module.exports.updateCampgrounds = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    //const { data } = ...req.body.campgrounds;
    const updatedCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campgrounds });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedCamp.images.push(...imgs);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(updatedCamp);

    }
    await updatedCamp.save();
    req.flash("success", "Successfully updated the campground");
    res.redirect(`/campgrounds/${updatedCamp._id}`);
};

module.exports.deleteCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id);
    if (!campgrounds.author.equals(req.user._id)) {
        req.flash("error", "You don't have access to this page");
        return res.redirect(`/campgrounds/${campgrounds._id}`)
    }
    const deletedCamp = await Campground.findByIdAndDelete(id);
    console.log(deletedCamp);
    req.flash("success", "Successfully deleted the campground");
    res.redirect(`/campgrounds/`);
};