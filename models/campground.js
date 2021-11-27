const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required:true
        },
        coordinates: {
            type: [Number],
            required:true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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



