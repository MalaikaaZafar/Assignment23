const express=require("express");
const User=require("./SchemaModel/User");
const blog=require("./SchemaModel/Blog");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const router=express.Router();
const JWT_SECRET="secret";
var count=0;
// 1. User Authentication Module:
// - User registration with fields: username, email, password.
// - User login with JWT-based authentication.
// - User profile retrieval and update.
// - Implement user roles (e.g., regular user and admin).
// - Identify the api endpoints which require authentication and implement accordingly.

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

router.post("/register", async(req, res)=>{
    const {username, email, password}=req.body;
    const oldUser=await User.findOne({email})
    if (! (username && email && password) )
    {
        return res.send("ALl input is required")
    }
    if (oldUser)
    {
        return res.send("User already exists");
    }
    const hashedpassword=await generateHash(password);
    const newUser=new User({username, email, password: hashedpassword, isAdmin: false});
    await newUser.save();
    return res.send("User created successfully");
})

router.post("/registerAdmin", async(req, res)=>{
    const {username, email, password}=req.body;
    const oldUser=await User.findOne({email})
    if (! (username && email && password) )
    {
        return res.send("ALl input is required")
    }
    if (oldUser)
    {
        return res.send("User already exists");
    }
    const hashedpassword=await generateHash(password);
    console.log(hashedpassword);
    const newUser=new User({username, email, password: hashedpassword, isAdmin: true});
    await newUser.save();
    return res.send("User created successfully");
})

router.post("/login", async(req, res)=>{
    const {email, password}=req.body;
    const oldUser=await User.findOne({email});
    if (oldUser && await checkHash(password, oldUser.password) && !oldUser.isDisabled)
    {
        const token=jwt.sign({_id: oldUser._id, email:email, isAdmin: oldUser.isAdmin}, JWT_SECRET, process.env.TOKEN_KEY);
        return res.json(token);
    }
})

router.put("/profile", Authenticate, async(req, res)=>{
    const {_id, username, email, password}=req.body;
    const userFound=await User.findOne({_id});
    userFound.username=username;
    userFound.email=email;
    userFound.password=await generateHash(password);
    await userFound.save();
    return res.json(userFound);
})

router.get("/profile", Authenticate, async(req, res)=>{
    const {_id, username, email, password}=req.body;
    const userFound=await User.findOne({_id});
    return res.json(userFound);
})


function generateHash(password)
{
    let saltRounds=10;
    return bcrypt.genSalt(saltRounds).then((salt)=>{
        return bcrypt.hash(password, salt);
    })
    .catch(err=>{
        console.error(err.message);
    });
}


router.get("/get", async(req, res)=>{
    return res.json(await User.find({}));
});


function checkHash(password, hash)
{
    return bcrypt.compare(password, hash);
}

router.delete("/delete", async(req, res)=>{
    
})


// 2. Blog Post Management Module:
// - Create, read, update, and delete blog posts (Only owner of the blog post shall be able to
// perform update and delete operation).----------------DONE
// - Retrieve a list of all blog posts.-----------------DONE
// - Implement pagination and filtering for blog post listings. (When there are hundreds of blog
// posts, all of them should not return at once)-----------------------DONE
// - Allow users to rate and comment on blog posts.--------------------DONE
// - Implement sorting and filtering options for posts.

//Create blogPost

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
        const newNotif={statement:"New Comment on "+ title + "by " +email};
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
    return res.json(await blog.find({}));
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
        return res.json(sendNotif);
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
    const enabled=await User.findOne({email: enableEmail});
    blocked.isDisabled=false;
    await blocked.save();
    return res.json(blocked);
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