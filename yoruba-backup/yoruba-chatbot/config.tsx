// src/chatbot/config.tsx
import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import OptionButtons from '../components/OptionButtons';
import ChatMessage from '../components/ChatMessage';
import { ActionProviderInterface } from '../chatbot/ActionProvider';
import { ChatbotState } from './types';
import {
  fpmChangeStopWidgets,
  FPMWidgetProps,
} from './sections/changeFPM/fpmWidgetsConfig';
import BotAvatar from '../components/botAvatar/index';
import { mediaWidgets } from '../components/mediaWidgetsConfig';
import StateSearchWidget from '../components/StateSearchWidget';
import LGASearchWidget from '../components/LGASearchWidget';
import { getAllStates } from '../data/nigerianStates';
import {
  getPregnantWidgets,
  GetPregnantWidgetProps,
} from './sections/getPregnant/getPregnantConfig';
import {
  preventPregnancyWidgets,
  PreventPregnancyWidgetProps,
} from './sections/preventPregnancy/preventPregnancyWidgetsConfig';

// Define prop types for your custom message components
export interface MessageBoxProps {
  message?: string;
  state: ChatbotState;
  type: 'bot' | 'user';
}

export interface AvatarProps {
  style?: React.CSSProperties;
  className?: string;
}

export interface WidgetProps {
  actionProvider: ActionProviderInterface;
  setState: (state: React.SetStateAction<ChatbotState>) => void;
  state: ChatbotState;
}

export interface MediaWidgetProps {
  actionProvider: ActionProviderInterface;
  src?: string;
  alt?: string;
}

const initialState: ChatbotState = {
  messages: [],
  currentStep: 'language',
};

const botName = 'Honey';

const config = {
  initialMessages: [
    createChatBotMessage(`Hello, my name is ${botName}.`, {
      delay: 500,
    }),
    createChatBotMessage('Please choose the language you want to chat with.', {
      delay: 1000,
      widget: 'languageOptions',
    }),
  ],
  botName: botName,
  initialState,
  customComponents: {
    botAvatar: () => <BotAvatar />,
    userAvatar: () => <></>,
    botMessageBox: (props: MessageBoxProps) => (
      <ChatMessage {...props} type="bot" />
    ),
    userMessageBox: (props: MessageBoxProps) => (
      <ChatMessage {...props} type="user" />
    ),
  },
  customStyles: {
    botMessageBox: {
      backgroundColor: '#e0e0e0',
    },
    chatButton: {
      backgroundColor: '#FFA500',
    },
  },

  // FIXED: Widgets configuration with proper IWidget interface structure
  widgets: [
    {
      widgetName: 'languageOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['English', 'Hausa', 'Yoruba']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider?.handleLanguageSelection(option)
          }
        />
      ),
      // props for IWidget interface
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'genderOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Ọkùnrin 👨', 'Obìnrin 👩', 'Kò wù yín láti sọ ọ']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleGenderSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'stateOptions',
      widgetFunc: (props: WidgetProps) => (
        <StateSearchWidget
          states={getAllStates()}
          actionProvider={props.actionProvider}
          onStateSelect={(state: string) =>
            props.actionProvider.handleStateSelection(state)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'lgaOptions',
      widgetFunc: (props: WidgetProps) => (
        <LGASearchWidget
          actionProvider={props.actionProvider}
          selectedState={props.state.selectedState || ''}
          onLGASelect={(lga: string) =>
            props.actionProvider.handleLGASelection(lga)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep', 'selectedState'],
    },
    {
      widgetName: 'ageOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            'Below 18',
            '18-24 years',
            '25-34 years',
            '35-44 years',
            '45+ years',
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleAgeSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'maritalStatusOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Wundia', 'Abileko ', 'Ikọsilẹ', 'Opo', ' Ninu ibatan kan']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleMaritalStatusSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'fpmOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            ' Bí a ṣe le loyún',
            'Bí a ṣe lè dènà oyún',
            'Bí ìbálòpọ̀ ṣe lè dùn síi',
            'Yí / dá ìlànà dúró.',
            'Ask a general question',
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handlePlanningMethodSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    // =============================================================================
    // FIXED: SEX LIFE IMPROVEMENT WIDGETS - COMPLETE FLOW
    // =============================================================================
    {
      widgetName: 'sexEnhancementOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Gels and Lubricants', 'Hard Erection']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleSexEnhancementOptions(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'lubricantOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Fiesta Intim Gel', 'KY Jelly']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleLubricantOptions(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    // NEW: Erectile dysfunction options widget
    {
      widgetName: 'erectileDysfunctionOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            'Lifestyle changes',
            'Natural remedies',
            'When to see a doctor',
            'Get professional help',
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleErectileDysfunctionOptions(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    // FIXED: Sex enhancement next action options - unified widget name
    {
      widgetName: 'sexEnhancementNextActionOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            'Wiregbe pẹlu AI / Eniyan',
            'Kọ nípa àwọn ìlànà miiran',
            'Pada  si Ibere',
            'Gba awọn imọran igbesi aye ibalopo diẹ sii',
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleSexEnhancementNextAction(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    // DEPRECATED: Keep for backward compatibility
    {
      widgetName: 'nextActionOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            'Wiregbe pẹlu AI / Eniyan',
            'Kọ ẹkọ awọn ọna miiran',
            'Pada  si Ibere',
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleSexEnhancementNextAction(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'agentTypeOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Human Agent', 'AI Agent']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleAgentTypeSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'moreHelpOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Beeni', 'Beeko']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleMoreHelpOptions(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },

    // Media widgets with proper IWidget structure
    ...mediaWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as MediaWidgetProps),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),

    // FPM Change/Stop widgets with proper IWidget structure
    ...fpmChangeStopWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as FPMWidgetProps),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),

    // Get Pregnant widgets with proper IWidget structure
    ...getPregnantWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as GetPregnantWidgetProps),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),

    // Prevent Pregnancy widgets with proper IWidget structure
    ...preventPregnancyWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as PreventPregnancyWidgetProps),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),
  ],
};

export default config;
