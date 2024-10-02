import React from 'react'
import ContactsContainer from '@/pages/chat/components/contacts-container';
import { useAppStore } from '@/store';
import UserPost from './components/userPost';
import ChatContainer from '../chat/components/chat-container';
const CreatePost = () => {
  const {selectedChatType, getUserPost} = useAppStore();
  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      <ContactsContainer />
      {
        selectedChatType === undefined ? <UserPost /> : <ChatContainer />
      }
    </div>
  )
}

export default CreatePost