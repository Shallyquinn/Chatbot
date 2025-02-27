// src/chatbot/MessageParser.ts
import ActionProvider from "./ActionProvider";
import { ChatbotState } from './types';

type ChatbotStep =
  | "language"
  | "gender"
  | "locationInput"
  | "locationConfirm"
  | "age"
  | "marital"
  | "fpm"
  | "contraception"
  | "emergencyProduct"
  | "duration"
  | "methodDetails"
  | 'sexEnhancement'
  | 'lubricantSelection'
  | 'nextAction'
  | "default";

interface ChatbotState {
  currentStep: ChatbotStep;
  messages: string[]; // Adjust this type if you have a message interface
}

class MessageParser {
  actionProvider: ActionProvider;
  state: ChatbotState;

  constructor(actionProvider: ActionProvider, state: ChatbotState) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message: string):void {
    const lowerCase = message.toLowerCase();

    console.log('Current step:', this.state.currentStep);
    console.log('Parsing message:', message);

    switch (this.state.currentStep) {
      case "language":
        this.actionProvider.handleLanguageSelection(message);
        break;
      case "gender":
        this.actionProvider.handleGenderSelection(message);
        break;
      case "locationInput":
        this.actionProvider.handleLocationInput(message);
        break;
      case "locationConfirm":
        this.actionProvider.handleLocationConfirmation(message);
        break;
      case "age":
        this.actionProvider.handleAgeSelection(message);
        break;
      case "marital":
        this.actionProvider.handleMaritalStatusSelection(message);
        break;
      case "fpm":
        this.actionProvider.handlePlanningMethodSelection(message);
        break;
      case "contraception":
        this.actionProvider.handleContraceptionTypeSelection(message);
        break;
      case "emergencyProduct":
        this.actionProvider.handleContraceptionProductSelection(message);
        break;
      case "duration":
        this.actionProvider.handlePreventionDurationSelection(message);
        break;
      case "methodDetails":
        this.actionProvider.handleMethodOptionsSelection(message);
        break;
      case "sexEnhancement":
        this.actionProvider.handleSexEnhancementOptions(message);
        break;
      case "lubricantSelection":
        this.actionProvider.handleLubricantOptions(message);
        break;
      case "nextAction":
        this.actionProvider.handleNextAction(message);
        break;
      default:
        // In default state, try to find a match for known user inputs
        if (lowerCase.includes("improve sex life")) {
          this.actionProvider.handleSexLifeImprovement();
        } else if (lowerCase.includes("prevent pregnancy")) {
          this.actionProvider.handlePlanningMethodSelection("How to prevent pregnancy");
        } else {
          console.warn("Unhandled step or message:", this.state.currentStep, message);
        }
        break;
    }
  }
}

export default MessageParser;
