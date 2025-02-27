import React from 'react';
import { ActionProviderInterface } from '../chatbot/ActionProvider';

interface AudioWidgetProps {
  src: string;
  actionProvider: ActionProviderInterface;
}

const AudioWidget: React.FC<AudioWidgetProps> = ({ src }) => {
  return (
    <div className="audio-widget">
      <audio controls>
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioWidget;