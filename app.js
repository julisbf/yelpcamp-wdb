const express = require("express");
const app = express();
const bodyParser  = require("body-parser");
const mongoose  = require("mongoose");
const flash = require("connect-flash");
const passport  = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride  = require("method-override");
const User  = require("./models/user.js");

//const seedDB  = require("./seeds"); //This clean and populate the DB for comments
    
const commentRoutes = require("./routes/comments");
const campgroundRoutes  = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");
const usersRoutes = require("./routes/users");

require('dotenv').config();
mongoose.connect("mongodb://localhost/yelpcamp_app");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require("moment");
//app.use(express.static(path.join(__dirname, 'public')));// Install path package first. This is if you are not planning to run you app on the root

//seedDB(); //seed the database. Creates some data to be display

//PASSPORT CONFIG
app.use(require("express-session")({
  secret: "My mom is my greatest companion!",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//REQUIRING ROUTES
app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/users",usersRoutes);

//START SERVER
app.listen(process.env.PORT, process.env.IP, function() {
  console.log("The YelpCamp server has started!!");
});