import express from "express"
import Post from "../models/Post.js"
import User from "../models/User.js"

const router = express.Router()

//create a post

router.post("/",async (req,res)=>{

    const newPost = new Post(req.body)

    try {
        const post = await newPost.save()
        res.status(200).json(post)
    } catch (error) {
        res.status(500).send(err)
    }
})

//update a post

router.put("/:id",async(req,res)=>{

    try{
        const post = await Post.findById(req.params.id)

        if(post.userId === req.body.userId){
            await post.updateOne({$set:req.body})
            res.status(200).json("Post updated successfully")
        }else{
        res.status(403).json("You can update your own posts only")
        }
    }catch (error) {
        res.status(500).json(err)
    }
})

//delete a post

router.delete("/:id",async(req,res)=>{

    try{
        const post = await Post.findById(req.params.id)

        if(post.userId === req.body.userId){
            await post.deleteOne()
            res.status(200).json("Post deleted successfully")
        }else{
        res.status(403).json("You can delete your own posts only")
        }
    }catch (error) {
        res.status(500).json(err)
    }
})

// like/dislike a post

router.put("/:id/like", async(req,res)=>{

    try {

        const post = await Post.findById(req.params.id)

        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push: {likes : req.body.userId}})
            res.status(200).json("Post liked successfully")
        }else{
            await post.updateOne({$pull: {likes : req.body.userId}})
            res.status(200).json("Post disliked successfully")
        }
    } catch (error) {
        res.status(500).json(error)
    }
    
})

//get a post

router.get("/:id", async(req,res)=>{

    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    }catch (error){
        res.status(500).json(error)
    }
    
})


//get all feed posts 

router.get("/feed/:userId", async(req,res)=>{

    try{
        const currentUser = await User.findById(req.params.userId)
        const userPosts = await Post.find({userId: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId)=>{
                return Post.find({userId:friendId})
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    }catch(err){
        res.status(500).json(err)
    }
})

// get users's all posts

router.get("/profile/:username", async(req,res)=>{

    try{
        const user = await User.findOne({username:req.params.username})
        const userPosts = await Post.find({userId: user._id})
        
        res.status(200).json(userPosts)
    }catch(err){
        res.status(500).json(err)
    }
})

export default router