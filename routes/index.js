var express     = require("express"),
    route       = express.Router(),
    User        = require("../models/user"),
    passport    = require("passport"),
    middleware  = require("../middleware"),
    async       = require("async"),
    crypto      = require("crypto"),
    multer          = require('multer');

//nodemailer  = require("nodemailer")// Add package to use it.
    
require('dotenv').config();

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


//Mailgun Config
var api_key = process.env.MAILGUN_KEY,
    domain  = 'sandboxe14a0f41d68d43bfb8e3fb38faaaf9d0.mailgun.org',
    mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
    
//ROOT ROUTE   
route.get("/", function(req,res) {
    res.render("landing");
});

//Regiter form
route.get('/register', function(req, res) {
    res.render('register',{page: 'register'});
});

//Register authentication
route.post('/register',upload.single('avatar'), function(req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    });
    if(req.body.adminCode === "NowYouHaveThePower") {
        newUser.isAdmin = true;
    }
    if(req.file){
        cloudinary.uploader.upload(req.file.path, function(result) {
            console.log(result);
            // add cloudinary url for the image to the campground object under image property
            newUser.avatar = result.secure_url;
            User.register(newUser, req.body.password, function(err, user) {
                if(err){
                    req.flash("error", err.message);
                    res.redirect('/register');
                }
                passport.authenticate("local")(req,res,function() {
                    req.flash("success", "Successfully Sign up! Nice to meet you "+user.username);
                    res.redirect('/campgrounds');
                });
            });
        });
    }else{
        User.register(newUser, req.body.password, function(err, user) {
            if(err){
                req.flash("error", err.message);
                res.redirect('/register');
            }
            passport.authenticate("local")(req,res,function() {
                req.flash("success", "Successfully Sign up! Nice to meet you "+user.username);
                res.redirect('/campgrounds');
            });
        });
    }
});

//Login form
route.get('/login',function(req, res) {
    res.render('login',{page: 'login'});
});

//Login Logic
//app.post('/route', middleware, callback)
route.post('/login',middleware.checkLogInForm, passport.authenticate("local",{
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }), function(req, res) {
   
});

//Logout
route.get('/logout', function(req, res) {
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect('/campgrounds');
});

//Reset Password
route.get("/forgot", function(req, res) {
    res.render("forgot");
});

route.post("/forgot", function(req,res,next) {
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err,token);
            });
        },
        function(token,done){
            User.findOne({email: req.body.email}, function(err, user) {
                if(err || !user) {
                    req.flash("error","No account with that email address exists.");
                    return res.redirect("/login");
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // Available for 1 hour
                
                user.save(function(err) {
                    done(err,token,user);
                });
            });
        },
        function(token, user, done) {
            // var smtpTransport = nodemailer.createTransport({
            //     service: 'Gmail',
            //     auth: {
            //         user: 'youremail@mail.com',
            //         pass: process.env.GMAILPW // export GMAILPW=yourpassword
            //     }
            // });
            
            // smtpTransport.sendMail(mailOptions, function(err) {
            //     console.log('email sent');
            //     req.flash("success","An e-mail has been sent to " + user.email + " with further instructions.");
            //     done(err,'done');
            // });
            
            // var data = {
            //   from: 'Excited User <jb@madeatmodern.com>',
            //   to: 'jb@madeatmodern.com',
            //   subject: 'Hello',
            //   text: 'Testing some Mailgun awesomeness!'
            // };
            
            var mailOptions = {
                to: user.email,
                from: 'no-reply@yelpcamp-julianabf.c9users.io',
                subject: 'Yelpcamp App - Password Reset',
                text: 'Hello '+ user.username + ', \n\n' +
                "We received a request to reset your password for your YelpCamp App account: "+ user.email +
                ". We're here to help! \n\n Simply click on the link to set a new password: \n\n" +
                "https://" + req.headers.host + "/reset/" + token + "\n\n" +
                "If you didn't ask to change your password, don't worry! Your password is still safe and you can delete this email."
            };
            mailgun.messages().send(mailOptions, function (error, body) {
                console.log(body);
                req.flash("success","An e-mail has been sent to " + user.email + " with further instructions.");
                done(error,'done');
            });
        }
        ], function(err) {
            if(err) return next(err);
            res.redirect("/login");
        });
});

route.get("/reset/:token", function(req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err,user) {
        if(err || !user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render("reset", {token: req.params.token});
    });
});

route.post("/reset/:token", function(req, res) {
    console.log(req.params.token);
    async.waterfall([
        function(done) {
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err,user) {
                if(err || !user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                console.log("user: ", user);
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        if(err) {
                            req.flash("Something went wrong!");
                            return res.redirect("back");
                        }
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        
                        user.save(function(err) {
                            if(err) {
                                req.flash("Something went wrong saving the new password.");
                                return res.redirect("back");
                            }
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    res.redirect("back");
                }
          });
      },
      function(user, done) {
        //   var smtpTransport = nodemailer.createTransport({
        //     service: 'Gmail', 
        //     auth: {
        //       user: 'youremail@mail.com',
        //       pass: process.env.GMAILPW
        //     }
        //   });
        //   var mailOptions = {
        //     to: user.email,
        //     from: 'learntocodeinfo@mail.com',
        //     subject: 'Your password for YelpCamp App has been changed',
        //     text: 'Hello,'+ user.username +'\n\n' +
        //       'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        //   };
        //   smtpTransport.sendMail(mailOptions, function(err) {
        //     req.flash('success', 'Success! Your password has been changed.');
        //     done(err);
        //   });
        
        var mailOptions = {
                to: user.email,
                from: 'no-reply@yelpcamp-julianabf.c9users.io',
                subject: 'Your password for YelpCamp App has been changed',
                text: 'Hello '+ user.username +', \n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            mailgun.messages().send(mailOptions, function (error, body) {
                console.log(body);
                req.flash('success', 'Success! Your password has been changed.');
                done(error,'done');
            });
        }
    ], function(err) {
        if(err) {
            req.flash("Something went wrong!");
            return res.redirect("back");
        }
        res.redirect('/campgrounds');
    });
});

module.exports = route;