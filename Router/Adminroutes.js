const express=require("express");
const User=require("../SchemaModel/User");
const blog=require("../SchemaModel/Blog");
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

//Admin Module 
// - View all users.
const isAdminAuthenticate= (req, res, next)=>{
    if (req.body.isAdmin!==true)
    {
        return res.send("You are not an admin");
    }
   next();
   
}
router.get("/getAllUsers", Authenticate, isAdminAuthenticate, async(req, res)=>{
    return res.json(await User.find({isAdmin: false}));
})
// - Block/Disable a user, which will not delete a user, but user will not be able to login into the
// system.
router.put("/disableUser", Authenticate, isAdminAuthenticate, async(req, res)=>{
    const blockUser=req.body.block_email;
    const blocked=await User.findOne({email: blockUser});
    blocked.isDisabled=true;
    await blocked.save();
    return res.json(blocked);
})

router.put("/enableUser", Authenticate, isAdminAuthenticate, async(req, res)=>{
    const enable=req.body.enableEmail;
    const enabled=await User.findOne({email: enable});
    enabled.isDisabled=false;
    await enabled.save();
    return res.json(enabled);
})

// - List all Blog Posts, containing Title, Author, Creation Date, Average Rating.
router.get("/getAllBlogs", Authenticate, isAdminAuthenticate, async(req, res)=>{
    return res.json(await blog.find({}));
})
// - View a Particular Blog Post.
router.get("/findBlog", Authenticate, isAdminAuthenticate, async(req, res)=>{
    const title= req.body.title;   
    const blogPost=await blog.findOne({title});
    return res.json(blogPost);
})
// - Disable a blog, which will be hidden from users, but the owner of the blog can perform
// update and delete operations.
router.put("/disableBlog", Authenticate, isAdminAuthenticate, async(req, res)=>{
    const title= req.body.title;   
    const blogPost=await blog.findOne({title});
    blogPost.isDisabled=true;
    await blogPost.save();
    return res.json(blogPost);
})

router.put("/enableBlog", Authenticate, isAdminAuthenticate, async(req, res)=>{
    const title= req.body.title;   
    const blogPost=await blog.findOne({title});
    blogPost.isDisabled=false;
    await blogPost.save();
    return res.json(blogPost);
})

module.exports=router;