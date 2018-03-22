var Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware  = {};

//CHECK IF A USER IS LOG IN AND HAS PERMISSIONS IN CAMPGROUNDS  
middleware.checkCampgroundOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect('back');
            }else{
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }else {
                    req.flash("error", "You don't permission to do that");
                    res.redirect('back');
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect('back');
    }
}

//CHECK IF A USER IS LOG IN AND HAS PERMISSIONS ON COMMENTS
middleware.checkCommentOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment){
                req.flash("error", "Comment not found.");
                res.redirect('back');
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }else {
                    req.flash("error", "You don't permission to do that");
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect('back');
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