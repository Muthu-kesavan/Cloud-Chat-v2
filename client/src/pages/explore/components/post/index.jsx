import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/store"; 
import { FaRegComment } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder, MdDelete} from "react-icons/md";
import { RiSendPlaneLine } from "react-icons/ri";
import SkeletonLoader from "@/loaders/SkeletonLoader";
import CommentSkeletonLoader from "@/loaders/CommentSkeletonLoader";
import formatDistance from "date-fns/formatDistance";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { GET_POST_COMMENTS, GET_USER, HOST, REPLY_TO_POST } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { getColor } from "@/lib/utils";
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Linkify from "react-linkify";
import ProfileModal from "@/components/ui/ProfileModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ShareModal from "@/components/ui/ShareModal";
import PostModal from "@/components/ui/PostModal";


const Post = ({post}) => {
  const {
    userInfo,
    likePost,
    postSaveorUnsave,
    deletePost
  } = useAppStore(); 

  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [enlargePicture, setEnlargePicture] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isHovered, setHovered] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const dateStr = formatDistance(new Date(post.createdAt), new Date());


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUserData(true);
        const res = await apiClient.get(GET_USER.replace(':id', post.userId)); 
        setUserData(res.data || {});
      } catch (err) {
        console.log({ err });
      } finally{
        setLoadingUserData(false);
      }
    };
    fetchData();
  }, [post.userId]);

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const res = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
        setCommentCount(res.data?.comments?.length || 0);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCommentCount();
  }, [post._id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const fetchedComments = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
        setComments(fetchedComments.data?.comments || []);
      } catch (err) {
        console.error(err);
      } finally{
        setLoadingComments(false);
      }
    };
    if (showComments) {
      fetchComments();
    }
  }, [post._id, showComments]);

  const handleLike = async () => {
    try{
      await likePost(post._id);
    }
    catch(err){
      console.error(err);
    };
  };

  const handleSavePost = async () => {
    setIsSaving(true);
    await postSaveorUnsave(post._id);
    setIsSaving(false);
  };

  const handleAddComment = async () => {
    try {
      await apiClient.put(REPLY_TO_POST(post._id),
        { text: replyText },
        { withCredentials: true }
      );
      const fetchedComments = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
      setComments(fetchedComments.data?.comments || []);
      setReplyText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post._id); 
      console.log(post._id);
      toast.success("Post Deleted SuccessFully");

    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handlePictureClick = () => {
    setEnlargePicture(!enlargePicture);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  const handleDeleteClick = () => {

    setDialogOpen(true); 
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleShareClick = () => {
    setShareModalOpen(true);
  };

  if (loadingUserData) {
    return <SkeletonLoader />;
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
          <span className="ml-3 font-semibold text-lg text-white">{userData.name}</span>
          <p className="text-gray-500 ml-2">- {dateStr} ago</p>
        </div>
      )}
      <Linkify>
      <p className="text-md mb-3 text-[#EAEAEA]">{post.description}</p>
      </Linkify>
      <div className="flex flex-col items-center">
        {post.video ? (
          <video
            controls
            controlsList="nodownload"
            alt="Post Video"
            src={`${HOST}/${post.video}`}
            className="rounded-lg max-h-96 max-w-full cursor-pointer transition-all duration-300"

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
  
      <div className="flex  justify-around items-center space-x-4 mt-4 text-lg md:text-xl">
        
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
      <button onClick={handleLike} className="flex items-center space-x-2 relative">
  {post.likes?.includes(userInfo?.id) ? (
    <>
      <MdFavorite className="text-[#5A00EE] hover:scale-125 transition-transform duration-200" />
    </>
  ) : (
    <MdFavoriteBorder className="hover:scale-125 transition-transform duration-200" />
  )}
  <span>{post.likes?.length || 0}</span>
</button>
      </TooltipTrigger>
      <TooltipContent className="border-none">
        <p>Like</p>
      </TooltipContent>
    </Tooltip>
    
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={handleToggleComments} className="flex items-center space-x-2">
          <FaRegComment className="hover:scale-125 transition-transform duration-200" />
          <span>{commentCount}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="border-none">
        <p>Comment</p>
      </TooltipContent>
    </Tooltip>
    <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleShareClick} className="flex items-center space-x-2">
                <RiSendPlaneLine className=" text-2xl hover:scale-125 transition-transform duration-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Share</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
    
    <Tooltip>
      <TooltipTrigger asChild>
      <button onClick={handleSavePost} className="flex items-center space-x-2">
  {post.saved?.includes(userInfo?.id) ? (
    <>
      <IoBookmark className="hover:scale-125 transition-transform duration-200" />
    </>
  ) : (
    <IoBookmarkOutline className="hover:scale-125 transition-transform duration-200" />
  )}
  {isSaving ? null : null}
</button>

      </TooltipTrigger>
      <TooltipContent className="border-none">
        <p>Save</p>
      </TooltipContent>
    </Tooltip>
    
  
    {location.pathname === "/lets-post" && (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDeleteClick}
            className="flex items-center space-x-2 relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <MdDelete
              className={`transition duration-200 ${
                isHovered ? 'text-red-600 scale-125 transition-transform duration-200' : 'text-white'
              }`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent className="border-none">
          <p>Delete</p>
        </TooltipContent>
      </Tooltip>
    )}

  </TooltipProvider>
</div>
  
      {showComments && (
        <div className="comments mt-4 border-t border-[#5A00EE] pt-4">
          { loadingComments ? 
          (
          <CommentSkeletonLoader />
        ): (
<div className="max-h-60 overflow-y-auto">
  {comments && comments.length > 0 ? (
    comments.map((comment) => (
      <div key={comment._id} className="border-t py-2 flex items-start">
        <div className="mr-2">
          {comment.userId.image ? (
            <img
              src={`${HOST}/${comment.userId.image}`}
              alt="Commenter"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                comment.userId.color
              )}`}
            >
              {comment.userId.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex  items-center">
            <p className="font-semibold mr-2">{comment.userId.name}</p>
            <p className="text-xs text-gray-500">
                        - {formatDistance(new Date(comment.createdAt), new Date())}{" "}
                        ago
                      </p>
          </div>
          <p className="text-gray-400">{comment.text}</p>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No comments yet</p>
  )}
</div>
        )}
          
          <div className="mt-2 flex">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="border border-gray-300 text-gray-600 rounded-md p-2 flex-grow mr-2"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleAddComment}
              className="ml-2"
            >
              <IoMdSend className="text-2xl text-neutral-500 duration-300 transition-all hover:text-white hover:bg-[#5A00EE] p-1 rounded-full" />
            </button>
          </div>
        </div>
      )}
      {showProfile && <ProfileModal userData={userData} onClose={() => setShowProfile(false)} />}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1c1d25] rounded-lg border-none text-white max-w-md w-full p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Are you sure you want to delete this post?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center mt-4 gap-3">
            <button onClick={() => setDialogOpen(false)} className="flex items-center  bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">
              No
            </button>
            <button onClick={handleDeletePost} className="bg-red-500 hover:bg-red-600 text-white py-2  px-4 rounded">
              Yes
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ShareModal post={post} isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} />
      <PostModal post={post} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Post;