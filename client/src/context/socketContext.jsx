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
        const { selectedChatType, selectedChatData, addMessage, addContactsInDMContacts } = useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }
        addContactsInDMContacts(message);
      };

      const handleRecieveChannelMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage, addChannelInChannelList } = useAppStore.getState();
        if (selectedChatType !== undefined && selectedChatData._id === message.channelId) {
          addMessage(message);
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

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);
      socket.current.on("messageDeleted", handleDeleteMessage); // Listen for message deletion

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