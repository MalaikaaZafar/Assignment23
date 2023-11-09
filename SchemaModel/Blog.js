const mongoose = require('mongoose');
const Comments=require("./Comment");
const Rating=require("./Rating");
const blogPostSchema = new mongoose.Schema({
    title: 
    {
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    author_email:{
        type:String, 
        required:true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: [String],
        required: true,
    },
    comments:{
        type: [Comments],
        required: false,
    },
    rating:{
        type: [Rating],
        required: false,
    },
    isDisabled:{
        type:Boolean,
        default:false,
    },
    
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;