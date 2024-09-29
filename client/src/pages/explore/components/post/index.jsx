import React, { useState, useEffect } from 'react';
import { FaComment, FaShare, FaTrash } from 'react-icons/fa'; // React Icons
import { formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { apiClient } from '@/lib/api-client';
import { DELETE_POST, GET_POST_COMMENTS, LIKE_DISLIKE_POST, REPLY_TO_POST, SAVE_OR_UNSAVE_POST, GET_USER } from '@/utils/constants.js';
import { useAppStore } from '@/store';

const Post = ({ post, setData, refreshPosts }) => {
  const {userInfo} = useAppStore();
  const [userData, setUserData] = useState(null);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [enlargePicture, setEnlargePicture] = useState(false);
  const dateStr = formatDistance(new Date(post.createdAt), new Date());


  useEffect(() => {
    const fetchData = async () => {
      try {
        const findUser = await apiClient.get(GET_USER.replace(':id', post.userId));
        setUserData(findUser.data || {})
      } catch (error) {
        toast.error('Error fetching post data');
      }
    };

    fetchData();
  }, [post.userId]);

  useEffect(() => {
    const fetchCommentsAndCount = async () => {
      try {
        const response = await apiClient.get(GET_POST_COMMENTS(post._id));
        const commentList = response.data?.comments || [];
        setComments(commentList);
        setCommentCount(commentList.length);
      } catch (error) {
        toast.error('Error fetching comments');
      }
    };

    if (showComments) {
      fetchCommentsAndCount();
    }
  }, [post._id, showComments]);
  
  const handleLike = async (e) => {
    e.preventDefault();
    const userId = userInfo?._id;

    // Check if the post is already liked by the user
    const alreadyLiked = likes.includes(userId);
    
    try {
        const response = await apiClient.patch(LIKE_DISLIKE_POST(post._id), { id: userId }, { withCredentials: true });
        toast.success(alreadyLiked ? 'Post unliked' : 'Post liked');
        
        // Update likes state optimistically
        if (alreadyLiked) {
            setLikes(likes.filter(id => id !== userId)); // Remove userId from likes
        } else {
            setLikes([...likes, userId]); // Add userId to likes
        }
    } catch (error) {
        console.error('Error details:', error?.response?.data || error.message);
        toast.error('Error liking the post');
    }
};




  // Save/Unsave a post
  const handleSave = async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState); // Optimistic update

    setData(prevPosts =>
      prevPosts.map(p => 
        p._id === post._id ? { ...p, isSaved: newSavedState } : p
      )
    );
    
    try {
      await apiClient.patch(SAVE_OR_UNSAVE_POST(post._id), {}, { withCredentials: true });
      toast.success(newSavedState ? 'Post saved' : 'Post unsaved');
    } catch (error) {
      setIsSaved(!newSavedState); // Revert the state if API fails
      toast.error('Error saving the post');
    }
  };

  // Delete a post
  const handleDelete = async () => {
    try {
      await apiClient.delete(DELETE_POST(post._id),{withCredentials: true});
      toast.success('Post deleted successfully');
      refreshPosts(); // Refresh the posts after deletion
    } catch (error) {
      toast.error('Error deleting the post');
    }
  };

  // Reply to a post
  const handleAddComment = async () => {
    if (!replyText.trim()) {
      return toast.error('Comment cannot be empty');
    }
    try {
      await apiClient.put(REPLY_TO_POST(post._id), {text: replyText}, {withCredentials: true} ,
      );

      const fetchedComments = await apiClient.get(GET_POST_COMMENTS(post._id));
      setComments(fetchedComments.data?.comments || []);
      console.log(fetchedComments);
      setReplyText('');
    } catch (err) {
      toast.error('Error adding comment');
      console.error("Error adding comment:", err);
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

  useEffect(() => {
    console.log("Post object:", post); // Log the full post object
  }, [post]);

  const isVideo = (url) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
    return videoExtensions.some((ext) => url.includes(ext));
  };

  return (
    <div>
      {
        userData && (
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
                <button onClick={handleLike} className="flex items-center space-x-2">
                  {likes?.includes(userInfo._id) ?
                    (<MdFavorite className="h-6 w-6" />) :
                    (<MdFavoriteBorder className="h-6 w-6" />)}
                  <span>{likes?.length || 0}</span>
                </button>

                {/* Comment Button */}
                <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-gray-500 hover:text-gray-600">
                  <FaComment className="h-6 w-6" />
                  <span>{commentCount}</span>
                </button>

                {/* Save/Unsave Button */}
                <button onClick={handleSave} className="flex items-center space-x-2 text-gray-500 hover:text-gray-600">
                  {isSaved ? <IoBookmark className="h-6 w-6" /> : <IoBookmarkOutline className="h-6 w-6" />}
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
                  <button onClick={handleAddComment} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
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
        )
      }
    </div>
  );
};
    

export default Post;
