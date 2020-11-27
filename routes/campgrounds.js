const express = require("express");
const router = express.Router();
const Campground = require("../models/campgrounds");
const middleware = require("../middleware/index");

router.get("/", function(req, res){
	//Get all campgrounds from DB
	Campground.find({}, function(err, campgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds: campgrounds, currentUser: req.user});
		}
	});
	
});

router.post("/", middleware.isLoggedIn, function(req, res){
	//get data from form and add to campgrounds array
	let name = req.body.name;
	let price = req.body.price;
	let image = req.body.image;
	let description = req.body.description
	let author = {
		id: req.user._id,
		username: req.user.username
	}
	let newCampground = {name: name, price: price, image: image, description: description, author: author}
	//Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
	
});

router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
	//find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	
	//render show template with that campground
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect somewhere (show page)
});

//Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds");
		}
	})
})

module.exports = router;
