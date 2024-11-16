import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { RiCloseFill } from "react-icons/ri";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, onlineStatus } =useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure selectedChatData exists
  if (!selectedChatData) {
    return null;
  }

  console.log("Online Status:", onlineStatus);
  console.log("Selected User ID:", selectedChatData._id);
  const isOnline = onlineStatus[selectedChatData._id];
  console.log("Is Online", isOnline);

  const openModal = () => {
    if (selectedChatType === "contact") {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      closeModal();
    }
  };

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div
            className={`w-12 h-12 relative ${
              selectedChatType === "contact" ? "cursor-pointer" : ""
            }`}
            onClick={openModal}
          >
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden relative">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={selectedChatData.image}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color
                    )}`}
                  >
                    {selectedChatData.name
                      ? selectedChatData.name.charAt(0)
                      : selectedChatData.email.charAt(0)}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name}

            {selectedChatType === "contact" && (
              <div className="flex items-center space-x-1">
                <span>
                  {selectedChatData.name
                    ? selectedChatData.name
                    : selectedChatData.email}
                </span>

                {isOnline && (
                  <span className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
            )}

            <div className={`text-sm ${isOnline ? "text-green-500" : ""}`}>
              {isOnline ? "Online" : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                  onClick={closeChat}
                >
                  <RiCloseFill className="text-3xl" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-none">
                <p>Close Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={handleOutsideClick}
        >
          <div
            className="relative bg-transparent p-0 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center">
              {selectedChatData.image ? (
                <img
                  src={selectedChatData.image}
                  alt="Profile Pic"
                  className="w-64 h-64 rounded-full object-cover"
                />
              ) : (
                selectedChatType === "contact" && (
                  <div
                    className={`uppercase h-64 w-64 text-6xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color
                    )}`}
                  >
                    {selectedChatData.name
                      ? selectedChatData.name.charAt(0)
                      : selectedChatData.email.charAt(0)}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
