import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdFavorite, MdFavoriteBorder, MdDelete } from 'react-icons/md';
import { FaRegComment } from 'react-icons/fa';
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Linkify from 'react-linkify'; 
import { apiClient } from '@/lib/api-client';
import { HOST, SINGLE_POST, GET_USER } from '@/utils/constants';  
import { getColor } from '@/lib/utils';
import { formatDistance } from 'date-fns';

const SinglePost = () => {
    const { postId } = useParams(); 
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enlargePicture, setEnlargePicture] = useState(false);
    // Fetch post data
    useEffect(() => {
      const fetchPost = async () => {
        try {
          const response = await apiClient.get(SINGLE_POST(postId));  
          setPost(response.data.post);
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

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>Post not found</div>;

    const handlePictureClick = () => {
        setEnlargePicture(!enlargePicture);
      };

    const redirectToLogin = () => {
        navigate('/auth');
    };

    return (
        <div className='h-[100vh] w-[100vw] flex items-center justify-center bg-[#1c1d25]'>
            <div className="p-6 border border-gray-700 rounded-md shadow-lg mb-6 transition-shadow hover:shadow-xl bg-[#2a2b32]">
                {userData && (
                    <div className="flex items-center mb-4">
                        <div className="cursor-pointer" onClick={redirectToLogin}>
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
                            <p className="text-gray-400 text-sm">- {formatDistance(new Date(post.createdAt), new Date())} ago</p>
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
                                <button onClick={redirectToLogin} className="flex items-center space-x-2">
                                    {post.likes.includes('dummyUserId') ? (
                                        <MdFavorite className="text-white hover:scale-125 transition-transform duration-200" />
                                    ) : (
                                        <MdFavoriteBorder className="hover:scale-125 transition-transform duration-200" />
                                    )}
                                    <span className='text-white'>{post.likes.length} Likes</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="border-none">
                                <p>Like</p>
                            </TooltipContent>
                        </Tooltip>
    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={redirectToLogin} className="flex items-center space-x-2">
                                    <FaRegComment className="hover:scale-125 transition-transform duration-200 text-white" />
                                    <span className='text-white'>{post.replies.length} Comments</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="border-none">
                                <p>Comment</p>
                            </TooltipContent>
                        </Tooltip>
    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={redirectToLogin} className="flex items-center space-x-2">
                                    <IoBookmarkOutline className="hover:scale-125 transition-transform duration-200 text-white" />
                                    <span className='text-white'>Save</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="border-none">
                                <p>Save</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
    
                <div className="mt-6 flex flex-col items-center">
                    <p className="text-gray-400 text-sm mb-2 text-center"><span className='text-white'>Login</span>to unlock your ability to engage with this post.</p>
                    <button
                        onClick={redirectToLogin}
                        className="bg-[#5A00EE] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[#3B0088] transition-colors duration-300"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
    
};

export default SinglePost;
