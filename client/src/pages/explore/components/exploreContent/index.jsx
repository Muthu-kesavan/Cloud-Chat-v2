import React from 'react';
import { useAppStore } from '@/store'; 
import SkeletonLoader from '@/loaders/SkeletonLoader';
import Post from '../post';

const ExploreContent = () => {
  const { posts, loading, error } = useAppStore(); 
  if (error) {
    return <p>Error fetching posts: {error.message}</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className='col-span-2 border-x-2 border-t-slate-800 px-6'>
        {loading ? ( 
          <SkeletonLoader />

        ) : posts.length > 0 ? (
          posts.map((post) => (
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

export default ExploreContent;