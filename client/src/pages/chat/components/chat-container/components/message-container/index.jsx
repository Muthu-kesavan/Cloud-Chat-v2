import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import './messageContainer.css';
import { apiClient } from "@/lib/api-client";
import { GET_CHANNEL_MESSAGES, GET_MESSAGES, HOST, SHARE_LOCATION} from "@/utils/constants";
import {MdFolderZip} from "react-icons/md";
import { IoMdArrowDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import {GrLocation} from "react-icons/gr"
import { getColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Linkify from "react-linkify";

const MessageContainer = () => {
  const scrollRef = useRef();
  const { 
    setFileDownloadProgress,
    setIsDownloading,
    selectedChatType, 
    selectedChatData, 
    selectedChatMessages, 
    setSelectedChatMessages, 
    userInfo } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

 
  useEffect(()=>{
    const getMessages = async ()=>{
      try{
        const res = await apiClient.post(GET_MESSAGES,{id: selectedChatData._id},{withCredentials: true});
        if(res.data.messages) {
          setSelectedChatMessages(res.data.messages);
        }
      }catch(err){
        console.log({err});
      }
    };

    const getChannelMessages = async()=>{
      try{
        const res = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          {withCredentials: true}
        );
        if(res.data.messages) {
          setSelectedChatMessages(res.data.messages);
        }
      }catch(err){
        console.log({err});
      }
    };

    if(selectedChatData._id){
      if(selectedChatType === 'contact') getMessages();
      else if (selectedChatType === 'channel')getChannelMessages();
    }
  },[selectedChatData, selectedChatType, setSelectedChatMessages])
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkImage =(filePath)=> {
    const imageRegex =  /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;

    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

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

  const downloadFile = async(url)=>{
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const res = await apiClient.get(`${HOST}/${url}`,{
      responseType: "Blob",
      onDownloadProgress:(progressEvent)=>{
        const {loaded, total}= progressEvent;
        const percentComplete = Math.round((loaded*100)/ total);
        setFileDownloadProgress(percentComplete);
      }
    });
    const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href =  urlBlob;
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
        className={`${
          message.sender === selectedChatData._id
            ? "text-left rounded-full"
            : "text-right rounded-full"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            <Linkify>
              {message.content}
            </Linkify>
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
                <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all" onClick={() => downloadFile(message.fileUrl)}>
                  <IoMdArrowDown />
                </span>
              </div>
            )}
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
            
          <span><GrLocation className="text-xl"/>
          <a
            href={`https://www.google.com/maps?q=${message.location.lat},${message.location.long}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-500 underline ml-2"
          > Location
          </a>
          </span>
          </div>
  )}
  
        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };
  
  
  const renderChannelMessages = (message, previousMessage) => {
    const messageMarginTop = previousMessage && previousMessage.messageType !== message.messageType
      ? "mt-4" 
      : "mt-2"; 
  
    return (
      <div className={`flex flex-col items-start gap-2 ${message.sender._id === userInfo.id ? "items-end" : "items-start"} ${messageMarginTop}`}>
        {message.sender._id !== userInfo.id && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image ? (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <AvatarFallback
                  className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                    message.sender.color
                  )}`}
                >
                  {message.sender.name
                    ? message.sender.name.charAt(0)
                    : message.sender.email.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm text-white/60">{message.sender.name}</span>
          </div>
        )}
  
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-receiverBubble text-receiverText border-receiverBorder"
                : "bg-senderBubble text-senderText border-senderBorder"
            } message-bubble p-3 rounded-lg relative ml-9`}
          >
            <Linkify>
            {message.content}
            </Linkify>
            <span className="text-xs text-white/60 mt-1 block text-right">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        )}
  
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id !== userInfo.id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble `} 
          >
            {checkImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} />
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
            {message.messageType === "location" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-senderBubble text-senderText border-senderBorder"
                : "bg-receiverBubble text-receiverText border-receiverBorder"
            } message-bubble`}
          >
            
          <span><GrLocation className="text-xl"/>
          <a
            href={`https://www.google.com/maps?q=${message.location.lat},${message.location.long}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-500 underline ml-2"
          > Location
          </a>
          </span>
          </div>
  )}
          </div>
        )}
  
        
        {message.messageType !== "text" && (
          <div className="text-xs text-gray-600"> 
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lh:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {
        showImage && <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img src={`${HOST}/${imageUrl}`} className="h-[80vh] w-full bg-cover"/>
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
            onClick={()=> downloadFile(imageUrl)}>
              <IoMdArrowDown />
            </button>
            <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
            onClick={()=> {
              setShowImage(false)
              setImageUrl(null);
            }}>
              <IoCloseSharp />
            </button>
          </div>
        </div>
      }
    </div>
  );
};


export default MessageContainer;
