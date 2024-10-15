// SkeletonLoader.js
import React from 'react';
import './skeletonLoader.css'; // Add styles for the skeleton loader

const ChatSkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-message">
        <div className="skeleton-text"></div>
        <div className="skeleton-timestamp"></div>
      </div>
    </div>
  );
};

export default ChatSkeletonLoader;
