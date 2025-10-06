import React from 'react';

const BotAvatar: React.FC = () => {
  return (
    <div
      style={{
        width: '65px',
        height: '65px',
        borderRadius: '50%',
        overflow: 'hidden', // This ensures the image stays within the rounded container
      }}
    >
      <img
        src="./Honey_profile_pic.png"
        alt="bot image"
        style={{
          width: '100%', // Ensure the image fills the container width
          height: '100%', // Ensure the image fills the container height
          objectFit: 'cover', // Maintain aspect ratio and cover the entire container
        }}
      />
    </div>
  );
};

export default BotAvatar;
