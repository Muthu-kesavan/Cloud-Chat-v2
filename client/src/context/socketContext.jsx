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
  const { userInfo, setUserOnlineStatus } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to Socket Server");
        socket.current.emit("user-online",{userId: userInfo.id});
      });

      socket.current.on("update-online-status", (data) => {
        const userId = data.userId.userId || data.userId; 
        const isOnline = data.isOnline;
        console.log("Received update for userId:", userId, "isOnline:", isOnline);
        setUserOnlineStatus({ userId, isOnline });
      });
      
      const handleRecieveMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage, addContactsInDMContacts, addNotification } = useAppStore.getState();

        const isChatOpen = selectedChatType !== undefined && 
                           (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id);

        if (isChatOpen) {
          addMessage(message);
        } else {
          addNotification({
            id: message.id,
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
        if (channelId) {
          deleteChannelMessage(messageId, channelId); 
        } else {
          deleteMessage(messageId); 
        }
      };
      

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);
      socket.current.on("messageDeleted", handleDeleteMessage); 

      window.addEventListener("beforeunload", ()=> {
        socket.current.emit("user-offline", userInfo.id);
        socket.current.disconnect();
      })
      return () => {
        socket.current.off("recieveMessage", handleRecieveMessage);
        socket.current.off("messageDeleted", handleDeleteMessage);
        socket.current.off("recieve-channel-message", handleRecieveChannelMessage);
        socket.current.off("update-online-status");

        window.removeEventListener("beforeunload", ()=> {
          socket.current.emit("user-offline", userInfo.id);
        });

        socket.current.disconnect();
      };
    }
  }, [userInfo, setUserOnlineStatus]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};