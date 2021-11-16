const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const review = require('./review');
const Schema = mongoose.Schema;
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]


});

//delete middleware. first it finds the doc (campground) and deletes it, then it captures all the reviews
//corresponding to that campground and finds them by id and deletes them
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await review.deleteMany({
            id:{
                $in: doc.reviews
            }
        })
    }
})
module.exports=mongoose.model('Campground', CampgroundSchema);



