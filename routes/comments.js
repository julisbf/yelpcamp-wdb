const express = require('express');
const route = express.Router({mergeParams: true});
const Campground  = require('../models/campground');
const Comment = require('../models/comment');
const middleware  = require('../middleware');

//COMMENTS NEW
route.get('/new', middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err || !campground) {
      req.flash('error', 'Campground not found.');
      res.redirect('back');
    } else {
      //console.log(campground);
      res.render('comments/new', {campground: campground});
    }
  });
});

//COMMENTS CREATE
route.post('/', middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err || !campground) {
      req.flash('error', 'Campground not found.');
      res.redirect('back');
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err || !comment) {
          req.flash('error', 'Comment could not be created.');
          res.redirect('back');
        } else {
          // Add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //Save comment
          comment.save();
          campground.comments.push(comment);
          campground.save();
          req.flash('success', 'Successfully added comment.');
          res.redirect('/campgrounds/' + req.params.id);
        }
      });
    }
  });
});

//COMMENT EDIT ROUTE
route.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash('error', 'Campground not found.');
      return res.redirect('back');
    }
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err || !foundComment){
        req.flash('error', 'Comment not found');
        res.redirect('back');
      }else {
        res.render('comments/edit', {campground: foundCampground.name, campground_id: req.params.id, comment: foundComment});
      }
    }); 
  });
});

//COMMENT UPDATE ROUTE
route.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash('error', 'Campground not found.');
      return res.redirect('back');
    }
      
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
      if (err) {
        req.flash('error', 'Comment not found.');
        res.redirect('back');
      } else { 
        req.flash('success', 'Comment updated.');
        res.redirect('/campgrounds/' + req.params.id);
      }
    }); 
  });
});

//DELETE COMMENT
route.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      return res.redirect('back');
    }
    req.flash('success', 'Comment deleted.');
    res.redirect('/campgrounds/' + req.params.id);
  }); 
});

module.exports = route;