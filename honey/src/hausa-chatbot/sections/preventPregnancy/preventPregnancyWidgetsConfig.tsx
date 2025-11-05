// src/chatbot/sections/preventPregnancy/preventPregnancyWidgetsConfig.tsx

import React from 'react';
import OptionButtons from '../../../components/OptionButtons';
import { ActionProviderInterface } from '../../ActionProvider';
import { ChatbotState } from '../../types';
import {
  CONTRACEPTION_TYPE_OPTIONS,
  EMERGENCY_PRODUCT_OPTIONS,
  PREVENTION_DURATION_OPTIONS,
  METHOD_OPTIONS,
  getMethodOptionsForDuration,
} from './preventPregnancyTypes';

export interface PreventPregnancyWidgetProps {
  actionProvider: ActionProviderInterface;
  setState: (state: React.SetStateAction<ChatbotState>) => void;
  state: ChatbotState;
}

// =============================================================================
// CONTRACEPTION TYPE SELECTION WIDGET
// =============================================================================

export const contraceptionTypeOptionsWidget = {
  widgetName: 'contraceptionTypeOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={CONTRACEPTION_TYPE_OPTIONS}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleContraceptionTypeSelection(option)
      }
    />
  ),
};

// =============================================================================
// EMERGENCY CONTRACEPTION WIDGETS
// =============================================================================

export const emergencyProductOptionsWidget = {
  widgetName: 'emergencyProductOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={EMERGENCY_PRODUCT_OPTIONS}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleEmergencyProductSelection(option)
      }
    />
  ),
};

// =============================================================================
// PREVENTION DURATION SELECTION WIDGET
// =============================================================================

export const preventionDurationOptionsWidget = {
  widgetName: 'preventionDurationOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={PREVENTION_DURATION_OPTIONS}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handlePreventionDurationSelection(option)
      }
    />
  ),
};

// =============================================================================
// METHOD SELECTION WIDGETS - Dynamic based on duration
// =============================================================================

export const MethodOptionsWidget = {
  widgetName: 'methodOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={METHOD_OPTIONS}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// Short-term methods (Up to 1 year)
export const shortTermMethodsWidget = {
  widgetName: 'shortTermMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={getMethodOptionsForDuration('Har zuwa shekara 1')}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// Medium-term methods (1-2 years)
export const mediumTermMethodsWidget = {
  widgetName: 'mediumTermMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={getMethodOptionsForDuration('Shekara 1 zuwa 2",')}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// Long-term methods (3-4 years)
export const longTermMethodsWidget = {
  widgetName: 'longTermMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={getMethodOptionsForDuration('Shekara 3 zuwa 4",')}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// Extended long-term methods (5-10 years)
export const extendedLongTermMethodsWidget = {
  widgetName: 'extendedLongTermMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={getMethodOptionsForDuration('Shekara 5 zuwa 10",')}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// Permanent methods
export const permanentMethodsWidget = {
  widgetName: 'permanentMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={getMethodOptionsForDuration('Na dindindin')}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// =============================================================================
// ADDITIONAL ACTION WIDGETS
// =============================================================================

export const learnMoreMethodsWidget = {
  widgetName: 'learnMoreMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={['Ee', "A'a"]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        if (option === 'Ee') {
          props.actionProvider.handlePreventionDurationSelection(
            'Har zuwa shekara 1',
          );
        } else {
          props.actionProvider.handleNextAction('Koma zuwa babban menu');
        }
      }}
    />
  ),
};

// =============================================================================
// EXPORT ALL PREVENT PREGNANCY WIDGETS
// =============================================================================

export const preventPregnancyWidgets = [
  contraceptionTypeOptionsWidget,
  emergencyProductOptionsWidget,
  preventionDurationOptionsWidget,
  MethodOptionsWidget,
  shortTermMethodsWidget,
  mediumTermMethodsWidget,
  longTermMethodsWidget,
  extendedLongTermMethodsWidget,
  permanentMethodsWidget,
  learnMoreMethodsWidget,
];
