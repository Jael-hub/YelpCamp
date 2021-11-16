const mongoose = require('mongoose');
const Schema =mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type:String,
        required: true,
        unique: true
    }
});

//this is gonna add to our Schema an username, password, 
//make sure the fields are not repeated and add methods 
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User', userSchema);