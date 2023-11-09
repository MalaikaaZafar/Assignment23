const mongoose=require("mongoose");
const notif=require("./Notification");
const userSchema=new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type:String, 
        required: true,
    },
    isAdmin:{
        type:Boolean,
        required: true,
    },
    isDisabled:{
        type: Boolean,
        default: false,
    },
    following:{
        type: [String], 
        required: false,
    },
    Notification:{
        type: [notif],
        required: false,
    },
});

const User=mongoose.model("user", userSchema);
module.exports=User;