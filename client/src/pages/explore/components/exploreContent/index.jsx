import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store'; 
import { apiClient } from '@/lib/api-client';
import { GET_FEED } from '@/utils/constants';
import Post from '../post';

const ExploreContent = () => {
  const [posts, setPosts] = useState([]);
  const { userInfo } = useAppStore(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get(GET_FEED, {withCredentials: true});
        setPosts(response.data.feeds);
        console.log(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching posts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userInfo]);

  if (loading) return <div className='flex justify-center'>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className='col-span-2 border-x-2 border-t-slate-800 px-6'>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div post={post._id} className='p-2'>
            <Post post={post} userInfo={userInfo} />
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
