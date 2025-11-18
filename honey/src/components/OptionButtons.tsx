// src/components/OptionButtons.jsx
import React from 'react';
import { Button } from '@/components/ui/button';

export interface OptionButtonsProps {
  options: string[];
  actionProvider?: any; // Generic to support all chatbot variants
  handleClick?: (option: string) => void;
}

const OptionButtons: React.FC<OptionButtonsProps> = ({
  options,
  handleClick,
}) => {
  return (
    <div className="flex !justify-start w-full pl-2">
      <div className="options-container">
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <Button
              key={option}
              variant="secondary"
              className="rounded-[15px] px-6 py-2 bg-white hover:bg-emerald-800 hover:text-white text-black font-normal border-none w-[200px] max-w-full text-center"
              onClick={() => handleClick?.(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptionButtons;
