if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();

}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore=require('connect-mongo')(session);

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

const dbUrl =process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
// const dbUrl = ;
//CONNECTING TO DATABASE//////
mongoose.connect(dbUrl, {  
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

const secret= process.env.SECRET || 'thisshouldbeasecret'

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public') ));
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60
});
store.on("error", function(e){
    console.log("session store error", e)
});



const sessionConfig={
    store,
    secret,
    name:'blahhhhh',
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
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dt60rgaak/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());


///////
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
////////////////////////////////////////////

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes);
app.get('/', (req, res)=>{
    res.render('home')
})
//all is for every single request
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500} =err;
    if(!err.message) err.message='Oh no, something went wrong!';
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000

app.listen(port, () =>{
    console.log('listening on port' + port)
});




