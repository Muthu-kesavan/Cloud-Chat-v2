import React, { useEffect } from 'react';
import ContactsContainer from '../chat/components/contacts-container';
import ExplorePost from './components/explorePost';
import { useAppStore } from '@/store';
import ChatContainer from '../chat/components/chat-container';

const Explore = () => {
  const { selectedChatType, fetchFeed } = useAppStore();

  useEffect(() => {
    const loadPosts = async () => {
      await fetchFeed();
    };

    loadPosts();
  }, [fetchFeed]);

  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      <ContactsContainer />
      {
        selectedChatType === undefined ? <ExplorePost /> : <ChatContainer />
      }
    </div>
  );
};

export default Explore;
