import React from 'react';
import { ActionProviderInterface } from '../chatbot/ActionProvider';
import { getProductImage } from '../assets/productImages';

interface ImageWidgetProps {
  src: string;
  alt: string;
  actionProvider: ActionProviderInterface;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ src, alt }) => {
  const imageSrc = getProductImage(src) || src;

  return (
    <div className="image-widget max-w-[250px] bg-white p-1 rounded-lg shadow-sm my-2">
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-auto rounded-md object-cover"
        onError={(e) => {
          // Fallback handling if image fails to load
          const img = e.currentTarget as HTMLImageElement;
          img.src = '/placeholder-image.png'; // You can add a placeholder image
          console.warn(`Failed to load image: ${imageSrc}`);
        }}
      />
      <div className="text-xs text-gray-500 mt-1 text-right pr-2">{alt}</div>
    </div>
  );
};

export default ImageWidget;
