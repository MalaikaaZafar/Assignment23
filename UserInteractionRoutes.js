const express=require("express");
const User=require("./SchemaModel/User");
const blog=require("./SchemaModel/Blog");
const jwt=require("jsonwebtoken");
const router=express.Router();
const JWT_SECRET="secret";

const Authenticate=(req, res, next)=>{
    const jwtToken=req.header("token");
    const jwtTokenVerif=jwt.verify(jwtToken, JWT_SECRET, process.env.TOKEN_KEY);
    if (!jwtTokenVerif)
    {
        return res.send("Authentication Failed");
    }
    const {_id, email, isAdmin}=jwtTokenVerif;
    req.body._id= _id;
    req.body.email=email;
    req.body.isAdmin=isAdmin;
    next();
}

router.put("/followAccount", Authenticate, async(req, res)=>{
    try{
        const {email, follow_email}=req.body;
        const findUser=await User.findOne({email});
        if(!findUser)
        {
            return res.send("ERROR 404: User not found");
        }
        findUser.following.push(follow_email);
        await  findUser.save();
        const sendNotif=await User.findOne({email: follow_email});
        if (!sendNotif)
        {
            return res.send("ERROR 404: User not found");
        }
        const newNotif={statement:"You have a new follower: "+email};
        sendNotif.Notification.push(newNotif);
        await sendNotif.save();
        return res.json(findUser);
    }
    catch(err){
        console.log(err.message);
    }

})

router.get("/getBlogsOnFeed",Authenticate, async(req, res)=>{
    const userFeed=await User.findOne({email: req.body.email});
    const following= userFeed.following;
    const blogs=await blog.find({});
    var feed=blogs.filter((blog)=>{if (following.includes(blog.author_email) && blog.isDisabled===false) return blog});
    return res.json(feed);
})

module.exports=router;