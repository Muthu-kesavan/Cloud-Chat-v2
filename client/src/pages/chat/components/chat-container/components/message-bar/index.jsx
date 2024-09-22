import { useAppStore } from '@/store';
import { useSocket } from '@/context/socketContext';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react'
import{GrAttachment}from "react-icons/gr"
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import {GrLocation} from 'react-icons/gr';
import { apiClient } from '@/lib/api-client';
import { UPLOAD_FILE } from '@/utils/constants';


const MessageBar = () => {
  const {setIsUploading,
    setFileUploadProgress,
    userInfo, 
    selectedChatType, 
    selectedChatData} = useAppStore();
  const socket = useSocket();
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false)

   useEffect(()=>{
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)){
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return ()=>{
      document.removeEventListener("mousedown", handleClickOutside)
    }
   }, [emojiRef]);

  const handleEmoji = (emoji)=>{
    setMessage((msg)=>msg+emoji.emoji);
  }
  const handleSendMsg = async()=> {
    if( selectedChatType === "contact"){
      socket.emit("sendMessage",{
        sender:userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if(selectedChatType==="channel"){
      socket.emit("send-channel-message", {
        sender:userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
  };

  

  const handleAttachmentClick =()=>{
    if(fileInputRef.current){
      fileInputRef.current.click();
    }
  };


  const handleAttachmentChange= async (e)=>{
    try{
      const file = e.target.files[0];
      if(file){
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const res = await apiClient.post(UPLOAD_FILE,formData,{
          withCredentials: true,
          onUploadProgress: data=>{
            setFileUploadProgress(Math.round((100*data.loaded)/data.total));
          },
        });
        if(res.status===200 && res.data){
          setIsUploading(false);
          if(selectedChatType ==="contact"){
            socket.emit("sendMessage",{
              sender:userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: res.data.filePath,
            });
          } else if (selectedChatType === "channel"){
            socket.emit("send-channel-message", {
              sender:userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: res.data.filePath,
              channelId: selectedChatData._id,
            })
          }
      }
    }
      console.log({file});
    } catch(err){
      setIsUploading(false);
      console.log({err});
    }
  };
  return (
    <div className='h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6'>
      
      <div className='flex-1 flex bg-[#2a2b33] rounded-full items-center gap-5 pr-5'>
        <input type='text' 
        className='flex-1 p-5 bg-transparent rounded-full focus:border-none focus:outline'
        placeholder='Enter Message'
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        
        />
        <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
        onClick={()=>{}}
        >
        <GrLocation  className='text-2xl'/>
        </button>
        
        <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
        onClick={handleAttachmentClick}
        >
          <GrAttachment className='text-2xl' />
        </button>
        <input type='file' className='hidden' ref={fileInputRef} onChange={handleAttachmentChange} />
        <div className='relative'>
        <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
        onClick={()=>setEmojiOpen(true)}
        >
          <RiEmojiStickerLine className='text-2xl' />
        </button>
        <div className='absolute bottom-16 right-0'ref={emojiRef}>
          <EmojiPicker 
          theme='dark'
          open={emojiOpen} 
          onEmojiClick={handleEmoji} 
          autoFocusSearch={false} 
          />
        </div>
        </div>
      </div>
      <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
        onClick={handleSendMsg}
        >
          <IoSend className='text-[#5201fe] hover:text-[#7A33FF]  text-2xl' />
        </button>
      </div>
  )
}

export default MessageBar