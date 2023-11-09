const express=require("express");
const User=require("./SchemaModel/User");
const blog=require("./SchemaModel/Blog");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const router=express.Router();
const JWT_SECRET="secret";
var count=0;

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
// 1. User Authentication Module:
// - User registration with fields: username, email, password.
// - User login with JWT-based authentication.
// - User profile retrieval and update.
// - Implement user roles (e.g., regular user and admin).
// - Identify the api endpoints which require authentication and implement accordingly.

// const Authenticate=(req, res, next)=>{
//     const jwtToken=req.header("token");
//     const jwtTokenVerif=jwt.verify(jwtToken, JWT_SECRET, process.env.TOKEN_KEY);
//     if (!jwtTokenVerif)
//     {
//         return res.send("Authentication Failed");
//     }
//     const {_id, email, isAdmin}=jwtTokenVerif;
//     req.body._id= _id;
//     req.body.email=email;
//     req.body.isAdmin=isAdmin;
//     next();
// }

// router.post("/register", async(req, res)=>{
//     const {username, email, password}=req.body;
//     const oldUser=await User.findOne({email})
//     if (! (username && email && password) )
//     {
//         return res.send("ALl input is required")
//     }
//     if (oldUser)
//     {
//         return res.send("User already exists");
//     }
//     const hashedpassword=await generateHash(password);
//     const newUser=new User({username, email, password: hashedpassword, isAdmin: false});
//     await newUser.save();
//     return res.send("User created successfully");
// })

// router.post("/registerAdmin", async(req, res)=>{
//     const {username, email, password}=req.body;
//     const oldUser=await User.findOne({email})
//     if (! (username && email && password) )
//     {
//         return res.send("ALl input is required")
//     }
//     if (oldUser)
//     {
//         return res.send("User already exists");
//     }
//     const hashedpassword=await generateHash(password);
//     console.log(hashedpassword);
//     const newUser=new User({username, email, password: hashedpassword, isAdmin: true});
//     await newUser.save();
//     return res.send("User created successfully");
// })

// router.post("/login", async(req, res)=>{
//     const {email, password}=req.body;
//     const oldUser=await User.findOne({email});
//     if (oldUser && await checkHash(password, oldUser.password) && !oldUser.isDisabled)
//     {
//         const token=jwt.sign({_id: oldUser._id, email:email, isAdmin: oldUser.isAdmin}, JWT_SECRET, process.env.TOKEN_KEY);
//         return res.json(token);
//     }
// })

// router.put("/profileUpdate", Authenticate, async(req, res)=>{
//     const {_id, username, email, password}=req.body;
//     const userFound=await User.findOne({_id});
//     userFound.username=username;
//     userFound.email=email;
//     userFound.password=await generateHash(password);
//     await userFound.save();
//     return res.json(userFound);
// })

router.get("/get", async(req, res)=>{
    return res.json(await User.find({}));
});

router.delete("/delete", async(req, res)=>{
    
})


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