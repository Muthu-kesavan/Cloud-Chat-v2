import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store'; 
import { apiClient } from '@/lib/api-client';
import { GET_FEED, GET_SAVED_POSTS } from '@/utils/constants';
import Post from '../post';

const ExploreContent = () => {
  const [posts, setPosts] = useState([]);
  const { userInfo } = useAppStore(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch the posts (feeds)
        const response = await apiClient.get(GET_FEED, { withCredentials: true });
        const feeds = response.data.feeds || [];
        console.log('Fetched posts:', feeds);
  
        // Fetch saved posts for the user
        const savedResponse = await apiClient.get(GET_SAVED_POSTS, { withCredentials: true });
        const savedPosts = savedResponse.data.savedPosts || [];
  
        // Map over feeds and set the saved state
        const postsWithSavedStatus = feeds.map(post => ({
          ...post,
          isSaved: savedPosts.some(savedPost => savedPost._id === post._id) // Check if the post is saved
        }));
  
        setPosts(postsWithSavedStatus);
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
  if (error) return <div>Error: {error.message || 'An error occurred'}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className='col-span-2 border-x-2 border-t-slate-800 px-6'>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className='p-2'>
              <Post post={post} setData={setPosts} />
            </div>
          ))
        ) : (
          <p>No post available</p>
        )}
      </div>
    </div>
  );
};

export default ExploreContent;
