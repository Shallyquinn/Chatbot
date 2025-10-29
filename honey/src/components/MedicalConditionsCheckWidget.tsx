import React from 'react';
import OptionButtons from './OptionButtons';
import { WidgetProps } from '../chatbot/config';

const MedicalConditionsCheckWidget: React.FC<WidgetProps> = ({ actionProvider }) => {
  return (
    <OptionButtons
      options={["Yes", "No", "I don't know"]}
      actionProvider={actionProvider}
      handleClick={(option: string) => actionProvider.handleMedicalConditionsResponse(option)}
    />
  );
};

export default MedicalConditionsCheckWidget;
