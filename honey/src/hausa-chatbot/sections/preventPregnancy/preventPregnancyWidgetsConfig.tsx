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
      options={getMethodOptionsForDuration('Shekara 1 zuwa 2')}
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
      options={getMethodOptionsForDuration('Shekara 3 zuwa 4')}
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
      options={getMethodOptionsForDuration('Shekara 5 zuwa 10')}
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

// Not sure - Category selection widget
export const notSureCategoryOptionsWidget = {
  widgetName: 'notSureCategoryOptions',
  widgetFunc: (props: PreventPregnancyWidgetProps) => (
    <OptionButtons
      options={['Shekara 3-10', 'Watanni 3', 'Hanyoyin sassauƙa', 'Hanyoyi na dindindin']}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        // Map category back to duration for existing handler
        const durationMap: Record<string, string> = {
          'Shekara 3-10': 'Shekara 3 zuwa 4',
          'Watanni 3': 'Har zuwa shekara 1',
          'Hanyoyin sassauƙa': 'Shekara 1 zuwa 2',
          'Hanyoyi na dindindin': 'Na dindindin',
        };
        props.actionProvider.handlePreventionDurationSelection(durationMap[option] || option);
      }}
    />
  ),
};



// ADDITIONAL ACTION WIDGETS



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
          // Just handle as main menu navigation
          props.actionProvider.handlePreventionDurationSelection('Har zuwa shekara 1');
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
        '🔄 Learn about other methods',
        '📍 Find nearest clinic', 
        '🏠 Back to main menu',
        '✅ End conversation'
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
        'Kwatanta Yanzu',
        'Share Zaɓi',
        'Ƙara Hanyoyi'
      ]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        // Simplified handling without emoji regex issues
        if (option.includes('Kwatanta') || option.includes('Yanzu')) {
          // Compare now - use available handler
          props.actionProvider.handleMethodOptionsSelection(option);
        } else if (option.includes('Share') || option.includes('Zaɓi')) {
          // Clear selection - use available handler
          props.actionProvider.handleMethodOptionsSelection(option);
        } else {
          // Add more methods - navigate to duration selection
          props.actionProvider.handlePreventionDurationSelection('Har zuwa shekara 1');
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
