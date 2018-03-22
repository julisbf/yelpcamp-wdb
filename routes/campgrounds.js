var express         = require("express"),
    route           = express.Router(),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"),
    NodeGeocoder    = require('node-geocoder');
    
var options         = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder        = NodeGeocoder(options);

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
    // get data from form and add to campgrounds array
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
        var newCamp = {name: name, image: image, description: desc, author:author, price: price, location: location, lat: lat, lng: lng};
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
    var name = req.body.campground.name;
    var image = req.body.campground.image;
    var desc = req.body.campground.description;
    var price = req.body.campground.price;
    
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newData = {name: name, image: image, price: price, description: desc, location: location, lat: lat, lng: lng };
        
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