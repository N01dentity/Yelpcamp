if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

//console.log(process.env.SECRET);

const express = require("express");
const app = express();
const path = require("path");
const expressError = require("./utility/expressError");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const Review = require("./models/reviews");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/users");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
//const stringify =require("json-stringify");
//const mongoDBStore = require("connect-mongo").default;
//const helmet = require("helmet");
const dbUrl = process.env.DB_URL;
//ROUTES
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

// MONGOOSE CONFIGURATION
mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log("Connected to MONGODB")
    }).catch(err => {
        console.log("Connection failed");
        console.log(err);
    })

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); //body parser
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: '_'
}));

/*const store = new mongoDBStore({
    url: dbUrl,
    secret: "thisismysecret",
    touchAfter: 24 * 60 * 60
})
store.on("error", function (e) {
    console.log("Session store error", e);
});*/
const sessionConfiguration = {
    //store,
    name: "session",
    secret: "thisismysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure :true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }
}
app.use(session(sessionConfiguration));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new expressError("Could not find the page", 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)
        err.message = "OH NO ERROR";
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log("Server is ready");
});
