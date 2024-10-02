import { useAppStore } from '@/store';
import React, { useEffect } from 'react';
import Post from '@/pages/explore/components/post';

const UserContent = () => {
  const { userInfo, getUserPost, userPosts, loading, error } = useAppStore();

  
  useEffect(() => {
    getUserPost();
  }, [getUserPost]);

  return (
    <div>
      <div className='col-span-2 border-x-2 border-t-slate-800 px-6'>
        {loading ? ( 
          <p>loading...</p>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post._id} className='p-2'>
              <Post post={post} /> 
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
