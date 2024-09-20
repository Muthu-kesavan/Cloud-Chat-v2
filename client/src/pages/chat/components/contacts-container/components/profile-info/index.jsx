import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { HOST, LOGOUT } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoPowerSharp } from "react-icons/io5";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false); 

  const logOut = async () => {
    try {
      const res = await apiClient.post(LOGOUT, {}, { withCredentials: true });
      if (res.status === 200) {
        navigate('/auth');
        setUserInfo(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

 
  const getInitials = () => {
    if (userInfo && userInfo.name) {
      return userInfo.name.charAt(0).toUpperCase(); 
    } else if (userInfo && userInfo.email) {
      return userInfo.email.charAt(0).toUpperCase(); 
    }
    return ''; 
  };

  const handleLogoutClick = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

 
  const handleConfirmLogout = () => {
    logOut();
    closeModal();
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#5A00EE]">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {
              userInfo && userInfo.image ? (
                <AvatarImage 
                  src={`${HOST}/${userInfo.image}`} 
                  alt="Profile" 
                  className="object-cover w-full h-full bg-black" 
                />
              ) : (
                <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(userInfo ? userInfo.color : '')}`}>
                  {getInitials()}
                </div>
              )
            }
          </Avatar>
        </div>
        <div>
          {userInfo && userInfo.name ? `${userInfo.name}` : ""}
        </div>
      </div>

      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2 
                className="text-white text-xl font-medium" 
                onClick={() => navigate('/profile')} 
              />
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp 
                className="text-red-500 text-xl font-medium" 
                onClick={handleLogoutClick} 
              />
            </TooltipTrigger>
            <TooltipContent className="border-none">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div className=" bg-[#5201fe] rounded-lg p-6 shadow-lg max-w-md w-full">
      <h3 className=" text-center text-lg font-bold color">Are you sure you want to log out?</h3>
      <div className="flex justify-center mt-4 gap-3">
        <button
          onClick={closeModal}
          className=" flex items-center bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Log out
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ProfileInfo;
