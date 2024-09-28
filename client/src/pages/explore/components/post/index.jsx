import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaTrash } from 'react-icons/fa'; // React Icons
import { formatDistance } from 'date-fns';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api-client';
import { DELETE_POST, GET_POST_COMMENTS, LIKE_DISLIKE_POST, REPLY_TO_POST, SAVE_OR_UNSAVE_POST } from '@/utils/constants.js';

const Post = ({ post, refreshPosts, userInfo }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [enlargePicture, setEnlargePicture] = useState(false);

  const dateStr = formatDistance(new Date(post.createdAt), new Date());

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(GET_POST_COMMENTS(post._id));
      setComments(response.data.comments);
      setCommentCount(response.data.commentCount);
    } catch (error) {
      toast.error('Error fetching comments');
    }
  };

  // Fetch initial post state including saved status
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await apiClient.get(`/api/posts/${post._id}`,{}, {withCredentials: true}); // Adjust endpoint as necessary
        setLikes(response.data.likes);
        setIsSaved(response.data.isSaved);
        setIsLiked(response.data.likes.includes(userInfo.userId));
        setCommentCount(response.data.commentCount);
      } catch (error) {
        toast.error('Error fetching post data');
      }
    };

    fetchPostData();
  }, [post._id, userInfo.userId]);

  // Like/Unlike a post
  const handleLike = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(LIKE_DISLIKE_POST(post._id), {}, {withCredentials: true});
      setIsLiked((prevIsLiked) => {
        const updatedLikes = prevIsLiked
          ? likes.filter((id) => id !== userInfo.userId) // Remove like
          : [...likes, userInfo.userId]; // Add like

        setLikes(updatedLikes); // Update the likes array
        return !prevIsLiked; // Toggle the isLiked state
      });

      toast.success(isLiked ? 'Post unliked' : 'Post liked');
    } catch (error) {
      toast.error('Error liking the post');
    }
  };

  // Save/Unsave a post
  const handleSave = async () => {
    try {
      await apiClient.patch(SAVE_OR_UNSAVE_POST(post._id), {}, {withCredentials: true});
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Post unsaved' : 'Post saved');
    } catch (error) {
      toast.error('Error saving the post');
    }
  };

  // Delete a post
  const handleDelete = async () => {
    try {
      await apiClient.delete(DELETE_POST(post._id),{}, {withCredentials: true});
      toast.success('Post deleted successfully');
      refreshPosts(); // Refresh the posts after deletion
    } catch (error) {
      toast.error('Error deleting the post');
    }
  };

  // Reply to a post
  const handleReply = async () => {
    if (!replyText.trim()) {
      return toast.error('Comment cannot be empty');
    }
    try {
      await apiClient.post(REPLY_TO_POST(post._id), {}, {withCredentials: true} ,{ comment: replyText });
      setReplyText('');
      toast.success('Replied to post');
      fetchComments(); // Reload comments after reply
    } catch (error) {
      toast.error('Error replying to post');
    }
  };

  // Toggle profile modal
  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
  };

  // Enlarge post picture
  const toggleEnlargePicture = () => {
    setEnlargePicture(!enlargePicture);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl mb-2 text-gray-900">{post.title}</div>
          <button onClick={toggleProfileModal} className="text-sm text-gray-500">
            View Profile
          </button>
        </div>
        <p className="text-gray-700 text-base">{post.description}</p>
        {post.image && (
          <img
            onClick={toggleEnlargePicture}
            src={post.image}
            alt="Post"
            className={`w-full h-auto ${enlargePicture ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          />
        )}
      </div>

      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex space-x-4">
          {/* Like Button */}
          <button onClick={handleLike} className="flex items-center space-x-2 text-red-500 hover:text-red-600">
            <FaHeart className={`h-6 w-6 ${isLiked ? 'text-red-600' : 'text-gray-500'}`} />
            <span>{likes.length}</span>
          </button>

          {/* Comment Button */}
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-gray-500 hover:text-gray-600">
            <FaComment className="h-6 w-6" />
            <span>{commentCount}</span>
          </button>

          {/* Save/Unsave Button */}
          <button onClick={handleSave} className="flex items-center space-x-2 text-gray-500 hover:text-gray-600">
            <span>{isSaved ? 'Unsave' : 'Save'}</span>
          </button>

          {/* Share Button */}
          <button onClick={() => {}} className="flex items-center space-x-2 text-blue-500 hover:text-blue-600">
            <FaShare className="h-6 w-6" />
            <span>Share</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Delete Button */}
          <button onClick={handleDelete} className="flex items-center space-x-2 text-gray-500 hover:text-gray-600">
            <FaTrash className="h-6 w-6" />
            <span>Delete</span>
          </button>

          {/* Time Ago */}
          <span className="text-gray-500">{dateStr} ago</span>
        </div>
      </div>

      {/* Show Comments Section */}
      {showComments && (
        <div className="px-6 py-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-2">
                <div className="font-bold text-gray-900">{comment.user.username}</div>
                <div className="text-gray-700">{comment.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-gray-300 rounded-md px-4 py-2 focus:outline-none"
            />
            <button onClick={handleReply} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <button onClick={toggleProfileModal} className="text-blue-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
