import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import OptionButtons, { OptionButtonsProps } from '../components/OptionButtons';
import ChatMessage from '../components/ChatMessage';
import { ActionProviderInterface } from "../chatbot/ActionProvider";
import { ChatbotState } from './types';
import AudioWidget from '../components/AudioWidget';
import ImageWidget from '../components/ImageWidget';
import VideoLinkWidget from '../components/VideoLinkWidget';

// Define prop types for your custom message components
export interface MessageBoxProps {
  message?: string; // Marked optional since the chatbot system may supply it
  type: "bot" | "user";
  // Allow additional properties

}

export interface WidgetProps extends OptionButtonsProps {
  actionProvider: ActionProviderInterface;
}

export interface MediaWidgetProps {
  actionProvider: ActionProviderInterface;
  src?: string;
  alt?: string;
}

const initialState: ChatbotState = {
  messages: [],
  currentStep: "language",
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
  // Add initial state
  initialState,
  customComponents: {
    // Custom message components
    botMessageBox: (props: MessageBoxProps) => <ChatMessage {...props} type="bot" />,
    userMessageBox: (props: MessageBoxProps) => <ChatMessage {...props} type="user" />,
  },
  customStyles: {
    // Override default styles
    botMessageBox: {
        backgroundColor: '#FFA500',
        // color: 'white',
    },
    chatButton: {
        backgroundColor: '#FFA500',
    },
  },
  widgets: [
    {
      widgetName: 'languageOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons 
          // {...props} 
          options={['English', 'Hausa', 'Yoruba']}
          actionProvider={props.actionProvider}
          // Add a handler prop
          handleClick={(option: string) => props.actionProvider?.handleLanguageSelection(option)}
         />
      ),
    },
    {
      widgetName: 'genderOptions',
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          // {...props}
          options={['Male 👨', 'Female 👩', 'Prefer not to say']}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleGenderSelection(option)}
        />
      ),
    },

    {
      widgetName: "locationOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons 
          // {...props} 
          options={["Gbako", "Ifo", "Abak", "Ibeno", "Ika", "None of the above"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleLocationConfirmation(option)}
        />
      ),
    },
    {
      widgetName: "ageOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons 
          // {...props} 
          options={["< 25", "26-35", "36-45", "46-55", "55 and older"]} 
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleAgeSelection(option)}
        />
      ),
    },
    {
      widgetName: "maritalOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons 
          // {...props} 
          options={["Single", "In a relationship", "Married", "Prefer not to say"]} 
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleMaritalStatusSelection(option)}
        />
      ),
    },
    {
      widgetName: "fpmOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          // {...props}
          options={[
            "How to get pregnant",
            "How to prevent pregnancy",
            "How to improve sex life",
            "Change/stop current FPM",
            "Ask a general question",
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handlePlanningMethodSelection(option)}
        />
      ),
    },
    {
      widgetName: "contraceptionOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons 
          // {...props} 
          options={["Emergency", "Prevent in future"]} 
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleContraceptionTypeSelection(option)}
        />
      ),
    },
    {
      widgetName: "emergencyProductOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons 
          // {...props} 
          options={["Postpill", "Postinor-2"]} 
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleContraceptionProductSelection(option)}
        />
      ),
    },
    {
      widgetName: "durationOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          // {...props}
          options={["Up to 1 year", "1-2 years", "3-4 years", "5-10 years", "Permanently"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handlePreventionDurationSelection(option)}
        />
      ),
    },
    {
      widgetName: "methodOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          // {...props}
          options={["Daily pills", "Injectables", "Implants", "Emergency pills"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleMethodOptionsSelection(option)}
        />
      ),
    },
    // New widgets for sex life improvement path
    {
      widgetName: "sexEnhancementOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Gels and Lubricants", "Hard Erection"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleSexEnhancementOptions(option)}
        />
      ),
    },
    {
      widgetName: "lubricantOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Fiesta Intim Gel", "KY Jelly"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleLubricantOptions(option)}
        />
      ),
    },
    {
      widgetName: "nextActionOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Chat with AI /Human", "Learn other methods", "Back to main menu"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleNextAction(option)}
        />
      ),
    },
    {
      widgetName: "penegraAudio",
      widgetFunc: (props: MediaWidgetProps) => (
        <AudioWidget 
          src="AUD-20250212-WA0006.mp3" 
          actionProvider={props.actionProvider}
        />
      ),
    },
    {
      widgetName: "lubricantAudio",
      widgetFunc: (props: MediaWidgetProps) => (
        <AudioWidget 
          src="AUD-20250212-WA0007.mp3" 
          actionProvider={props.actionProvider}
        />
      ),
    },
    {
      widgetName: "kyJellyImage",
      widgetFunc: (props: MediaWidgetProps) => (
        <ImageWidget 
          src="IMG-20250212-WA0008.jpg" 
          alt="KY Jelly Product Image"
          actionProvider={props.actionProvider}
        />
      ),
    },
    {
      widgetName: "fiestaGelImage",
      widgetFunc: (props: MediaWidgetProps) => (
        <ImageWidget 
          src="IMG-20250212-WA0009.jpg" 
          alt="Fiesta Intim Gel Product Image"
          actionProvider={props.actionProvider}
        />
      ),
    },
    {
      widgetName: "fiestaGelVideo",
      widgetFunc: (props: MediaWidgetProps) => (
        <VideoLinkWidget 
          url="https://www.youtube.com/watch?v=VtrXlRVaP-c&list=PL0mGkrTWmp4sWe4izabrqUhEVSuQAb-Hd&index=7&pp=iAQB" 
          text="Watch Video Tutorial"
          actionProvider={props.actionProvider}
        />
      ),
    },
    {
      widgetName: "fpmConcernOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Concerned about FP", "Want to switch FP", "Want to stop FP"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleFPMConcernSelection(option)}
        />
      ),
    },
    // Current FPM Options
    {
      widgetName: "currentFPMOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["IUD", "Implant", "Injection/Depo-provera", "Sayana Press", "Daily Pill", "Female sterilisation", "Male sterilisation"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleCurrentFPMSelection(option)}
        />
      ),
    },
    // FPM Concern Type Options
    {
      widgetName: "fpmConcernTypeOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Effectiveness", "Effect on general health", "Convenience", "Price", "Side effects", "Effect on sex life", "Privacy in contraception", "I want no clinic visits", "Effect on fertility"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleFPMConcernTypeSelection(option)}
        />
      ),
    },
    // FPM Next Action Options
    {
      widgetName: "fpmNextActionOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Talk to AI / Human", "Find nearest clinic", "End this chat"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleFPMNextAction(option)}
        />
      ),
    },
    // Feedback Options
    {
      widgetName: "feedbackOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Yes", "No"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleFinalFeedback(option)}
        />
      ),
    },
    // More Help Options
    {
      widgetName: "moreHelpOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Yes, I want to ask", "No"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleMoreHelpOptions(option)}
        />
      ),
    },
    // Human/AI Options
    {
      widgetName: "humanAIOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Human agent", "AI chatbot"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) => props.actionProvider.handleAgentTypeSelection(option)}
        />
      ),
    },
    // ... other widgets remain the same
  ],
};

export default config;
