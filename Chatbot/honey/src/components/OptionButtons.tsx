// src/components/OptionButtons.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ActionProviderInterface } from "../chatbot/ActionProvider";

export interface OptionButtonsProps {
  options: string[];
  actionProvider?: ActionProviderInterface;
  handleClick?: (option: string) => void;
}

const OptionButtons: React.FC<OptionButtonsProps> = ({
  options,
  handleClick,
}) => {
  return (
    <div className="flex !justify-start w-full">
      <div className="options-container">
        <div className="flex flex-col gap-2 mt-4">
          {options.map((option) => (
            <Button
              key={option}
              variant="secondary"
              className="rounded-full px-6 py-2 bg-white hover:bg-emerald-800 hover:text-white text-black font-normal border-none w-52 text-center"
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
