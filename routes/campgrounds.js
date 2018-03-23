var express         = require("express"),
    route           = express.Router(),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"),
    NodeGeocoder    = require('node-geocoder'),
    multer          = require('multer');
    
require('dotenv').config();

var options         = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder        = NodeGeocoder(options);

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
//INDEX - SHOWS ALL THE CAMPGROUNDS
route.get("/", function(req,res) {
    Campground.find({}, function(err, allCampgrounds) {
		if(err){
			req.flash("error",err.message);
			return res.redirect("back");
		} else {
		    res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
		}
	});
});

//NEW - SHOW FORM TO CREATE A NEW CAMPGROUND
route.get("/new",middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

//CREATE - MAKE A NEW CAMPGROUND AND THEN REDIRECT TO ALL THE LIST 
route.post("/",middleware.isLoggedIn, upload.single('image'), function(req,res){ 
    
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        // get data from form and add to campgrounds array
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        
        // Create a new campground and save to DB
        cloudinary.uploader.upload(req.file.path, function(result) {
          // add cloudinary url for the image to the campground object under image property
          req.body.campground.image = result.secure_url;
          // add author to campground
          req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
          }
          Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
          });
        });
    });
    
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
route.get("/:id", function(req, res) {
   //find the campground with provided ID
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
       if(err || !foundCampground) {
           req.flash("error", "Campground not found.");
           res.redirect("/campgrounds");
       }else{
           res.render("campgrounds/show",{campground: foundCampground});
       }
   });
});

//EDIT
route.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err){
            req.flash("error", "Campground not found");
            return res.redirect('/campgrounds');
        } 
        res.render("campgrounds/edit",{campground: foundCampground});
    });
});

//UPDATE
route.put("/:id",middleware.checkCampgroundOwnership, upload.single('image'), function(req,res) {
    var name = req.body.campground.name;
    var desc = req.body.campground.description;
    var price = req.body.campground.price;
    
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || !data.length) {
            console.log(err.message);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newData = {name: name, price: price, description: desc, location: location, lat: lat, lng: lng };
        //req.file.path
        if(req.file){
            cloudinary.uploader.upload(req.file.path, function(result) {
                console.log(result);
                // add cloudinary url for the image to the campground object under image property
                newData.image = result.secure_url;
                Campground.findByIdAndUpdate(req.params.id, newData, function(err, updatedCampground) {
                    if(err){
                        return res.redirect('/campgrounds');
                    } 
                    req.flash("success", "Campground updated!");
                    res.redirect("/campgrounds/"+req.params.id);
                });
                
            });
        } else {
            Campground.findByIdAndUpdate(req.params.id, newData, function(err, updatedCampground) {
                if(err){
                    return res.redirect('/campgrounds');
                } 
                req.flash("success", "Campground updated!");
                res.redirect("/campgrounds/"+req.params.id);
            });
        }
    });
});

// DESTROY
route.delete("/:id",middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            return res.redirect("/campgrounds");
        }
        req.flash("success", "Campground deleted!");
        res.redirect("/campgrounds");
    });
});

module.exports = route;

/*
var express         = require("express"),
    route           = express.Router(),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"),
    NodeGeocoder    = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - SHOWS ALL THE CAMPGROUNDS
route.get("/", function(req,res) {
    Campground.find({}, function(err, allCampgrounds) {
		if(err){
			console.log("OH NO, AN ERROR!!");
			console.log(err);
		} else {
		    res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
		}
	});
});

//CREATE - MAKE A NEW CAMPGROUND AND THEN REDIRECT TO ALL THE LIST 
route.post("/",middleware.isLoggedIn, function(req,res){ 
    var name = req.body.name,
        image = req.body.image,
        price = req.body.price,
        desc = req.body.description,
        author = {
            id: req.user._id,
            username: req.user.username
        };
        
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCamp = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    
        Campground.create(newCamp,function(err,createdCampground) {
    		if(err) {
    			req.flash("err","Campground couldn't be created.");
    			res.redirect("back");
    		}else{
    			 res.redirect("/campgrounds");
    		}
    	});
    });
});

//NEW - SHOW FORM TO CREATE A NEW CAMPGROUND
route.get("/new",middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
route.get("/:id", function(req, res) {
   //find the campground with provided ID
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
       if(err || !foundCampground) {
           req.flash("error", "Campground not found.");
           res.redirect("/campgrounds");
       }else{
           res.render("campgrounds/show",{campground: foundCampground});
       }
   });
});

//EDIT
route.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err){
            req.flash("error", "Campground not found");
            return res.redirect('/campgrounds');
        } 
        res.render("campgrounds/edit",{campground: foundCampground});
    });
});

//UPDATE
route.put("/:id",middleware.checkCampgroundOwnership, function(req,res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newData = {name: req.body.name, image: req.body.image, description: req.body.description, location: location, lat: lat, lng: lng};
        
        Campground.findByIdAndUpdate(req.params.id, newData, function(err, updatedCampground) {
            if(err){
                return res.redirect('/campgrounds');
            } 
            req.flash("success", "Campground updated!");
            res.redirect("/campgrounds/"+req.params.id);
       });
    });
});

// DESTROY
route.delete("/:id",middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            return res.redirect("/campgrounds");
        }
        req.flash("success", "Campground deleted!");
        res.redirect("/campgrounds");
    });
});

module.exports = route;

*/