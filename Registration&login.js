const express=require("express");
const User=require("./SchemaModel/User");
const jwt=require("jsonwebtoken");
const auth=require("./Adminroutes");
const bcrypt=require("bcrypt");
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


router.post("/register", async(req, res)=>{
    const {username, email, password}=req.body;
    const oldUser=await User.findOne({email})
    if (! (username && email && password) )
    {
        return res.send("All input is required")
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

function checkHash(password, hash)
{
    return bcrypt.compare(password, hash);
}

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

router.put("/profileUpdate", Authenticate, async(req, res)=>{
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

module.exports=router;