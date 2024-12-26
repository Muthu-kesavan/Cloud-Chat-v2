import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

const ChatContainer = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-full bg-[#1c1d25] flex flex-col md:static md:flex-1 md:h-[100vh] transition-all duration-300 ease-in-out">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <MessageContainer />
      </div>
      <MessageBar />
    </div>
  );
};

export default ChatContainer;
