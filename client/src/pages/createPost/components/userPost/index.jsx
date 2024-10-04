import React from 'react'
import UserHeader from '../userHeader'
import { useAppStore } from '@/store'
import MainPost from '../mainPost';
const UserPost = () => {
  const {loading, error} = useAppStore();
  return (
    <div className="fixed top-0 left-0 h-screen w-full bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <UserHeader />
      <div className="flex-1 overflow-y-auto">
        {loading && <p>loading posts...</p>}
        {error && <p>Error: {error}</p>}
        <MainPost />
      </div>
    </div>
  );
}

export default UserPost