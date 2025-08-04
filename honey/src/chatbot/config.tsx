import React from "react";
import { createChatBotMessage } from "react-chatbot-kit";
// import ChatbotConfig from "react-chatbot-kit";
import OptionButtons from "../components/OptionButtons";
import ChatMessage from "../components/ChatMessage";
import { ActionProviderInterface } from "../chatbot/ActionProvider";
import { ChatbotState } from "./types";
import {
  fpmChangeStopWidgets,
  FPMWidgetProps,
} from "./sections/changeFPM/fpmWidgetsConfig";
import BotAvatar from "../components/botAvatar/index";
import { mediaWidgets } from "../components/mediaWidgetsConfig";
import StateSearchWidget from "../components/StateSearchWidget";
import LGASearchWidget from "../components/LGASearchWidget";
import { getAllStates } from "../data/nigerianStates";
import {
  getPregnantWidgets,
  GetPregnantWidgetProps,
} from "./sections/getPregnant/getPregnantConfig";
import { preventPregnancyWidgets, PreventPregnancyWidgetProps } from "./sections/preventPregnancy/preventPregnancyWidgetsConfig";

// Define prop types for your custom message components
export interface MessageBoxProps {
  message?: string; // Marked optional since the chatbot system may supply it
  state: ChatbotState;
  type: "bot" | "user";
  // Allow additional properties
}

// Add this interface for avatar props
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
  currentStep: "language",
};

const botName = "Honey";

const config = {
  initialMessages: [
    createChatBotMessage(`Hello, my name is ${botName}.`, {
      delay: 500,
    }),
    createChatBotMessage("Please choose the language you want to chat with.", {
      delay: 1000,
      widget: "languageOptions",
    }),
    // createChatBotMessage(`Hello. What's your name?`, {
    //   delay: 1000,
    //   widget: "inputName"
    // }),
  ],
  botName: botName,
  // Add initial state
  state: initialState,
  customComponents: {
    // Custom message components
    botAvatar: () => <BotAvatar />,
    userAvatar: () => <></>,
    botMessageBox: (props: MessageBoxProps) => (
      <ChatMessage {...props} type="bot" />
    ),
    userMessageBox: (props: MessageBoxProps) => (
      <ChatMessage {...props} type="user" />
    ),
  },
  // customComponents: {
  //   botAvatar: (props: AvatarProps) => <BotAvatar {...props} />,
  //   userAvatar: (props: AvatarProps) => <BotAvatar {...props} />,
  //   botChatMessage: (props: MessageBoxProps) => <ChatMessage {...props} />,
  //   userChatMessage: (props: MessageBoxProps) => <ChatMessage {...props} />,
  // },
  customStyles: {
    // Override default styles
    botMessageBox: {
      // backgroundColor: '#F5F5F5',
      backgroundColor: "#e0e0e0",
      // color: 'white',
    },
    chatButton: {
      backgroundColor: "#FFA500",
    },
  },

  widgets: [
    // Basic chatbot widgets
    {
      widgetName: "languageOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["English", "Hausa", "Yoruba"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider?.handleLanguageSelection(option)
          }
        />
      ),
    },
    {
      widgetName: "genderOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Male 👨", "Female 👩", "Prefer not to say"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleGenderSelection(option)
          }
        />
      ),
    },
    // {
    //   widgetName: "locationOptions",
    //   widgetFunc: (props: WidgetProps) => (
    //     <OptionButtons
    //       options={[...popularLGAs.slice(0, 10), "Other LGA"]}
    //       actionProvider={props.actionProvider}
    //       handleClick={(option: string) => props.actionProvider.handleLocationConfirmation(option)}
    //     />
    //   ),
    // },

    // New State Selection Widget with Search
    {
      widgetName: "stateSelection",
      widgetFunc: (props: WidgetProps) => (
        <StateSearchWidget
          states={getAllStates()}
          actionProvider={props.actionProvider}
          onStateSelect={(state: string) =>
            props.actionProvider.handleStateSelection(state)
          }
        />
      ),
    },
    // New LGA Selection Widget with Search (filtered by selected state)
    {
      widgetName: "lgaSelection",
      widgetFunc: (props: WidgetProps) => (
        <LGASearchWidget
          selectedState={props.state.selectedState || ""}
          actionProvider={props.actionProvider}
          onLGASelect={(lga: string) =>
            props.actionProvider.handleLGASelection(lga)
          }
        />
      ),
    },
    // Keep the old location options as fallback
    {
      widgetName: "locationConfirmation",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Yes, that's correct", "Change Location"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleLocationConfirmation(option)
          }
        />
      ),
    },
    {
      widgetName: "ageOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["< 25", "26-35", "36-45", "46-55", "55 and older"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleAgeSelection(option)
          }
        />
      ),
    },
    {
      widgetName: "maritalOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            "Single",
            "In a relationship",
            "Married",
            "Prefer not to say",
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleMaritalStatusSelection(option)
          }
        />
      ),
    },

    // Main FPM options
    {
      widgetName: "fpmOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            "How to get pregnant",
            "How to prevent pregnancy",
            "How to improve sex life",
            "Change/stop current FPM",
            "Ask a general question",
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handlePlanningMethodSelection(option)
          }
        />
      ),
    },


    // Sex life improvement widgets
    {
      widgetName: "sexEnhancementOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Gels and Lubricants", "Hard Erection"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleSexEnhancementOptions(option)
          }
        />
      ),
    },
    {
      widgetName: "lubricantOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Fiesta Intim Gel", "KY Jelly"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleLubricantOptions(option)
          }
        />
      ),
    },
    {
      widgetName: "nextActionOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={[
            "Chat with AI /Human",
            "Learn other methods",
            "Back to main menu",
          ]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleNextAction(option)
          }
        />
      ),
    },

    // =============================================================================
    // GENERAL QUESTION WIDGETS
    // =============================================================================
    {
      widgetName: "agentTypeOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["AI Agent", "Human Agent"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleAgentTypeSelection(option)
          }
        />
      ),
    },
    {
      widgetName: "moreHelpOptions",
      widgetFunc: (props: WidgetProps) => (
        <OptionButtons
          options={["Yes", "No"]}
          actionProvider={props.actionProvider}
          handleClick={(option: string) =>
            props.actionProvider.handleMoreHelpOptions(option)
          }
        />
      ),
    },

    // =============================================================================
    // MEDIA WIDGETS - Imported from mediaWidgetsConfig.tsx
    // =============================================================================
    ...mediaWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as MediaWidgetProps),
    })),

    // ... other widgets remain the same
    // =============================================================================
    // FPM CHANGE/STOP WIDGETS - Imported from fpmWidgetsConfig.tsx
    // =============================================================================
    ...fpmChangeStopWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as FPMWidgetProps),
    })),
    // =============================================================================
    // GET PREGNANT WIDGETS - Imported from getPregnantConfig.tsx
    // =============================================================================
    ...getPregnantWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as GetPregnantWidgetProps),
    })),

    // =============================================================================
    // PREVENT PREGNANCY WIDGETS - Imported from preventPregnancyWidgetsConfig.tsx
    // =============================================================================
    ...preventPregnancyWidgets.map((widget) => ({
      widgetName: widget.widgetName,
      widgetFunc: (props: WidgetProps) =>
        widget.widgetFunc(props as PreventPregnancyWidgetProps),
    })),
  ],
};

export default config;
