if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();

}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const flash = require('connect-flash')

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require ('./models/user');

//requiring routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//CONNECTING TO DATABASE//////
mongoose.connect('mongodb://localhost:27017/yelp-camp', {  
});
//checking if there's errors. 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
});
//SETTING UP ENVIRONMENT///////////////
const app = express();

//setting up ejsmate engine
app.engine('ejs', ejsMate)
//set the view engine to ejs and set the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public') ));

const sessionConfig={
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUnitialized:true,
    cookie:{
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

///////
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
////////////////////////////////////////////

app.use((req, res, next) => {
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes);

//all is for every single request
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500} =err;
    if(!err.message) err.message='Oh no, something went wrong!';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () =>{
    console.log('listening on port 3000')
});




