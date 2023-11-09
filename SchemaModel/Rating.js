const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    rating_email:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        required: true,
    },
})

module.exports=ratingSchema;