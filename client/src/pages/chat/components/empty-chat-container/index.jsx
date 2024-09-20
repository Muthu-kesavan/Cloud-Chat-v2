import Lottie from "react-lottie"
import { animationDefaultOptions } from "@/lib/utils"
const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
      <Lottie
      isClickToPauseDisabled={true}
      height={200}
      width={200}
      options={animationDefaultOptions}
       />
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lh: text-4xl transition-all duration-300 text-center">
        <h3>
          Welcome To 
          <span className="font-bold text-[#5A00EE]"> Cloud</span>-<span className="font-bold text-[#5A00EE]">Chat</span>
        </h3>

      </div>
      </div>
  )
}

export default EmptyChatContainer