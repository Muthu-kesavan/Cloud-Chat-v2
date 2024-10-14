import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import './messageContainer.css';
import { apiClient } from "@/lib/api-client";
import { GET_CHANNEL_MESSAGES, GET_MESSAGES, HOST, DELETE_MESSAGE } from "@/utils/constants";
import { MdFolderZip, MdDelete } from "react-icons/md";
import { toast } from "sonner"
import { IoMdArrowDown } from "react-icons/io";
import { getColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoCloseSharp } from "react-icons/io5"; 
import { GrLocation } from "react-icons/gr";
import Linkify from "react-linkify";
import { Tooltip } from 'react-tooltip'
import { useSocket } from "@/context/socketContext";
import PostModal from "@/components/ui/PostModal";

const MessageContainer = () => {
  const scrollRef = useRef();
  const { 
    setFileDownloadProgress,
    setIsDownloading,
    selectedChatType, 
    selectedChatData, 
    selectedChatMessages, 
    setSelectedChatMessages, 
    userInfo,
    deleteMessage,
  } = useAppStore();
  const socket = useSocket();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isHovered, setHovered] = useState(false);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await apiClient.post(GET_MESSAGES, { id: selectedChatData._id }, { withCredentials: true });
        if (res.data.messages) {
          setSelectedChatMessages(res.data.messages);
        }
      } catch (err) {
        console.log({ err });
      }
    };

    const getChannelMessages = async () => {
      try {
        const res = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`, { withCredentials: true });
        if (res.data.messages) {
          setSelectedChatMessages(res.data.messages);
        }
      } catch (err) {
        console.log({ err });
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === 'contact') getMessages();
      else if (selectedChatType === 'channel') getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };
  const checkVideo = (filePath)=> {
    const videoRegex = /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i;
    return videoRegex.test(filePath);
    }

  const handleDeleteMessage = async (messageId) => {
    try {
      await apiClient.delete(DELETE_MESSAGE.replace(":messageId", messageId), { withCredentials: true });
      deleteMessage(messageId);
      socket.emit("messageDeleted", { messageId });
      toast.success("Message Deleted");
    } catch (err) {
      console.log({ err });
      toast.error("Unable to Delete message");
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    let renderedDates = new Set();

    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate && !renderedDates.has(messageDate);
      lastDate = messageDate;

      if (showDate) {
        renderedDates.add(messageDate);
      }

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDmMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const res = await apiClient.get(`${HOST}/${url}`, {
      responseType: "Blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentComplete = Math.round((loaded * 100) / total);
        setFileDownloadProgress(percentComplete);
      }
    });
    const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderDmMessages = (message) => {
    return (
      <div
        className={`message-container ${
          message.sender === selectedChatData._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`message-bubble ${
              message.sender !== selectedChatData._id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            }`}
          >
            <Linkify>{message.content}</Linkify>
            {message.sender === userInfo.id && (
              <span
                className="delete-icon"
                data-tooltip-id="deleteTooltip"
                style={{ color: isHovered ? "red" : "white" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => handleDeleteMessage(message._id)}
              >
                <MdDelete />
              </span>
            )}
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}
  
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            {checkImage(message.fileUrl) ? (
              <div className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img 
                  src={`${HOST}/${message.fileUrl}`} 
                  height={300} 
                  width={300} 
                  alt="File Image"
                  onError={(e) =>  { 
                    e.target.outerHTML = "<p class='text-red-500 font-semibold p-2 border border-red-300 bg-red-100 rounded'>Image Not Found</p>"; 
                  }}
                />
              </div>
            ) : checkVideo(message.fileUrl) ? (
              <div className="cursor-pointer"
                onClick={() => {
                  setShowVideo(true);
                  setVideoUrl(message.fileUrl);
                }}
              >
                <video
                  src={`${HOST}/${message.fileUrl}`}
                  height={300}
                  width={300}
                  controls
                  onError={(e) =>  { 
                    e.target.outerHTML = "<p class='text-red-500 font-semibold p-2 border border-red-300 bg-red-100 rounded'>Video Not Found</p>"; 
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowDown />
                </span>
              </div>
            )}
  
            {message.sender === userInfo.id && (
              <span
                className="delete-icon"
                data-tooltip-id="deleteTooltip"
                style={{ color: isHovered ? "red" : "white" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => handleDeleteMessage(message._id)}
              >
                <MdDelete />
              </span>
            )}
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}
  
        {message.messageType === "location" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            <span>
              <GrLocation className="text-xl" />
              <a
                href={`https://www.google.com/maps?q=${message.location.lat},${message.location.long}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-500 underline ml-2"
              >
                Location
              </a>
            </span>
            {message.sender === userInfo.id && (
              <span
                className="delete-icon"
                data-tooltip-id="deleteTooltip"
                style={{ color: isHovered ? "red" : "white" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => handleDeleteMessage(message._id)}
              >
                <MdDelete />
              </span>
            )}
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}
  
        {message.messageType === "post" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            {/* Display Image */}
            {message.post.imageUrl && checkImage(message.post.imageUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.post.imageUrl);
                }}
              >
                <img 
                  src={`${HOST}/${message.post.imageUrl}`} 
                  height={300} 
                  width={300} 
                  alt="Post Image"
                  onError={(e) =>  { 
                    e.target.outerHTML = "<p class='text-red-500 font-semibold p-2 border border-red-300 bg-red-100 rounded'>Image Not Found</p>"; 
                  }}
                />
              </div>
            ) : null}
  
            {/* Display Video */}
            {message.post.videoUrl ? (
              <video
                controls
                width="300"
                height="300"
                src={`${HOST}/${message.post.videoUrl}`}
                alt="Post Video"
                onError={(e) =>  { 
                  e.target.outerHTML = "<p class='text-red-500 font-semibold p-2 border border-red-300 bg-red-100 rounded'>Video Not Found</p>"; 
                }}
              />
            ) : null}
  
            {/* If no image/video, display a description with a link */}
            {!message.post.imageUrl && !message.post.videoUrl && (
              <p>{message.post.description}</p>
            )}
  
            {/* Link to the original post */}
            <a
              href={message.post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-align center text-blue-500 underline"
            >
              View Post
            </a>
  
            {/* Delete option for the sender */}
            {message.sender === userInfo.id && (
              <span
                className="delete-icon"
                data-tooltip-id="deleteTooltip"
                style={{ color: isHovered ? "red" : "white" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => handleDeleteMessage(message._id)}
              >
                <MdDelete />
              </span>
            )}
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}
  
        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };
  

  const renderChannelMessages = (message) => {
    const isCurrentUser = message.sender?._id === userInfo.id;

    return (
      <div
        className={`message-container ${isCurrentUser ? "text-right" : "text-left"} mb-4`} >
     
        {!isCurrentUser && (
          <div className="flex items-center justify-start gap-3 mb-1">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender?.image ? (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <AvatarFallback className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(message.sender?.color)}`}>
                  {message.sender?.name ? message.sender.name.charAt(0) : message.sender?.email.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm text-white/68">
              {message.sender?.name || ''}
            </span>
          </div>
        )}

        {message.messageType === "text" && (
          <div
            className={`${
              isCurrentUser
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            <Linkify>{message.content}</Linkify>
            {isCurrentUser && (
               <span
               className="delete-icon"
               data-tooltip-id="deleteTooltip" 
               style={{ color: isHovered ? 'red' : 'white' }} 
               onMouseEnter={() => setHovered(true)}
               onMouseLeave={() => setHovered(false)}
               onClick={() => handleDeleteMessage(message._id)}
             >
               <MdDelete />
             </span>
            )}
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}


        {message.messageType === "file" && (
          <div
            className={`${
              isCurrentUser
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
           {checkImage(message.fileUrl) ? (
          <div className="cursor-pointer" onClick={() => { setShowImage(true); setImageUrl(message.fileUrl); }}>
            <img
              src={`${HOST}/${message.fileUrl}`}
              height={300}
              width={300}
              onError={(e) => { 
                e.target.outerHTML = "<p class='text-red-500 font-semibold p-2 border border-red-300 bg-red-100 rounded'>Image Not Found</p>"; 
              }} 
            />
          </div>
) : checkVideo(message.fileUrl) ? (
  <div className="cursor-pointer" onClick={() => { setShowVideo(true); setVideoUrl(message.fileUrl); }}>
    <video
  src={`${HOST}/${message.fileUrl}`}
  height={300}
  width={300}
  controls
  onError={(e) => { 
    e.target.outerHTML = "<p class='text-red-500 font-semibold p-2 border border-red-300 bg-red-100 rounded'>Video Not Found</p>"; 
  }} 
>
  Your browser does not support the video tag.
</video>

  </div>
) : (
  <div className="flex items-center justify-center gap-4">
    <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
    <span>{message.fileUrl.split("/").pop()}</span>
    <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all" onClick={() => downloadFile(message.fileUrl)}>
      <IoMdArrowDown />
    </span>
  </div>
)}
            {isCurrentUser && (
              <span
              className="delete-icon" data-tooltip-id="deleteTooltip" style={{ color: isHovered ? 'red' : 'white' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => handleDeleteMessage(message._id)}
            >
              <MdDelete />
            </span>
            )}
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}

       
        {message.messageType === "location" && (
          <div
            className={`${
              isCurrentUser
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            <span>
              <GrLocation className="text-xl" />
              <a href={`https://www.google.com/maps?q=${message.location.lat},${message.location.long}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-500 underline ml-2">
                Location
              </a>
              {isCurrentUser && (
                <span
                className="delete-icon" data-tooltip-id="deleteTooltip" style={{ color: isHovered ? 'red' : 'white' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => handleDeleteMessage(message._id)}
              >
                <MdDelete />
              </span>
              )}
            </span>
            <Tooltip id="deleteTooltip" place="top" content="Delete" />
          </div>
        )}

{message.messageType === "post" && (
  <div
  className={`${
    isCurrentUser
      ? "bg-senderBubble text-senderText border-senderBorder"
      : "bg-receiverBubble text-receiverText border-receiverBorder"
  } message-bubble`}
  >
    {/* Display Image */}
    {message.post.imageUrl && checkImage(message.post.imageUrl) ? (
      <div
        className="cursor-pointer"
        onClick={() => {
          setShowImage(true);
          setImageUrl(message.post.imageUrl);
        }}
      >
        <img src={`${HOST}/${message.post.imageUrl}`} height={300} width={300} />
      </div>
    ) : null}


    {message.post.videoUrl ? (
      <video
        controls
        width="300"
        height="300"
        src={`${HOST}/${message.post.videoUrl}`}
        alt="Post Video"
      />
    ) : null}

    {!message.post.imageUrl && !message.post.videoUrl && (
      <p>{message.post.description}</p>
    )}

    <a 
      href={message.post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-align center text-blue-500 underline"
    >
      View Post
    </a>
    {isCurrentUser && (
                <span
                className="delete-icon" data-tooltip-id="deleteTooltip" style={{ color: isHovered ? 'red' : 'white' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => handleDeleteMessage(message._id)}
              >
                <MdDelete />
              </span>
              )}
    <Tooltip id="deleteTooltip" place="top" content="Delete" />
  </div>
)}
        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
};



  return (
    <div className="flex-1 overflow-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lh:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img src={`${HOST}/${imageUrl}`} className="h-[80vh] w-full bg-cover" />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default MessageContainer;