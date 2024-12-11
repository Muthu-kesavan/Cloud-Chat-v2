import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ExploreHeader = () => {
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
          
          <div className="text-2xl">
            Explore
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreHeader;