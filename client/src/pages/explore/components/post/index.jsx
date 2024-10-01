import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store"; 
import { FaRegComment } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import formatDistance from "date-fns/formatDistance";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { BsSend } from "react-icons/bs";
import { GET_POST_COMMENTS, GET_USER, HOST, REPLY_TO_POST } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { getColor } from "@/lib/utils";
import ProfileModal from "@/components/ui/ProfileModal";

const Post = ({ post }) => {
  const {
    userInfo,
    likePost,
    postSaveorUnsave,
    replyToPost,
  } = useAppStore(); 

  const [userData, setUserData] = useState(null);
  const [enlargePicture, setEnlargePicture] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [replyText, setReplyText]= useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const dateStr = formatDistance(new Date(post.createdAt), new Date());
  console.log(comments);
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

  useEffect(()=>{
    const fetchCommentCount = async()=>{
      try{
        const res = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
        setCommentCount(res.data?.comments?.length || 0);
      }catch(err){
        console.log(err);
      }
    };
    fetchCommentCount();
  }, [post._id]);

  useEffect(()=>{
    const fetchComments = async()=>{
      try{
        const fetchedComments = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
        setComments(fetchedComments.data?.comments || []);
      }catch(err){
        console.error(err);
      }
    };
    if (showComments){
      fetchComments();
    }
  }, [post._id, showComments]);

  const handleLike = async () => {
    await likePost(post._id);
  };


  const handleSavePost = async () => {
    setIsSaving(true);
    await postSaveorUnsave(post._id);
    setIsSaving(false);
  };

  const handleAddComment = async()=> {
    try{
      await apiClient.put(REPLY_TO_POST(post._id),
        {text: replyText},
       {withCredentials: true}
    );
    const fetchedComments = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
        setComments(fetchedComments.data?.replies || []);
        setReplyText('');
    }catch(err){
      console.error(err);
    }
  };

  const handlePictureClick = () => {
    setEnlargePicture(!enlargePicture);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  const handleToggleComments = ()=> {
    setShowComments(!showComments);
  }

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-lg mb-6 transition-shadow hover:shadow-xl">
      {userData && (
        <div className="flex items-center mb-3">
          <div className="mb-0 cursor-pointer" onClick={handleProfileClick}>
            {userData.image ? (
              <img
                src={`${HOST}/${userData.image}`}
                alt="Profile pic"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className={`uppercase h-10 w-10 md:w-12 md:h-12 text-xl md:text-2xl border-2 flex items-center justify-center rounded-full ${getColor(
                  userData.color
                )}`}
              >
                {userData.name ? userData.name.charAt(0) : userInfo?.email?.charAt(0)}
              </div>
            )}
          </div>
          <span className="ml-3 font-semibold text-lg">{userData.name}</span>
          <p className="text-gray-500 ml-2">- {dateStr} ago</p>
        </div>
      )}
  
      <p className="font-semibold text-md mb-3">{post.description}</p>
  
      <div className="flex flex-col items-center">
        {post.video ? (
          <video
            controls
            controlsList="nodownload"
            src={`${HOST}/${post.video}`}
            className="rounded-lg max-h-screen cursor-pointer transition-all duration-300"
          />
        ) : post.picture ? (
          <>
            {enlargePicture && (
              <div
                className="fixed inset-0 z-20 bg-black bg-opacity-80 flex items-center justify-center"
                onClick={handlePictureClick}
              >
                <img
                  src={`${HOST}/${post.picture}`}
                  alt="Enlarged Post"
                  className="rounded-lg max-h-screen cursor-pointer transition-all duration-300"
                />
              </div>
            )}
            <img
              src={`${HOST}/${post.picture}`}
              alt="Post"
              className="rounded-lg max-w-full h-64 object-cover cursor-pointer my-4 transition-transform duration-300 hover:scale-105"
              onClick={handlePictureClick}
            />
          </>
        ) : null}
      </div>
  
      <div className="flex items-center space-x-6 mt-4 text-lg md:text-xl">
        <button onClick={handleLike} className="flex items-center space-x-2">
          {post.likes?.includes(userInfo?.id) ? (
            <MdFavorite className="text-red-500 hover:scale-125 transition-transform duration-200" />
          ) : (
            <MdFavoriteBorder className="hover:scale-125 transition-transform duration-200" />
          )}
          <span>{post.likes?.length || 0}</span>
        </button>
  
        {/* Move comments button here */}
        <button onClick={handleToggleComments} className="flex items-center space-x-2">
          <FaRegComment className="hover:scale-125 transition-transform duration-200" />
          <span>{commentCount}</span>
        </button>
  
        {/* Save button moved to third */}
        <button onClick={handleSavePost} className="flex items-center space-x-2">
          {isSaving ? (
            <span>Saving...</span>
          ) : post.saved?.includes(userInfo?.id) ? (
            <IoBookmark className="hover:scale-125 transition-transform duration-200" />
          ) : (
            <IoBookmarkOutline className="hover:scale-125 transition-transform duration-200" />
          )}
          <span>{post.saved?.includes(userInfo?.id) ? "Saved" : "Save"}</span>
        </button>
      </div>
  
      {showComments && (
  <div className="comments mt-4 border-t border-[#5A00EE] pt-4">
    <div className="max-h-40 overflow-y-auto">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="border-t py-2">
            <p className="font-semibold">{comment.userId.name}</p>
            <p className="text-gray-400">{comment.text}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No comments yet</p>
      )}
    </div>

    <div className="flex items-center mt-2">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A00EE] focus:border-[#5A00EE] transition-all bg-white text-gray-900"
        placeholder="Comment!"
      />
      <button onClick={handleAddComment} className="ml-2 text-primary">
        <IoMdSend className="text-2xl text-neutral-500 duration-300 transition-all hover:text-white hover:bg-[#5A00EE] p-1 rounded-full" />
      </button>
    </div>
  </div>
)}
      {showProfile && <ProfileModal userData={userData} onClose={() => setShowProfile(false)} />}
    </div>
  )
  }
export default Post;