const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author_email: {
        type: String,
        required: true,
    },
    statement: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports=commentSchema;