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


// CONTRACEPTION TYPE SELECTION WIDGET


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


// EMERGENCY CONTRACEPTION WIDGETS


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


// PREVENTION DURATION SELECTION WIDGET


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


// METHOD SELECTION WIDGETS - Dynamic based on duration


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
      options={getMethodOptionsForDuration('Titi di ọdun kan')}
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
      options={getMethodOptionsForDuration('Odun kan si meji')}
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
      options={getMethodOptionsForDuration('Mẹta si mẹrin ọdun')}
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
      options={getMethodOptionsForDuration('Ọdun marun si mẹwa')}
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
      options={getMethodOptionsForDuration('Titilai')}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodOptionsSelection(option)
      }
    />
  ),
};

// Not sure - Category selection widget
export const notSureCategoryOptionsWidget = {
  widgetName: 'notSureCategoryOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={['3-10 years', '3 months', 'Flexible methods', 'Permanent methods']}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleStateSelection(option)
      }
    />
  ),
};


// ADDITIONAL ACTION WIDGETS


export const learnMoreMethodsWidget = {
  widgetName: 'learnMoreMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={['Beeni', 'Beeko']}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        if (option === 'Beeni') {
          props.actionProvider.handlePreventionDurationSelection(
            'Titi di ọdun kan',
          );
        } else {
          // Phase 3: Show flow end options instead of direct main menu
          const thankYouMsg = props.actionProvider.createChatBotMessage(
            "No problem! What would you like to do next?",
            { 
              delay: 300,
              widget: 'flowEndOptions'
            }
          );
          props.actionProvider.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, thankYouMsg]
          }));
        }
      }}
    />
  ),
};

// Phase 3: Flow End Options Widget for enhanced navigation
export const flowEndOptionsWidget = {
  widgetName: 'flowEndOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={[
        'Learn about other methods',
        'Find nearest clinic', 
        'Back to main menu',
        'End conversation'
      ]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        // Remove emoji and trim for cleaner processing
        const cleanOption = option.replace(/[\u{1F504}\u{1F4CD}\u{1F3E0}\u{2705}]/gu, '').trim();
        props.actionProvider.handleFlowEndOption(cleanOption);
      }}
    />
  ),
};

// Phase 3.3: Comparison Actions Widget
export const comparisonActionsWidget = {
  widgetName: 'comparisonActions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={[
        'Compare Now',
        'Clear Selection',
        'Add More Methods'
      ]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        const cleanOption = option.replace(/[\u{2705}\u{1F5D1}\u{FE0F}\u{2795}]/gu, '').trim();
        
        if (cleanOption === 'Compare Now') {
          props.actionProvider.handleCompareNow();
        } else if (cleanOption === 'Clear Selection') {
          props.actionProvider.handleClearComparison();
        } else if (cleanOption === 'Add More Methods') {
          // Show duration options to select more methods
          const addMoreMsg = props.actionProvider.createChatBotMessage(
            "Great! For how long do you want to prevent pregnancy?",
            { 
              delay: 300,
              widget: 'preventionDurationOptions'
            }
          );
          props.actionProvider.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, addMoreMsg]
          }));
        }
      }}
    />
  ),
};


// PRODUCT DETAIL WIDGETS (Task 5: Product Information Flow)


// Widget for "What do you want to learn about?" buttons after product description
export const productDetailOptionsWidget = {
  widgetName: 'productDetailOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={['Advantages and dis-', 'Who can(not) use it']}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => 
        props.actionProvider.handleProductDetailSelection(option)
      }
    />
  ),
};

// Widget for displaying advantages list
export const advantagesDisplayWidget = {
  widgetName: 'advantagesDisplay',
  widgetFunc: () => {
    // This is a display-only widget, advantages are shown in bot message
    return null;
  },
};

// Widget for displaying disadvantages list  
export const disadvantagesDisplayWidget = {
  widgetName: 'disadvantagesDisplay',
  widgetFunc: () => {
    // This is a display-only widget, disadvantages are shown in bot message
    return null;
  },
};

// Widget for displaying "Who can use" information
export const whoCanUseDisplayWidget = {
  widgetName: 'whoCanUseDisplay',
  widgetFunc: () => {
    // This is a display-only widget, info shown in bot message
    return null;
  },
};

// Widget for displaying "Who cannot use" information
export const whoCannotUseDisplayWidget = {
  widgetName: 'whoCannotUseDisplay',
  widgetFunc: () => {
    // This is a display-only widget, info shown in bot message
    return null;
  },
};

// Widget for video links display
export const videoLinksWidget = {
  widgetName: 'videoLinks',
  widgetFunc: () => {
    // This is a display-only widget, video links shown in bot message
    return null;
  },
};

// Widget for "Learn about other methods?" after product details
export const learnOtherMethodsWidget = {
  widgetName: 'learnOtherMethods',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={['Yes', 'No']}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => 
        props.actionProvider.handleLearnOtherMethods(option)
      }
    />
  ),
};


// MEDICAL CONDITIONS SCREENING WIDGET


export const medicalConditionsCheckWidget = {
  widgetName: 'medicalConditionsCheck',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    // Lazy-load simple OptionButtons to keep consistent UI
    <OptionButtons
      options={["Yes", "No", "I don't know"]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => props.actionProvider.handleMedicalConditionsResponse(option)}
    />
  ),
};


// EXPORT ALL PREVENT PREGNANCY WIDGETS


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
  notSureCategoryOptionsWidget, // NEW: Not sure category selection
  productDetailOptionsWidget, // Task 5: After product description
  advantagesDisplayWidget, // Task 5: Display advantages
  disadvantagesDisplayWidget, // Task 5: Display disadvantages
  whoCanUseDisplayWidget, // Task 5: Display who can use
  whoCannotUseDisplayWidget, // Task 5: Display who cannot use
  videoLinksWidget, // Task 5: Display video links
  learnOtherMethodsWidget, // Task 5: Continue learning prompt
  learnMoreMethodsWidget,
  flowEndOptionsWidget, // Phase 3.2: Navigation widget
  comparisonActionsWidget, // Phase 3.3: Comparison widget
  medicalConditionsCheckWidget, // NEW: medical screening after method details
];
