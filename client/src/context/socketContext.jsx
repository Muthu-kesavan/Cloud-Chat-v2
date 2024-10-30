import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to Socket Server");
      });

      const handleRecieveMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage, addContactsInDMContacts, addNotification } = useAppStore.getState();

        const isChatOpen = selectedChatType !== undefined && 
                           (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id);

        if (isChatOpen) {
          addMessage(message);
        } else {
          // Add a notification if chat is not open
          addNotification({
            id: message._id,
            content: message.content,
            sender: message.sender,
            timestamp: new Date(),
          });
        }
        addContactsInDMContacts(message);
      };



      const handleRecieveChannelMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage, addChannelInChannelList, addNotification } = useAppStore.getState();
        
        const isChatOpen = selectedChatType !== undefined && selectedChatData._id === message.channelId;

        if (isChatOpen) {
          addMessage(message);
        } else {
          // Add a notification for channel message if chat is not open
          addNotification({
            id: message._id,
            content: message.content,
            channelId: message.channelId,
            timestamp: new Date(),
          });
        }
        addChannelInChannelList(message);
      };
      const handleDeleteMessage = ({ messageId, channelId }) => {
        const { deleteMessage, deleteChannelMessage } = useAppStore();
        
        // Check if the message belongs to a channel
        if (channelId) {
          deleteChannelMessage(messageId, channelId); // Remove message from the channel and store
        } else {
          deleteMessage(messageId); // Remove message from the store
        }
      };

      const handleUserTyping = ({ senderId }) => {
        const { setTypingStatus } = useAppStore();
        setTypingStatus({ userId: senderId, isTyping: true });
      };

      const handleUserStopTyping = ({ senderId }) => {
        const { setTypingStatus } = useAppStore();
        setTypingStatus({ userId: senderId, isTyping: false });
      };

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);
      socket.current.on("messageDeleted", handleDeleteMessage); // Listen for message deletion
      socket.current.on("userTyping", handleUserTyping);
      socket.current.on("userStopTyping", handleUserStopTyping);
      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};