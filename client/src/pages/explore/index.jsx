import React from 'react'
import ContactsContainer from '../chat/components/contacts-container'
import ExplorePost from './components/explorePost'
import { useAppStore } from '@/store'
import ChatContainer from '../chat/components/chat-container'

const Explore = () => {
  const {selectedChatType, userInfo}  = useAppStore();
  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      <ContactsContainer/>
      {
      selectedChatType === undefined ? <ExplorePost /> : <ChatContainer />
    }
    </div>
  )
}

export default Explore