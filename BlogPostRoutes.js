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

router.post("/createBlogPost", Authenticate, async(req, res)=>{
    try{
     const {title, content,author_email, tags}=req.body;
     const oldBlog=await blog.findOne({title});
     if (oldBlog){
         return res.send("Blog already exists");
     }
     const newBlog=new blog({title:title, content:content, author_email:author_email, tags:tags});
     await newBlog.save();
     return res.json(newBlog);
    }catch(err)
    {
     console.error(err.message);
    }
 })

 router.put("/updateBlogPost", Authenticate, async(req, res)=>{
    try{
        const {oldTitle, newtitle, content, author_email, tags}=req.body;
        const oldBlog=await blog.findOne({title:oldTitle, author_email:author_email});
        if (!oldBlog)
        {
            return res.send("Blog does not exist");
        }
        oldBlog.title=newtitle; 
        oldBlog.content=content;
        oldBlog.tags=tags;
        await oldBlog.save();   
        return res.json(oldBlog);
    }
    catch(err)
    {
        console.error(err.message); 
    }
})

router.delete("/deleteBlogPost", Authenticate, async(req, res)=>{
    try{
        const {title, author_email}=req.body;
        await blog.deleteOne({title:title, author_email:author_email});
        return res.send("Blog deleted successfully");
    }catch(err)
    {
        console.error(err.message);
    }
 })

 router.get("/getBlog", async(req, res)=>{
    return res.json(await blog.find({isDisabled:false}));
})

router.get("/getBlogPagination", async(req, res)=>{
    try{
        var blogs=await blog.find({}).skip(count).limit(3);
        blogs=blogs.filter((blog)=>{if (blog.isDisabled===false) return blog});
        count+=3;
        return res.json(blogs);
    }
    catch(err)
    {
        console.log(err.message);
    }
})
 
router.put("/insertComment", Authenticate, async(req, res)=>{
    try{
        const {title, author_email, statement}=req.body;
        const oldBlog=await blog.findOne({title});
        if (!oldBlog)
        {
            return res.send ("Blog does not exist");
        }
        const newComment={author_email:author_email, statement:statement};
        oldBlog.comments.push(newComment);
        await oldBlog.save();
        const sendNotif=await User.findOne({email: oldBlog.author_email});
        if (!sendNotif)
        {
            return res.send("ERROR 404: User not found");
        }
        const newNotif={statement:"New Comment on "+ title + "by " +author_email};
        sendNotif.Notification.push(newNotif);
        await sendNotif.save();
        return res.json(oldBlog);
    }
    catch(Err)
    {
        console.log(Err.message);
    }
})

router.put("/giveRating", Authenticate, async(req, res)=>{
    try{
        const {title, rating_email, rating}=req.body;
        const oldBlog=await blog.findOne({title});
        if (!oldBlog)
        {
            return res.send ("Blog does not exist");
        }
        const newRating={rating_email:rating_email, rating:rating};
        oldBlog.rating.push(newRating);
        await oldBlog.save();
        return res.json(oldBlog);
    }
    catch(Err)
    {
        console.log(Err.message);
    }
})

 module.exports=router;