import React from 'react';
import { ActionProviderInterface } from '../chatbot/ActionProvider';

interface VideoLinkWidgetProps {
  url: string;
  text: string;
  actionProvider: ActionProviderInterface;
}

const VideoLinkWidget: React.FC<VideoLinkWidgetProps> = ({ url, text }) => {
  return (
    <div className="video-link-widget">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#FFA500',
          color: 'black',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}
      >
        {text}
      </a>
    </div>
  );
};

export default VideoLinkWidget;