import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { IoMdArrowRoundBack } from "react-icons/io";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const UserHeader = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/chat');
  };

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center px-4 md:px-8 lg:px-20">
      <div className="flex gap-4 items-center w-full justify-between">
        <div className="flex gap-5 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className="text-neutral-500 hover:text-white duration-300 transition-all focus:outline-none"
                  onClick={handleClose}
                >
                  <IoMdArrowRoundBack className="text-3xl" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-none">
                <p>Back to Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-12 h-12 relative">
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {userInfo && userInfo.image ? (
                <AvatarImage
                  src={userInfo.image}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div className={`uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(userInfo ? userInfo.color : '')}`}>
                  {userInfo?.name?.charAt(0) || ''}
                </div>
              )}
            </Avatar>
          </div>

          {userInfo?.name && (
            <div className="text-2xl">
              {userInfo.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHeader;