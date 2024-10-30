import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '@/store';
import { useSocket } from '@/context/socketContext';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment, GrLocation } from "react-icons/gr";
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { apiClient } from '@/lib/api-client';
import { UPLOAD_FILE } from '@/utils/constants';
import { Dialog, DialogContent} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MessageBar = () => {
  const { setIsUploading, setFileUploadProgress, userInfo, selectedChatType, selectedChatData } = useAppStore();
  const socket = useSocket();
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    let mapInstance;

    const initializeMap = (latitude, longitude) => {
      mapInstance = L.map('location-map').setView([latitude, longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance);

      const userMarker = L.marker([latitude, longitude]).addTo(mapInstance)
        .bindPopup("You are here!")
        .openPopup();
      setMarker(userMarker);

      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        L.marker([lat, lng]).addTo(mapInstance).bindPopup("You selected this location!").openPopup();
      });

      setMap(mapInstance);
    };

    if (openModal) {
      const timeoutId = setTimeout(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              initializeMap(latitude, longitude);
            },
            (error) => {
              console.error("Error getting location:", error);
              alert("Please allow location access to use this feature.");
              setOpenModal(false); 
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          alert("Geolocation is not supported by your browser.");
          setOpenModal(false); 
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        if (mapInstance) {
          if (marker) {
            mapInstance.removeLayer(marker);
            setMarker(null);
          }
          mapInstance.off();
          mapInstance.remove();
        }
      };
    }
  }, [openModal, selectedLocation]);

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
      const messageData = {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      };

      if (selectedChatType === "contact") {
        socket.emit("sendMessage", messageData);
      } else if (selectedChatType === "channel") {
        socket.emit("send-channel-message", { ...messageData, channelId: selectedChatData._id });
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
          const messageData = {
            sender: userInfo.id,
            content: undefined,
            recipient: selectedChatData._id,
            messageType: "file",
            fileUrl: res.data.filePath,
          };
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", messageData);
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", { ...messageData, channelId: selectedChatData._id });
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
        () => setOpenModal(true),
        (error) => {
          console.error("Error getting location:", error);
          alert("Please allow location to access this feature.");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        if (map) {
          map.setView([latitude, longitude], 13);
          L.marker([latitude, longitude]).addTo(map)
            .bindPopup("You are here!")
            .openPopup();
        }

        const locationMessage = {
          sender: userInfo.id,
          recipient: selectedChatData._id,
          messageType: "location",
          location: { lat: latitude, long: longitude },
        };

        if (selectedChatType === "contact") {
          socket.emit("sendMessage", locationMessage);
        } else if (selectedChatType === "channel") {
          socket.emit("send-channel-message", { ...locationMessage, channelId: selectedChatData._id });
        }

        setOpenModal(false);
      }, (error) => {
        console.error("Error getting location:", error);
        setOpenModal(false); 
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      setOpenModal(false); 
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
                <GrLocation className="text-2xl hover:text-white hover:text-3xl transition-all duration-200" />
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
                <GrAttachment className="text-2xl hover:text-white hover:text-3xl transition-all duration-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Attach File</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
          className="hidden"
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                onClick={() => setEmojiOpen(true)}
                ref={emojiRef}
              >
                <RiEmojiStickerLine className="text-2xl hover:text-white hover:text-3xl transition-all duration-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Emoji</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
        onClick={handleSendMsg}
        >
          <IoSend size={30} className='text-[#5201fe] hover:text-[#7A33FF]  text-2xl' />
        </button>

      </div>

      {emojiOpen && (
  <div className="absolute bottom-16 right-0"  ref={emojiRef}>
    <EmojiPicker theme='dark' open={emojiOpen} onEmojiClick={handleEmoji} autoFocusSearch={false} />
  </div>
)}


      <Dialog open={openModal} onOpenChange={setOpenModal} className="bg-[#5A00EE]">
        <DialogContent>
          <div id="location-map" className="h-96 w-full rounded-md " />
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setOpenModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleShareLocation}
              className="bg-[#5A00EE] hover:bg-[#7A33FF] text-white px-4 py-2 rounded"
            >
              Share Location
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageBar;