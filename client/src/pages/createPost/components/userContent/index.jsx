import { useAppStore } from '@/store';
import React from 'react';
import Post from '@/pages/explore/components/post';
import SkeletonLoader from '@/loaders/SkeletonLoader';
const UserContent = () => {
  const { userPosts, loading } = useAppStore();

  return (
    <div>
      <div className='col-span-2 border-x-2 border-t-slate-800 px-6'>
        {loading ? ( 
          <SkeletonLoader />
        ) : userPosts.length > 0 ? (
          userPosts.map((userPost) => (
            <div key={userPost._id} className='p-2'>
              <Post post={userPost} /> 
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center text-center text-lg h-full">
            " Be the first to share your thoughts and start the conversation! "
          </div>
        )}
      </div>
    </div>
  );
};

export default UserContent;