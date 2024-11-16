import { unlinkSync } from 'fs';
import jwt from "jsonwebtoken";
import cloudinary from 'cloudinary';
import Post from "../models/PostModel.js";
import User from '../models/UserModel.js';
import Message from '../models/MessagesModel.js';
import Channel from '../models/ChannelModel.js';
import dotenv from "dotenv";
dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const createPost = async (req, res) => {
  try {
    const { description } = req.body;
    const file = req.file; 
    const userId = req.userId; 
    let post;

    let mediaUrl = null;
    let isVideo = false;

    if (file) {
      const mimeType = file.mimetype;
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']; 

      if (allowedImageTypes.includes(mimeType)) {
        isVideo = false;
      } else if (allowedVideoTypes.includes(mimeType)) {
        isVideo = true;
      } else {
        return res.status(400).json({ error: 'Only image (jpg, jpeg, png) and video (mp4, mov) files are allowed' });
      }
      const result = await cloudinary.v2.uploader.upload(file.path, {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'posts',
      });

      unlinkSync(file.path);
      mediaUrl = result.secure_url;
    }
    if (description && mediaUrl) {
      post = new Post({
        userId,
        description,
        ...(isVideo ? { video: mediaUrl } : { picture: mediaUrl })
      });
    } else if (description) {
      post = new Post({ userId, description });
    } else if (mediaUrl) {
      post = new Post({
        userId,
        ...(isVideo ? { video: mediaUrl } : { picture: mediaUrl })
      });
    } else {
      return res.status(422).json({ error: 'Please add either text or a media file (picture or video)' });
    }

    const savedPost = await post.save();
    console.log('Saved Post:', savedPost);
    res.status(200).json(savedPost);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    if (post.picture || post.video) {
      const mediaUrl = post.picture || post.video;
      const splitUrl = mediaUrl.split('/');
      const folder = splitUrl[splitUrl.length - 2]; 
      const publicIdWithExtension = splitUrl[splitUrl.length - 1]; 
      const publicId = `${folder}/${publicIdWithExtension.split('.')[0]}`; 

      const resourceType = post.picture ? 'image' : 'video'; 

      const result = await cloudinary.v2.uploader.destroy(publicId, {
        resource_type: resourceType, 
      });

      if (result.result === 'ok') {
        console.log(`Deleted ${resourceType} from Cloudinary: ${publicId}`);
      } else {
        console.error(`Failed to delete ${resourceType} from Cloudinary: ${publicId}`, result);
      }
    }
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });

  } catch (err) {
    console.error(err);
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

    const updatedPost = await Post.findById(postId);

    res.status(200).json({ message: "Reply added successfully", reply });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error" );
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const {postId} = req.params;
    const post = await Post.findById(postId).populate("replies.userId", "name image color"); // Ensure the field name is correct

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = post.replies; 
    res.status(200).json({ message: "Replies fetched successfully", comments });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error");
  }
};

export const getFeed = async (req, res) => {
  try {
    const feeds = await Post.find({});
    res.status(200).json({ message: "Feeds fetched successfully", count: feeds.length, feeds });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error" );
  }
};



export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { recipientIds } = req.body; 
    const senderId = req.userId; 

    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ error: "recipientIds must be a non-empty array." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const shareableLink = `http://127.0.0.1:5173/post/${postId}`;

    const sharedMessages = await Promise.all(recipientIds.map(async (recipientId) => {
      const group = await Channel.findById(recipientId);

      if (group) {
        const sharedMessage = new Message({
          sender: senderId,
          messageType: 'post',
          post: {
            postId: post._id,
            description: post.description,
            link: shareableLink,
            imageUrl: post.picture || null,  // Use post.picture here
            videoUrl: post.video || null,    // Use post.video here
          },
        });
        const savedMessage = await sharedMessage.save();
        group.messages.push(savedMessage._id);
        await group.save(); 

        return savedMessage; 
      } else {
        const sharedMessage = new Message({
          sender: senderId,
          recipient: recipientId,
          messageType: 'post',
          post: {
            postId: post._id,
            description: post.description,
            link: shareableLink,
            imageUrl: post.picture || null,  // Use post.picture here
            videoUrl: post.video || null,    // Use post.video here
          },
        });
        return await sharedMessage.save(); 
      }
    }));
    
    res.status(200).json({
      message: `Post shared successfully with the recipients`,
      link: shareableLink,
      postDescription: post.description,
      imageUrl: post.picture || null,  // Return post.picture instead of post.imageUrl
      videoUrl: post.video || null,    // Return post.video instead of post.videoUrl
      sharedMessages  
    });
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
    const userPosts = await Post.find({ userId }).sort({ createdAt: -1 });
    if (!userPosts || userPosts.length === 0) {
      return res.status(404).json({ message: "You have not posted anything yet." });
    }
    res.status(200).json({ posts: userPosts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const PostSaveorUnsave = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(postId); 
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const savedPost = post.saved.includes(userId);

    if (!savedPost) {
      post.saved.push(userId);
      await post.save();
      return res.status(200).json({ message: "Post has been saved", post });
    } else {
      post.saved.pull(userId);
      await post.save();
      return res.status(200).json({ message: "Post has been Unsaved", post });
    }
  } catch (err) {
    console.error(err); 
    return res.status(500).send("Internal Server Error");
  }
};


export const getSinglePost = async (req, res) => {
  const { postId } = req.params;
  const token = req.cookies.jwt; 
  console.log(token);
  try {
    const post = await Post.findById(postId).populate('userId', 'name image color'); 

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userData = post.userId;
    let isAuthenticated = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT);
        isAuthenticated = !!decoded; 
      } catch (error) {
        console.error('Token verification failed:', error);
        isAuthenticated = false; 
      }
    }

    const features = {
      canLike: isAuthenticated,
      canComment: isAuthenticated,
      canShare: isAuthenticated,
      canSave: isAuthenticated
    };

    res.status(200).json({
      post,
      userData,
      features
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
};
