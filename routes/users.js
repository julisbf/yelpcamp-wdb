var express     = require("express"),
    route       = express.Router({mergeParams: true}),
    User        = require("../models/user"),
    middleware  = require("../middleware"),
    multer      = require('multer');


//Image uploader config
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dnlmdpqac', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

route.get("/profile/:id/edit",middleware.checkProfileOwnership, function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("/campgrounds");
        }
        //console.log(foundUser);
        res.render("users/edit",{page: 'profile'});
    });
    
});

route.put("/profile/:id",middleware.checkProfileOwnership,upload.single('avatar'), function(req, res) { 
    if(req.file){
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the campground object under image property
            if(req.body.adminCode === "NowYouHaveThePower") {
                req.body.user.isAdmin = true;
            }
            req.body.user.avatar = result.secure_url;
            User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser) {
                if(err){
                    req.flash("error", err.message);
                    return res.redirect('/users/profile/'+updatedUser._id + "/edit");
                } 
                if(updatedUser._id.equals(req.params.id)) {
                    req.flash("success", "Profile updated!");
                    return res.redirect('/users/profile/'+updatedUser._id + "/edit");
                }else {
                    req.flash("error", "You don't have permission to access this profile.");
                    return res.redirect('/campgrounds');
                }
            });
        });
    }else {
        if(req.body.adminCode === "NowYouHaveThePower") {
            req.body.user.isAdmin = true;
        }
        User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser) {
            if(err){
                req.flash("error", err.message);
                return res.redirect('/users/profile/'+updatedUser._id + "/edit");
            } 
            if(updatedUser._id.equals(req.params.id)) {
                req.flash("success", "Profile updated!");
                return res.redirect('/users/profile/'+updatedUser._id+ "/edit");
            }else {
                req.flash("error", "You don't have permission to access this profile.");
                return res.redirect('/campgrounds');
            }
        });
    }
});

//Implement change password
// if(req.body.password.length > 1){
//     if(req.body.password === req.body.confirm) {
//         updatedUser.setPassword(req.body.password, function(err) {
//             if(err) {
//                 req.flash("error", err.message);
//                 return res.redirect('/users/profile/'+updatedUser._id + "/edit");
//             }
//         });
//     } else {
//         req.flash("error", "New Password and Confirm Password need to be ");
//         return res.redirect('/users/profile/'+updatedUser._id + "/edit");
//     }
// }

module.exports = route;