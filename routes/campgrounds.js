const express = require ('express');

const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync');

const{campgroundSchema}=require('../schemas.js');

const Campground = require('../models/campground');
const {isLoggedIn} = require('../middleware');

const validateCampground=(req, res, next) =>{
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
    
}

//Show all campgrounds
router.get('/', catchAsync( async(req,res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}));
//Go to the form to create a new campground
router.get('/new', isLoggedIn, (req,res)=>{
    res.render('campgrounds/new');
});

//Show the details of a specific campground
router.get('/:id',  catchAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campground)
    if(!campground){
        req.flash('error', 'Cannot find that campground..')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}));

//Make a new campground
router.post('/', isLoggedIn, validateCampground, catchAsync( async (req,res, next) =>{
   
    const campground = new Campground (req.body.campground);
   await campground.save(); 
   req.flash('success', 'Successfully made a campground!')
   res.redirect(`/campgrounds/${campground._id}`);
    
}));
//go to form to edit a campground
router.get('/:id/edit', isLoggedIn, catchAsync( async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'Cannot find that campground..')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}));

//faking an edit request as a post request (put)
router.put('/:id', isLoggedIn, catchAsync( async (req,res)=>{
    const { id }=req.params;
   const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
   req.flash('success', 'Successfully updated the campground!')
   res.redirect(`/campgrounds/${campground._id}`);
}));

///////delete a campground
router.delete('/:id', isLoggedIn, catchAsync( async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!')

    res.redirect('/campgrounds');
} ));

module.exports =router;