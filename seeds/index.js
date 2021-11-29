//this file doesnt run everytime we run the project only when we want to seed our database
const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers');
const campground = require('../models/campground');
const Campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

//checking if there's errors. 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
});


const sample = array => array[Math.floor(Math.random()*array.length)];
//deleting everything from the db

const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i=0; i<300; i++ ){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: "6193098273d2a8016aa9ed5d",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dt60rgaak/image/upload/v1637603677/yelpcamp2/htm3tigdzuzwa5byq2tr.jpg',
                  filename: 'yelpcamp2/htm3tigdzuzwa5byq2tr'
                  
                },
                {
                  url: 'https://res.cloudinary.com/dt60rgaak/image/upload/v1637603677/yelpcamp2/gymvlzpu3xgdacpeducc.jpg',
                  filename: 'yelpcamp2/gymvlzpu3xgdacpeducc'
                }
              ],
            
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab tempora nulla quod cumque, doloribus praesentium! Nemo alias consequuntur, neque nostrum eligendi vero sunt porro perferendis nesciunt molestias debitis impedit provident!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});

