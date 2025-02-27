// src/components/OptionButtons.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { ActionProviderInterface } from '../chatbot/ActionProvider';

export interface OptionButtonsProps {
  options: string[];
  actionProvider?: ActionProviderInterface;
  handleClick?: (option: string) => void;
}

const OptionButtons: React.FC<OptionButtonsProps>  = ({ options, handleClick }) => {
  return (
    <div className="flex flex-row justify-items-start gap-2 mt-4 grid-cols-4 w-80%">
      {options.map((option) => (
        <Button
          key={option}
          variant="primary"
          className="w-fit text-left justify-start item bg-amber-200 hover:bg-orange-400"
          onClick={() =>handleClick?.(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default OptionButtons;