import { useAppStore } from '@/store';
import React, { useState } from 'react';
import { IoMdSend } from "react-icons/io";
import { SlPicture } from "react-icons/sl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserContent from '../userContent';
import { IoMdCloseCircle } from "react-icons/io";
import { toast } from "sonner"

const MainPost = () => {
  const { userInfo, createPost } = useAppStore();
  const [postText, setPostText] = useState("");
  const [media, setMedia] = useState(null); 
  const [mediaInfo, setMediaInfo] = useState("");

  const handleMediaChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const allowedVideoTypes = ['video/mp4', 'video/quicktime']; 

      if (allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type)) {
        setMedia(file);
        
      } else {
        setMedia(null); 
        
        document.getElementById('mediaInput').value = ""; 
        toast.error("Only image files and video files are allowed.");
      }
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaInfo("");
    document.getElementById('mediaInput').value = ""; 
  };

  const handleIconClick = () => {
    document.getElementById('mediaInput').click();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    if (postText) formData.append('description', postText);
    if (media) formData.append('file', media);

    try {
      await createPost(formData);
      setPostText(""); 
      setMedia(null); 
      setMediaInfo(""); 
      window.location.reload(false); 
      toast.success("Posted Successfully");
    } catch (err) {
      console.error("Error creating post:", err);
      toast.error("Failed to create post.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
    }
  };

  return (
    <div className='bg-[#1c1d25] mt-2'>
      <div className='border-b-1 pb-4'>
        <textarea
          placeholder={`Post your thoughts ${userInfo.name}`}
          maxLength={300}
          className='bg-[#2b2c37] text-white rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-[#5A00EE] focus:border-transparent border-2 border-[#5A00EE]'
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          onKeyPress={handleKeyPress} 
        ></textarea>
        <input
          type="file"
          id="mediaInput"
          onChange={handleMediaChange}
          accept="image/*, video/*"
          className="hidden"
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                type="button" 
                onClick={handleIconClick}
                className='my-2 mx-5 focus:outline-none'
              >
                <SlPicture className='text-2xl hover:scale-125 transition-transform duration-200' />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Upload Media
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <button
                type="button" 
                onClick={handleSubmit} 
                className={`py-2 px-4 rounded-full ml-auto ${!postText.trim() && !media ? 'cursor-not-allowed opacity-80' : ''}`}
                disabled={!postText.trim() && !media}
              >
                <IoMdSend className='text-2xl hover:scale-125 transition-transform duration-200' />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Send Post
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {media && (
          <div className='relative flex justify-center mt-4'>
            <button onClick={handleRemoveMedia} className="absolute top-1 right-2 text-red-600 text-3xl">
              <IoMdCloseCircle />
            </button>
            {media.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(media)}
                alt="preview"
                className='max-w-xs max-h-64 object-contain'
              />
            ) : (
              <video
                src={URL.createObjectURL(media)}
                controls
                className='max-w-xs max-h-48'
              />
            )}
          </div>
        )}

        
      </div>
      <hr className='my-4 border-slate-300' />
      <UserContent />
    </div>
  );
};

export default MainPost;
