const express = require("express");

const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// GET COMMENTS
router.get("/post/:postId", async (req, res) => {

    try {

        const comments = await Comment.find({
            post: req.params.postId
        })
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.json(comments);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ADD COMMENT
router.post("/post/:postId", authMiddleware, async (req, res) => {

    try {

        const comment = await Comment.create({
            text: req.body.text,
            post: req.params.postId,
            author: req.user.id
        });

        const newComment = await comment.populate(
            "author",
            "name"
        );

        res.status(201).json(newComment);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// DELETE COMMENT
router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can delete only your own comment"
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            message: "Comment deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


module.exports = router;