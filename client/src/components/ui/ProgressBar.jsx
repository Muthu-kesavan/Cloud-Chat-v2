import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="relative w-full h-2 bg-gray-300 rounded">
      <div
        className="absolute h-full bg-[#5A00EE] rounded"
        style={{ width: `${progress}%`, transition: 'width 0.2s ease' }}
      />
    </div>
  );
};

export default ProgressBar;
