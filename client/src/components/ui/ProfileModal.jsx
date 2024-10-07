import React from 'react';
import { getColor } from '@/lib/utils';
import { HOST } from '@/utils/constants';

const ProfileModal = ({ userData, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-black bg-opacity-90">
      <div className="bg-transparent p-8 rounded-lg relative">
        <button onClick={onClose} className="absolute text-xl cursor-pointer">
          &times;
        </button>
        <div className="flex items-center justify-center">
          {userData.image ? (
            <img
              src={`${HOST}/${userData.image}`} 
              alt="Profile Pic"
              className="w-64 h-64 rounded-full bg-transparent"
            />
          ) : (
            <div
              className={`h-64 w-64 flex items-center justify-center rounded-full ${getColor(userData.color)}`}
            >
              <span className="text-6xl text-white">
                {userData.name ? userData.name.charAt(0) : userData.email.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
