import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
const UserHeader = () => {
  const {userInfo} = useAppStore();
  const navigate = useNavigate();
  const handleClose=()=>{
    navigate('/chat');
  };
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className='text-2xl'>
            {userInfo.name}
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                  onClick={handleClose}
                >
                  <RiCloseFill className="text-3xl" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-none">
                <p>Close </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default UserHeader