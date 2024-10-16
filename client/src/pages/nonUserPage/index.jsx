import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from "@/store"; 
import { MdFavorite, MdFavoriteBorder} from 'react-icons/md';
import { FaRegComment } from 'react-icons/fa';
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Linkify from 'react-linkify'; 
import { apiClient } from '@/lib/api-client';
import { HOST, SINGLE_POST, GET_USER, GET_POST_COMMENTS, REPLY_TO_POST } from '@/utils/constants';  
import { getColor } from '@/lib/utils';
import { formatDistance } from 'date-fns';
import { RiSendPlaneLine } from 'react-icons/ri';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileModal from "@/components/ui/ProfileModal";
import ShareModal from '@/components/ui/ShareModal';
import { IoMdSend } from 'react-icons/io';
import NotFoundPage from '../notFoundPage';

const SinglePost = () => {
    const {
        userInfo,
        likePost,
        postSaveorUnsave,
      } = useAppStore();
    const { postId } = useParams(); 
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enlargePicture, setEnlargePicture] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const [features, setFeatures] = useState({});
    const [isHovered, setHovered] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);

    useEffect(() => {
      const fetchPost = async () => {
        try {
          const response = await apiClient.get(SINGLE_POST(postId), {withCredentials: true});  
          setPost(response.data.post);
          console.log(response.data);
          setFeatures(response.data.features);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching post: ", error);
          setLoading(false);
        }
      };
    
      fetchPost();
    }, [postId]);

    useEffect(() => {
      const fetchUserData = async () => {
        if (post && post.userId) { 
          try {
            const res = await apiClient.get(GET_USER.replace(':id', post.userId)); 
            setUserData(res.data || {});
          } catch (err) {
            console.log({ err });
          }
        }
      };
      fetchUserData();
    }, [post]);  

    useEffect(() => {
        const fetchCommentCount = async () => {
          try {
            const res = await apiClient.get(GET_POST_COMMENTS(postId), { withCredentials: true });
            setCommentCount(res.data?.comments?.length || 0);
          } catch (err) {
            console.log(err);
          }
        };
        fetchCommentCount();
      }, [postId]);

     useEffect(() => {
        const fetchComments = async () => {
          try {
            const fetchedComments = await apiClient.get(GET_POST_COMMENTS(postId), { withCredentials: true });
            setComments(fetchedComments.data?.comments || []);
          } catch (err) {
            console.error(err);
          }
        };
        if (showComments) {
          fetchComments();
        }
      }, [postId, showComments]);
    
      const handleLike = async () => {
        try {
          await likePost(postId);
          setPost((prevPost) => ({
            ...prevPost,
            likes: post.likes.includes(userInfo?.id)
              ? post.likes.filter((id) => id !== userInfo?.id) 
              : [...post.likes, userInfo?.id], 
          }));
        } catch (error) {
          console.error('Error liking post:', error);
        }
      };
      
      const handleSavePost = async () => {
        setIsSaving(true);
        try {
          await postSaveorUnsave(postId);
          setPost((prevPost) => ({
            ...prevPost,
            saved: post.saved.includes(userInfo?.id)
              ? post.saved.filter((id) => id !== userInfo?.id) 
              : [...post.saved, userInfo?.id], 
          }));
        } catch (error) {
          console.error('Error saving post:', error);
        } finally {
          setIsSaving(false);
        }
      };
      
    const handleAddComment = async () => {
        try {
          await apiClient.put(REPLY_TO_POST(postId),
            { text: replyText },
            { withCredentials: true }
          );
          const fetchedComments = await apiClient.get(GET_POST_COMMENTS(postId), { withCredentials: true });
          setComments(fetchedComments.data?.comments || []);
          setReplyText('');
        } catch (err) {
          console.error(err);
        }
      };

    if (loading) return <div>Loading...</div>;
    if (!post) return <NotFoundPage />

    const handlePictureClick = () => {
        setEnlargePicture(!enlargePicture);
      };
    
    const handleShareClick = ()=>{
        setShareModalOpen(true);
    };

    const redirectToLogin = () => {
        navigate('/auth');
    };

    const handleProfileClick = () => {
        setShowProfile(!showProfile);
      };
    
      
    
      const handleToggleComments = () => {
        setShowComments(!showComments);
      };
    

    return (
        <div className='h-[100vh] w-[100vw] flex items-center justify-center bg-[#1c1d25]'>
            <div className="p-6 border border-[#5A00EE] rounded-md shadow-lg mb-6 transition-shadow hover:shadow-xl bg-[#2a2b32]">
                {userData && (
                    <div className="flex items-center mb-4">
                        <div className="cursor-pointer" onClick={features.canLike ? handleProfileClick :redirectToLogin}>
                            {userData.image ? (
                                <img
                                    src={`${HOST}/${userData.image}`}
                                    alt="Profile pic"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className={`uppercase h-12 w-12 text-xl border-2 flex items-center justify-center rounded-full ${getColor(userData.color)}`}
                                >
                                    {userData.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="ml-3">
                            <span className="font-semibold text-lg text-white">{userData.name}</span>
                            <p className="text-gray-400 text-sm"> {formatDistance(new Date(post.createdAt), new Date())} ago</p>
                        </div>
                    </div>
                )}
                <Linkify>
                    <p className="text-md mb-4 text-[#EAEAEA]">{post.description}</p>
                </Linkify>
                <div className="flex flex-col items-center">
                    {post.video ? (
                        <video
                            controls
                            controlsList="nodownload"
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
    
                <div className="flex justify-around items-center space-x-6 mt-4 text-lg md:text-xl">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <button onClick={features.canLike ? handleLike: redirectToLogin} className="flex items-center space-x-2 relative">
                                    {post.likes?.includes(userInfo?.id) ? (
                                        <>
                                        <MdFavorite className=" text-[#5A00EE] hover:scale-125 transition-transform duration-200" />
                                        </>
                                    ) : (
                                        <MdFavoriteBorder className=" text-white hover:scale-125 transition-transform duration-200 " />
                                    )}
                                    <span className='text-white'>{post.likes?.length || 0}</span>
                                    </button>
                            </TooltipTrigger>
                            <TooltipContent className="border-none">
                                <p>Like</p>
                            </TooltipContent>
                        </Tooltip>
    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={features.canComment ? handleToggleComments: redirectToLogin} className="flex items-center space-x-2">
                                    <FaRegComment className="hover:scale-125 transition-transform duration-200 text-white" />
                                    <span className='text-white'>{commentCount}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="border-none">
                                <p>Comment</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={features.canShare ? handleShareClick : redirectToLogin} className="flex items-center space-x-2">
                <RiSendPlaneLine className=" text-2xl hover:scale-125 transition-transform duration-200 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Share</p>
            </TooltipContent>
          </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={features.canSave ? handleSavePost : redirectToLogin} className="flex items-center space-x-2">
                                {post.saved?.includes(userInfo?.id) ? (
    <>
      <IoBookmark className="hover:scale-125 transition-transform duration-200 text-white" />
    </>
  ) : (
    <IoBookmarkOutline className="hover:scale-125 transition-transform duration-200 text-white" />
  )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="border-none">
                                <p>Save</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
    {features.canComment ? (""):(
        <div className="mt-6 flex flex-col items-center">
        <p className="text-gray-400 text-sm mb-2 text-center"><span className='text-white'>Login</span> to unlock your ability to engage with this post.</p>
        <button
            onClick={redirectToLogin}
            className="bg-[#5A00EE] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[#3B0088] transition-colors duration-300"
        >
            Log In
        </button>
    </div>
        )}
        {showComments && (
        <div className="comments mt-4 border-t border-[#5A00EE] pt-4">
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
            <button onClick={()=>{}} className="bg-red-500 hover:bg-red-600 text-white py-2  px-4 rounded">
              Yes
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ShareModal post={post} isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} />
            </div>
        </div>
    );
    
};

export default SinglePost;
