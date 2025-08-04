import React from 'react';
import { ActionProviderInterface } from '../chatbot/ActionProvider';

interface ImageWidgetProps {
  src: string;
  alt: string;
  actionProvider: ActionProviderInterface;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ src, alt }) => {
  return (
    <div className="image-widget">
      <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default ImageWidget;