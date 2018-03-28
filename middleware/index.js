var Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    User        = require("../models/user"),
    urlBack     =   "/campgrounds",
    middleware  = {};


//CHECK IF A USER IS LOG IN AND HAS PERMISSIONS TO CHANGE PROFILE  
middleware.checkProfileOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        User.findById(req.params.id, function(err, foundUser) {
            if(err || !foundUser){
                req.flash("error", "User not found");
                res.redirect(urlBack);
            }else{
                if(foundUser._id.equals(req.user._id)) {
                    next();
                }else {
                    req.flash("error", "You don't permission to do that");
                    res.redirect(urlBack);
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect('/campgrounds');
    }
}

//CHECK IF A USER IS LOG IN AND HAS PERMISSIONS IN CAMPGROUNDS  
middleware.checkCampgroundOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect(urlBack);
            }else{
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }else {
                    req.flash("error", "You don't permission to do that");
                    res.redirect(urlBack);
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect(urlBack);
    }
}

//CHECK IF A USER IS LOG IN AND HAS PERMISSIONS ON COMMENTS
middleware.checkCommentOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment){
                req.flash("error", "Comment not found.");
                res.redirect(urlBack);
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }else {
                    req.flash("error", "You don't permission to do that");
                    res.redirect(urlBack);
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect(urlBack);
    }
}

//CHECKS IF THE USER IS LOGGED IN
middleware.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    
    req.flash("error", "You need to be logged in to do that");
    res.redirect('/login');
}

middleware.checkLogInForm = function(req,res,next) {
    if(req.body.username === "") {
        req.flash("error","Username is required");
        return res.redirect("/login");
    }
    
    if(req.body.password === "") {
        req.flash("error", "Password is required");
        return res.redirect("/login");
    }
    
    return next();
}

module.exports = middleware;