const express = require("express");

const Post = require("/models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// GET ALL POSTS
router.get("/", async (req, res) => {

    try {

        const posts = await Post.find()
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET SINGLE POST
router.get("/:id", async (req, res) => {

    try {

        const post = await Post.findById(req.params.id)
            .populate("author", "name");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json(post);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// CREATE POST
router.post("/", authMiddleware, async (req, res) => {

    try {

        const { title, content } = req.body;

        const post = await Post.create({
            title,
            content,
            author: req.user.id
        });

        res.status(201).json(post);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// EDIT POST
router.put("/:id", authMiddleware, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can edit only your own post"
            });
        }

        post.title = req.body.title;
        post.content = req.body.content;

        await post.save();

        res.json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// DELETE POST
router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can delete only your own post"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            message: "Post deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


module.exports = router;