import {Router} from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { createPost, deletePost, getCommentsByPost, getFeed, likeOrDislike, replyToPost, sharePost } from "../controllers/PostController.js";
import multer from "multer";

const postRoutes = Router();

const upload = multer({dest:"uploads/posts"});

postRoutes.post('/', verifyToken, upload.single('file'), createPost);
postRoutes.delete('/:postId', verifyToken, deletePost);
postRoutes.patch('/:postId/like', verifyToken, likeOrDislike);
postRoutes.post('/:postId/reply', verifyToken, replyToPost);
postRoutes.get('/:postId/comments', verifyToken, getCommentsByPost);
postRoutes.get('/feed', verifyToken, getFeed);
postRoutes.get('/:postId/share', verifyToken, sharePost);
export default postRoutes;