import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, onlineStatus } =
    useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!selectedChatData) return null;

  const isOnline = onlineStatus[selectedChatData._id];
  const openModal = () => {
    if (selectedChatType === "contact") setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  };

  return (
    <div className="h-[10vh] border-b border-[#2f303b] flex items-center px-4 md:px-8 lg:px-20 bg-gray-900">
      <div className="flex gap-5 items-center w-full">
        {/* Back Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className="text-neutral-500 hover:text-white duration-300 transition-all"
                onClick={closeChat}
              >
                <IoMdArrowRoundBack className="text-3xl" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Profile Section */}
        <div className="flex gap-3 items-center">
          <div
            className={`w-12 h-12 relative ${
              selectedChatType === "contact" ? "cursor-pointer" : ""
            }`}
            onClick={openModal}
          >
            {selectedChatType === "contact" ? (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden relative">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={selectedChatData.image}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full ${getColor(
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
            {selectedChatType === "channel" && (
              <span className="text-lg font-semibold">{selectedChatData.name}</span>
            )}

            {selectedChatType === "contact" && (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium">
                  {selectedChatData.name
                    ? selectedChatData.name
                    : selectedChatData.email}
                </span>
                {isOnline && (
                  <span className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
            )}

            <div
              className={`text-sm ${
                isOnline ? "text-green-500" : "text-gray-500"
              }`}
            >
              {isOnline ? "Online" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={handleOutsideClick}
        >
          <div
            className="relative bg-gray-800 p-6 rounded-lg shadow-lg"
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
                    className={`uppercase h-64 w-64 text-6xl border flex items-center justify-center rounded-full ${getColor(
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