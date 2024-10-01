import {Router} from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { createPost, deletePost, getCommentsByPost, getFeed, getSavedPosts, getUserPosts, likeOrDislike, PostSaveorUnsave, replyToPost, saveOrUnsavePost, sharePost } from "../controllers/PostController.js";
import multer from "multer";

const postRoutes = Router();

const upload = multer({dest:"uploads/posts"});

postRoutes.post('/post', verifyToken, upload.single('file'), createPost);
postRoutes.delete('/:postId', verifyToken, deletePost);
postRoutes.patch('/:postId/like', verifyToken, likeOrDislike);
postRoutes.put('/:postId/reply', verifyToken, replyToPost);
postRoutes.get('/:postId/comments', verifyToken, getCommentsByPost);
postRoutes.get('/feed', verifyToken, getFeed);
postRoutes.get('/:postId/share', verifyToken, sharePost);
postRoutes.patch('/:postId/save', verifyToken, PostSaveorUnsave);
//postRoutes.patch('/:postId/save', verifyToken, saveOrUnsavePost);
postRoutes.get('/saved', verifyToken, getSavedPosts);
postRoutes.get('/myPosts', verifyToken, getUserPosts);

export default postRoutes;