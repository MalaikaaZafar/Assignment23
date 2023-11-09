const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({
    statement: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports=notifSchema;