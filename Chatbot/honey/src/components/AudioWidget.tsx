import React from "react";
import { ActionProviderInterface } from "../chatbot/ActionProvider";
import { getProductAudio, productAudios } from "@/assets/productAudios";

interface AudioWidgetProps {
  src: string;
  actionProvider: ActionProviderInterface;
}

const AudioWidget: React.FC<AudioWidgetProps> = ({ src }) => {
  const audioSrc =
    getProductAudio(src) ||
    productAudios[src as keyof typeof productAudios] ||
    src;
  return (
    <div className="audio-widget bg-white rounded-lg p-2 shadow-sm my-3 w-[400px]">
      <div className="flex items-center gap-3">
        {/*Audio Icon*/}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full p-2.5 mr-2 dark:from-emerald-700 dark:to-emerald-800 flex-shrink-0 shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        {/* Audio Player */}
        <div className="flex-1 min-w-0">
          <audio
            controls
            className="w-full h-8 rounded-md"
            preload="metadata"
            onError={(e) => {
              console.warn(`Failed to load audio: ${audioSrc}`);
              const audio = e.currentTarget as HTMLAudioElement;
              // You could show an error message or fallback here
            }}
          >
            <source src={audioSrc} type="audio/mpeg" />
            <source src={audioSrc} type="audio/wav" />
            <source src={audioSrc} type="audio/ogg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      {/* Optional audio info */}
      {/* <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 items-start">
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
        </svg>
        <span>Audio in Pidgin English</span>
      </div> */}
    </div>
  );
};

export default AudioWidget;
