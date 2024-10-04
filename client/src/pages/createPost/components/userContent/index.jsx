import { useAppStore } from '@/store';
import React from 'react';
import Post from '@/pages/explore/components/post';

const UserContent = () => {
  const { userPosts, loading } = useAppStore();

  return (
    <div>
      <div className='col-span-2 border-x-2 border-t-slate-800 px-6'>
        {loading ? ( 
          <p>loading...</p>
        ) : userPosts.length > 0 ? (
          userPosts.map((userPost) => (
            <div key={userPost._id} className='p-2'>
              <Post post={userPost} /> 
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
};

export default UserContent;