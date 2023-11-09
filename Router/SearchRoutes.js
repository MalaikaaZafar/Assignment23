const express=require("express");
const User=require("../SchemaModel/User");
const blog=require("../SchemaModel/Blog");
const jwt=require("jsonwebtoken");
const router=express.Router();
const JWT_SECRET="secret";

router.get("/searchBlog", async(req, res)=>{
    const search=req.body.search;
    const searchBlog=await blog.find({});
    const result=searchBlog.filter((blog)=>{
        if (blog.title.includes(search) || blog.tags.includes(search)
            || blog.content.includes(search) || blog.author_email.includes(search))
        {
            return blog;
        }
    })
    return res.json(result);
})

router.get("/filterBlog", async(req, res)=>{
    const filter=req.body.filter;
    const filterBlog=await blog.find({});
    const result=filterBlog.filter((blog)=>{
        if (blog.tags.includes(filter))
        {
            return blog;
        }
    })
    return res.json(result);
})

router.get("/sortBlogAtoZ", async(req, res)=>{
    const sortBlog=await blog.find({isDisabled: false});
    sortBlog.sort((a, b)=>{
       return a.title.localeCompare(b.title);
    })
    return res.json(sortBlog);
})

router.get("/sortBlogZtoA", async(req, res)=>{
    const sortBlog=await blog.find({isDisabled: false});
    sortBlog.sort((b, a)=>{
       return a.title.localeCompare(b.title);
    })
    return res.json(sortBlog);
})

module.exports=router;