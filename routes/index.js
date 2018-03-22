var express     = require("express"),
    route       = express.Router(),
    User        = require("../models/user"),
    passport    = require("passport"),
    middleware  = require("../middleware");
    
//ROOT ROUTE   
route.get("/", function(req,res) {
    res.render("landing");
});

//Regiter form
route.get('/register', function(req, res) {
    res.render('register',{page: 'register'});
});

//Register authentication
route.post('/register', function(req, res) {
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === "NowYouHaveThePower") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if(err){
            req.flash("error", err.message);
            res.redirect('/register');
        }
        passport.authenticate("local")(req,res,function() {
            req.flash("success", "Welcome "+user.username+ " to YelpCamp");
            res.redirect('/campgrounds');
        });
    });
});

//Login form
route.get('/login',function(req, res) {
    res.render('login',{page: 'login'});
});

//Login Logic
//app.post('/route', middleware, callback)
route.post('/login',middleware.checkLogInForm, passport.authenticate("local",{
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function(req, res) {
   
});

//Logout
route.get('/logout', function(req, res) {
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect('/campgrounds');
});

module.exports = route;