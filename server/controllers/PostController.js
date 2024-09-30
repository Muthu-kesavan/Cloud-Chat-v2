import { renameSync, unlinkSync } from 'fs';
import Post from "../models/PostModel.js";
import User from '../models/UserModel.js';


export const createPost = async (req, res) => {
  try {
    const { description } = req.body;
    const file = req.file;

    const userId = req.userId;
    let post;

    let mediaPath = null;
    let isVideo = false;

    if (file) {
      const date = Date.now();
      const fileName = `uploads/posts/${date}-${file.originalname}`;
    
      renameSync(file.path, fileName);
      mediaPath = fileName;

      const mimeType = file.mimetype;
      if (mimeType.startsWith('video/')) {
        isVideo = true;  
      }
    }

    if (description && mediaPath) {
      post = new Post({
        userId,
        description,
        ...(isVideo ? { video: mediaPath } : { picture: mediaPath })
      });
    } else if (description) {
      post = new Post({ userId, description });
    } else if (mediaPath) {
      post = new Post({
        userId,
        ...(isVideo ? { video: mediaPath } : { picture: mediaPath })
      });
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
    const { postId } = req.params;
    const userId = req.userId; 

    const post = await Post.findById(postId); 
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const liked = post.likes.includes(userId); 

    if (!liked) {
      post.likes.push(userId);
      await post.save(); 
      return res.status(200).json({ message: "Post has been liked", post }); // Return updated post
    } else {
      post.likes.pull(userId); 
      await post.save(); 
      return res.status(200).json({ message: "Post has been disliked", post }); // Return updated post
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
    const feeds = await Post.find({}).sort({ likes: -1 });

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

export const saveOrUnsavePost = async (req, res) => {
  try {
    const userId = req.userId; 
    const { postId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    let message;
    if (user.savedPosts.includes(postId)) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
      message = "Post unsaved successfully";
    } else {
      user.savedPosts.push(postId);
      message = "Post saved successfully";
    }

    await user.save();

    // Return updated savedPosts list to the frontend
    return res.status(200).json({
      message,
      savedPosts: user.savedPosts,  // Returning updated saved posts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch user with populated saved posts
    const user = await User.findById(userId).populate("savedPosts");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch all posts or modify to fetch specific posts based on your needs
    const posts = await Post.find();

    // Map through the posts to add isSaved property
    const postsWithSavedStatus = posts.map(post => ({
      ...post.toObject(),
      isSaved: user.savedPosts.some(savedPost => savedPost._id.toString() === post._id.toString())
    }));

    res.status(200).json({ savedPosts: postsWithSavedStatus }); // Adjust the response structure as needed
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getUserPosts = async (req, res) => {
  try {
    const userId = req.userId; 
    const userPosts = await Post.find({ userId });
    if (!userPosts || userPosts.length === 0) {
      return res.status(404).json({ message: "You have not posted anything yet." });
    }
    res.status(200).json({ posts: userPosts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
