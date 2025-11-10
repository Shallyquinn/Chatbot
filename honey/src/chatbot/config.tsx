// src/chatbot/config.tsx
import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import OptionButtons from '../components/OptionButtons';
import ChatMessage from '../components/ChatMessage';
import { ActionProviderInterface } from '../chatbot/ActionProvider';
import { ChatbotState, ChatMessage as ChatMessageType } from './types';
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
import { apiService } from '../services/api';

// Define prop types for your custom message components
export interface MessageBoxProps {
  message?: string;
  state: ChatbotState;
  type: 'bot' | 'user';
  timestamp?: string; // ISO timestamp for message
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

// Synchronous localStorage loading with proper message restoration
const loadState = (): ChatbotState => {
  try {
    const saved = localStorage.getItem('chat_state');
    if (saved) {
      const parsedState = JSON.parse(saved);
      console.log('✅ Restored state from localStorage:', parsedState);
      // Ensure messages array exists and has proper structure
      if (parsedState.messages && Array.isArray(parsedState.messages)) {
        return parsedState;
      }
    }
    // Return fresh state only if no saved state exists
    console.log('ℹ️ No saved state found, starting fresh');
    return {
      messages: [],
      currentStep: 'language',
      greetingStep: 'initial_welcome',
    };
  } catch (error) {
    console.error('❌ Failed to load state from localStorage:', error);
    return {
      messages: [],
      currentStep: 'language',
      greetingStep: 'initial_welcome',
    };
  }
};

const initialState: ChatbotState = loadState();

// Server-first state loading function (to be called by ActionProvider)
export const loadStateFromServer = async (): Promise<ChatbotState | null> => {
  try {
    const sessionId = localStorage.getItem('chatbot_session_id');
    if (sessionId) {
      const serverState = await apiService.getUserSession(sessionId);
      if (serverState && serverState.chat_state) {
        const parsedState = JSON.parse(serverState.chat_state);
        // Update localStorage with server data as backup
        localStorage.setItem('chat_state', serverState.chat_state);
        return parsedState;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load state from server:', error);
    return null;
  }
};

const botName = 'Honey';

// Helper to convert saved messages to react-chatbot-kit format
const convertSavedMessages = (messages: ChatMessageType[]) => {
  return messages.map((msg, index) => ({
    ...msg,
    id: index, // Convert string ID to number for react-chatbot-kit
    loading: msg.loading || false,
    timestamp: msg.timestamp || new Date().toISOString(), // Ensure timestamp exists
  }));
};

const config = {
  // Use saved messages if they exist, otherwise show welcome messages
  initialMessages: initialState.messages.length > 0 
    ? convertSavedMessages(initialState.messages) // Convert and restore saved messages
    : [
        createChatBotMessage(`Hello, my name is ${botName}.`, {
          delay: 500,
        }),
        createChatBotMessage('Please choose the language you want to chat with.', {
          delay: 1000,
          widget: 'languageOptions',
        }),
      ].map(msg => ({ ...msg, timestamp: new Date().toISOString() })),
  botName: botName,
  initialState,
  customComponents: {
    botAvatar: () => <BotAvatar />,
    userAvatar: () => <></>,
    botMessageBox: (props: MessageBoxProps) => {
      // Find the message in state to get the timestamp
      const messageWithTimestamp = props.state.messages.find(
        (msg) => msg.message === props.message
      );
      return (
        <ChatMessage 
          {...props} 
          type="bot" 
          timestamp={messageWithTimestamp?.timestamp || new Date().toISOString()} 
        />
      );
    },
    userMessageBox: (props: MessageBoxProps) => {
      // Find the message in state to get the timestamp
      const messageWithTimestamp = props.state.messages.find(
        (msg) => msg.message === props.message && msg.type === 'user'
      );
      return (
        <ChatMessage 
          {...props} 
          type="user" 
          timestamp={messageWithTimestamp?.timestamp || new Date().toISOString()} 
        />
      );
    },
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
            props.actionProvider.handleLanguageSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'genderOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Male 👨", "Female 👩", "Prefer not to say"]}
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
          selectedState={props.state.selectedState || ''}
          actionProvider={props.actionProvider}
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
            "Below 18",
            "18-24 years",
            "25-34 years",
            "35-44 years",
            "45+ years",
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
          options={["Single", "Married", "Divorced", "Widowed", "In a relationship"]}
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
            'How to get pregnant',
            'How to prevent pregnancy',
            'How to improve sex life',
            'Change/stop current FPM',
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
    {
      widgetName: 'planningMethodOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            'How to get pregnant',
            'How to prevent pregnancy',
            'How to improve sex life',
            'Change/stop current FPM',
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
    // Phase 3.4: Resume Session Widget
    {
      widgetName: 'resumeOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['✅ Yes, Continue', '🔄 Start Fresh']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => {
            const resume = option.includes('Continue');
            props.actionProvider.handleResumeSession(resume);
          }}
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'sexEnhancementOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Gels and Lubricants", "Hard Erection"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.sexEnhancementActionProvider.handleSexEnhancementChoice(option)
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
          options={["Fiesta Intim Gel", "KY Jelly"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.sexEnhancementActionProvider.handleLubricantSelection(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'erectileDysfunctionOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Penegra', 'General information']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleErectileDysfunctionOptions(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'nextActionOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Ask another question', 'End conversation']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleNextAction(option)
          }
        />
      ),
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    },
    {
      widgetName: 'sexEnhancementNextActions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={['Chat with AI /Human', 'Learn other methods', 'Back to main menu']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.sexEnhancementActionProvider.handleSexEnhancementNextAction(option)
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
          options={['Human Agent', 'AI Chatbot']}
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
          options={['Yes', 'No']}
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
        widget.widgetFunc(props as MediaWidgetProps) || <></>,
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),

    // FPM Change/Stop widgets with proper IWidget structure
    ...fpmChangeStopWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as FPMWidgetProps) || <></>,
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),

    // Get Pregnant widgets with proper IWidget structure
    ...getPregnantWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as GetPregnantWidgetProps) || <></>,
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),

    // Prevent Pregnancy widgets with proper IWidget structure
    ...preventPregnancyWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as PreventPregnancyWidgetProps) || <></>,
      props: {},
      mapStateToProps: ['messages', 'currentStep'],
    })),
  ],
  
  // Validator to ensure all messages are accepted
  validator: () => {
    // Always return true to accept the message
    return true;
  },
};

export default config;

