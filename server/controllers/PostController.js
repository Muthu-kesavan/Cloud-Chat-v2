import { renameSync, unlinkSync } from 'fs';
import Post from "../models/PostModel.js";

export const createPost = async (req, res) => {
  try {
    const { description } = req.body;
    const file = req.file;

    const userId = req.userId;
    let post;

    let picturePath = null;
    if (file) {
      const date = Date.now();
      const fileName = `uploads/posts/${date}-${file.originalname}`;
      
      renameSync(file.path, fileName);
      picturePath = fileName;
    }

    if (description && picturePath) {
      post = new Post({ userId, description, picture: picturePath });
    } else if (description) {
      post = new Post({ userId, description });
    } else if (picturePath) {
      post = new Post({ userId, picture: picturePath });
    } else {
      return res.status(422).json({ error: "Please add either text or a media file (picture or video)" });
    }

    const savedPost = await post.save();
    console.log('Saved Post:', savedPost);

    res.status(200).json(savedPost);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const deletePost = async(req, res)=> {
  try{
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    if (post.picture) {
      unlinkSync(post.picture, (err) => {
        if (err) {
          console.error("Error deleting the image file:", err);
        }
      });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });

  } catch(err){
    console.error(err)
    return res.status(500).send("Internal Server Error");
  }
};

export const likeOrDislike = async (req, res) => {
  try {
    const {postId} = req.params;
    const userId = req.userId; 

    const post = await Post.findById(postId); 
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const liked = post.likes.includes(userId); 

    if (!liked) {
      post.likes.push(userId);
      await post.save(); 
      return res.status(200).json("Post has been liked");
    } else {
      post.likes.pull(userId); 
      await post.save(); 
      return res.status(200).json("Post has been disliked");
    }
  } catch (err) {
    console.error(err); 
    return res.status(500).send("Internal Server Error" );
  }
};

export const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const {postId} = req.params;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text };
    post.replies.push(reply);
    
    await post.save(); 

    res.status(200).json({ message: "Reply added successfully", reply });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error" );
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const {postId} = req.params;
    const post = await Post.findById(postId).populate("replies.userId", "username profilePicture"); // Ensure the field name is correct

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const replies = post.replies; 
    res.status(200).json({ message: "Replies fetched successfully", replies });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error");
  }
};

export const getFeed = async (req, res) => {
  try {
    const feeds = await Post.find({
      likes: { $exists: true, $ne: [] }, 
    }).sort({ likes: -1 });

    res.status(200).json({ message: "Feeds fetched successfully", count: feeds.length, feeds });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error" );
  }
};

export const sharePost = async (req, res) => {
  try {
    const {postId} = req.params; 
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const shareableLink = `http://localhost:8747/posts/${postId}`;
    const message = `Check out this post: ${post.description} \n${shareableLink}`;
    res.status(200).json({ message: "Post can be shared", link: shareableLink, postDescription: post.description });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: "Internal Server Error" });
  }
};


