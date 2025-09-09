import React from "react";
import { ActionProviderInterface } from "../chatbot/ActionProvider";

interface VideoLinkWidgetProps {
  url: string;
  text: string;
  actionProvider: ActionProviderInterface;
}

const VideoLinkWidget: React.FC<VideoLinkWidgetProps> = ({ url, text }) => {
  return (
    <div className="video-link-widget my-3 max-w-xs">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 px-6 py-4 
                   bg-gradient-to-r from-red-500 to-red-600 
                   dark:from-red-600 dark:to-red-700
                   hover:from-red-600 hover:to-red-700 
                   dark:hover:from-red-700 dark:hover:to-red-800
                   text-white font-semibold text-sm
                   rounded-xl shadow-lg hover:shadow-xl
                   transform transition-all duration-300 ease-in-out
                   hover:scale-105 hover:-translate-y-0.5
                   border border-red-400/20 dark:border-red-500/30
                   backdrop-blur-sm
                   no-underline"
      >
        {/* Video Play Icon */}
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10  
                        bg-white/20 dark:bg-white/10 
                        rounded-full 
                        group-hover:bg-white/30 dark:group-hover:bg-white/20
                        transition-all duration-300">
          <svg 
            className="w-6 h-6 fill-current" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        
        {/* Text */}
        <span className="flex-1 text-left group-hover:text-red-50 transition-colors duration-300">
          {text}
        </span>
        
        {/* External Link Icon */}
        <div className="flex items-center justify-center w-10 h-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          <svg 
            className="w-full h-full fill-current" 
            viewBox="0 0 24 24"
          >
            <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
          </svg>
        </div>
      </a>
      
      {/* Optional subtitle/description */}
      {/* <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center px-2">
        <span className="inline-flex items-center gap-1">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
          </svg>
          Tap to watch video tutorial
        </span>
      </div> */}
    </div>
  );
};

export default VideoLinkWidget;
