import { useAppStore } from '@/store';
import { useSocket } from '@/context/socketContext';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment } from "react-icons/gr";
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { GrLocation } from 'react-icons/gr';
import { apiClient } from '@/lib/api-client';
import { SHARE_LOCATION, UPLOAD_FILE } from '@/utils/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MessageBar = () => {
  const { setIsUploading, setFileUploadProgress, userInfo, selectedChatType, selectedChatData } = useAppStore();
  const socket = useSocket();
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMsg = async () => {
    if (message.trim()) {
      if (selectedChatType === "contact") {
        socket.emit("sendMessage", {
          sender: userInfo.id,
          content: message,
          recipient: selectedChatData._id,
          messageType: "text",
          fileUrl: undefined,
        });
      } else if (selectedChatType === "channel") {
        socket.emit("send-channel-message", {
          sender: userInfo.id,
          content: message,
          messageType: "text",
          fileUrl: undefined,
          channelId: selectedChatData._id,
        });
      }
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleSendMsg();
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const res = await apiClient.post(UPLOAD_FILE, formData, {
          withCredentials: true,
          onUploadProgress: data => {
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          },
        });
        if (res.status === 200 && res.data) {
          setIsUploading(false);
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: res.data.filePath,
            });
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              sender: userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: res.data.filePath,
              channelId: selectedChatData._id,
            });
          }
        }
      }
      console.log({ file });
    } catch (err) {
      setIsUploading(false);
      console.log({ err });
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setOpenModal(true);
        },
        (error) => {
          console.error(error);
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleShareLocation = async () => {
    if (location) {
      await apiClient.post(SHARE_LOCATION, {
        lat: location.latitude,
        long: location.longitude,
      });
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: "Shared my location",
        recipient: selectedChatData._id,
        messageType: "location",
        location: location,
      });
      setOpenModal(false);
      setLocation(null);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-4 md:px-8 mb-6 gap-4 md:gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-full items-center gap-3 md:gap-5 pr-3 md:pr-5">
        <input
          type="text"
          className="flex-1 p-3 md:p-5 bg-transparent rounded-full focus:border-none focus:outline-none text-white"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress} 
        />
  
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                onClick={handleLocationClick}
              >
                <GrLocation className="text-2xl" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Share Location</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
  
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                onClick={handleAttachmentClick}
              >
                <GrAttachment className="text-2xl" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Attach File</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
  
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />
  
        <div className="relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                  onClick={() => setEmojiOpen(true)}
                >
                  <RiEmojiStickerLine className="text-2xl" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-none">
                <p>Emoji</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
  
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiOpen}
              onEmojiClick={handleEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
  
      <button
        className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        onClick={handleSendMsg}
      >
        <IoSend className="text-[#5201fe] hover:text-[#7A33FF] text-2xl" />
      </button>
  
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[90%] max-w-[400px] h-auto flex flex-col p-4">
          <DialogHeader>
            <DialogTitle>Share Your Location</DialogTitle>
            <DialogDescription>Are you sure you want to share your current location?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <button onClick={handleShareLocation} className="bg-green-500 text-white p-2 rounded">
              Yes
            </button>
            <button onClick={() => setOpenModal(false)} className="ml-2 p-2 rounded">
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageBar;
