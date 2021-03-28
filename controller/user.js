const Users = require("../models/users");


module.exports.renderRegisterForm =(req, res) => {
    res.render("./users/register");
};

module.exports.createUser =async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await new Users({ username, email });
        const registeredUser = await Users.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if (err)
                console.log(err);
            else {
                req.flash("success", "Welcome to Yelpcamp");
                res.redirect("/campgrounds");
            }
        })
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/register");
    }
};

module.exports.renderLoginForm=(req, res) => {
    res.render("./users/login");
};

module.exports.login =(req, res) => {
    const redirectUrl = req.session.returnTo || "/campgrounds";
    req.flash("success", `Welcome back ${req.body.username}`);
    delete req.session.returnTo;
    console.log(req.user.id);
    res.redirect(redirectUrl);
};


module.exports.logout= (req, res) => {
    req.logout();
    req.flash("success", " Successfully Logged Out GOODBYE");
    res.redirect("/campgrounds");
};