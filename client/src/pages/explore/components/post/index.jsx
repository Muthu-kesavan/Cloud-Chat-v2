import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store"; 
import { FaRegComment } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import formatDistance from "date-fns/formatDistance";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { GET_USER, HOST } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { getColor } from "@/lib/utils";
import ProfileModal from "@/components/ui/ProfileModal";

const Post = ({ post }) => {
  const {
    userInfo,
    likePost,
    replyToPost,
    getComments,
    comments,
    savedPosts,
    saveOrUnsavePost
  } = useAppStore(); 

  const [userData, setUserData] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [enlargePicture, setEnlargePicture] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const dateStr = formatDistance(new Date(post.createdAt), new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(GET_USER.replace(':id', post.userId)); 
        setUserData(res.data || {});
      } catch (err) {
        console.log({ err });
      }
    };
    fetchData();
  }, [post.userId]);

  useEffect(() => {
    if (isCommentsVisible && !commentsLoaded) {
      const fetchComments = async () => {
        await getComments(post._id);
        setCommentsLoaded(true); // Mark comments as loaded
      };
      fetchComments();
    } else if (!isCommentsVisible) {
      setCommentsLoaded(false); // Reset when comments are hidden
    }
  }, [isCommentsVisible, post._id, getComments]);

  const handleLike = async () => {
    await likePost(post._id);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (newReply.trim() === "") return; // Prevent empty replies
    await replyToPost(post._id, { content: newReply });
    setNewReply(""); 
  };

  const handleSavePost = async () => {
    await saveOrUnsavePost(post._id);
  };

  const handlePictureClick = () => {
    setEnlargePicture(!enlargePicture);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  return (
    <div className="p-4 border border-gray-100 rounded-md shadow-md mb-4">
      {userData && (
        <div className="flex items-center mb-2">
          <div className="mb-0 cursor-pointer" onClick={handleProfileClick}>
            {userData.image ? (
              <img
                src={`${HOST}/${userData.image}`} 
                alt="Profile pic"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className={`uppercase h-10 w-10 md:w-12 md:h-12 text-2xl border-[1px] flex items-center justify-center rounded-full ${getColor(userData.color)}`}>
                {userData.name ? userData.name.charAt(0) : userInfo.email.charAt(0)}
              </div>
            )}
          </div>
          <span className="ml-2 font-semibold">{userData.name  }</span>
          <p>  -{ dateStr} ago</p>
        </div>
      )}
       <p className="font-semibold text-md">{post.description}</p>
  
      <div className="flex flex-col items-center">
        {post.video ? (
          <video
            controls
            controlsList="nodownload"
            src={`${HOST}/${post.video}`} 
            className="rounded-lg h-64 my-4"
            loop
          />
        ) : post.picture ? ( 
          <>
            {enlargePicture && (
              <div
                className="fixed inset-0 z-20 bg-black bg-opacity-90 flex items-center justify-center"
                onClick={handlePictureClick}
              >
                <img
                  src={`${HOST}/${post.picture}`}
                  alt="Enlarged Post"
                  className="rounded-lg max-h-screen cursor-pointer"
                />
              </div>
            )}
            <img
              src={`${HOST}/${post.picture}`}
              alt="Post"
              className="rounded-lg max-w-full my-4 cursor-pointer h-64"
              onClick={handlePictureClick}
            />
          </>
        ) : null}
      </div>
  
      <div className="flex items-center space-x-6 mt-4 text-lg md:text-xl">
        <button onClick={handleLike} className="flex items-center space-x-2">
          {post.likes?.includes(userInfo?.id) ? (
            <MdFavorite className="cursor-pointer text-red-500 hover:scale-125 transition-transform duration-200" />
          ) : (
            <MdFavoriteBorder className="cursor-pointer hover:scale-125 transition-transform duration-200" />
          )}
          <span>{post.likes?.length || 0}</span>
        </button>
  
        <button onClick={handleSavePost} className="flex items-center space-x-2">
          {savedPosts.includes(post._id) ? (
            <IoBookmark className="cursor-pointer hover:scale-125 transition-transform duration-200" />
          ) : (
            <IoBookmarkOutline className="cursor-pointer hover:scale-125 transition-transform duration-200" />
          )}
          <span>{savedPosts.includes(post._id) ? "Saved" : "Save"}</span>
        </button>
  
        <button
          onClick={() => {
            setIsCommentsVisible(prev => !prev);
          }}
          className="flex items-center space-x-2 text-gray-500"
        >
          <FaRegComment className="cursor-pointer hover:scale-125 transition-transform duration-200" />
          <span>{isCommentsVisible ? "Hide Comments" : "Show Comments"}</span>
        </button>
      </div>
  
      {isCommentsVisible && (
        <div className="mt-4">
          <form onSubmit={handleReplySubmit} className="flex space-x-2">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border border-gray-300 p-2 rounded-md"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
              Reply
            </button>
          </form>
          <div className="comments mt-2">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="border-t border-gray-300 py-2">
                  <p className="font-semibold">{comment.user.name}:</p>
                  <p>{comment.content}</p>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
        </div>
      )}
      {showProfile && <ProfileModal userData={userData} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default Post;
