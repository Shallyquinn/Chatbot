// src/chatbot/MessageParser.ts
import ActionProvider from "./ActionProvider";
import { ChatbotState }  from './types';
import { v4 as uuidv4 } from "uuid";

// type ChatbotStep =
//   | "language"
//   | "gender"
//   | "locationInput"
//   | "locationConfirm"
//   | "age"
//   | "marital"
//   | "fpm"
//   | "contraception"
//   | "emergencyProduct"
//   | "duration"
//   | "methodDetails"
//   | 'sexEnhancement'
//   | 'lubricantSelection'
//   | 'nextAction'
//   // FPM Change/Stop related steps
//   | 'fpmConcern'
//   | 'currentFPM'
//   | 'fpmConcernType'
//   | 'fpmNextAction'
//   | 'feedback'
//   | 'moreHelp'
//   // General question related steps
//   | 'agentTypeSelection'
//   | 'userQuestion'
//   | 'waitingForHuman'
//   | "default";

// interface ChatbotState {
//   currentStep: ChatbotStep;
//   messages: string[]; // Adjust this type if you have a message interface
// }

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
        // New FPM Change/Stop related steps
      case "fpmConcern":
        this.actionProvider.handleFPMConcernSelection(message);
        break;
      case "currentFPM":
        this.actionProvider.handleCurrentFPMSelection(message);
        break;
      case "fpmConcernType":
        this.actionProvider.handleFPMConcernTypeSelection(message);
        break;
      case "fpmNextAction":
        this.actionProvider.handleFPMNextAction(message);
        break;
      case "feedback":
        this.actionProvider.handleFinalFeedback(message);
        break;
      case "moreHelp":
        this.actionProvider.handleMoreHelpOptions(message);
        break;
      // General question related steps
      case "agentTypeSelection":
        this.actionProvider.handleAgentTypeSelection(message);
        break;
      case "userQuestion":
        this.actionProvider.handleUserQuestion(message);
        break;
      case "waitingForHuman":
        // For now, just acknowledge message while waiting for human
        { const acknowledgment = this.actionProvider.createChatBotMessage("Your message has been received. A human agent will respond shortly.");
        this.actionProvider.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, { message, type: 'user', id: uuidv4() }, acknowledgment],
        }));
        break; }
      default:
        // In default state, try to find a match for known user inputs
        if (lowerCase.includes("improve sex life")) {
          this.actionProvider.handleSexLifeImprovement();
        } else if (lowerCase.includes("prevent pregnancy")) {
          this.actionProvider.handlePlanningMethodSelection("How to prevent pregnancy");
        } else if (lowerCase.includes("change") && lowerCase.includes("fpm")) {
          this.actionProvider.handleFPMChangeSelection("Change/stop current FPM");
        } else if (lowerCase === "human") {
          // Handle direct request for a human agent
          const humanMessage = this.actionProvider.createChatBotMessage(
            "You'll be connected to a human agent shortly. Please note that there might be a wait time depending on availability."
          );
          this.actionProvider.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { message, type: 'user', id: uuidv4() }, humanMessage],
            currentStep: "waitingForHuman",
          }));
        } else if (lowerCase === "clinic") {
          // Handle direct request for clinic information
          const clinicMessage = this.actionProvider.createChatBotMessage(
            "To find the nearest clinic, please share your location or enter your city/area name."
          );
          this.actionProvider.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { message, type: 'user', id: uuidv4() }, clinicMessage],
            currentStep: "locationInput",
          }));
        } else {
          console.warn("Unhandled step or message:", this.state.currentStep, message);
          // Generic response for unhandled messages
          const genericResponse = this.actionProvider.createChatBotMessage(
            "I'm not sure I understand. If you need help with family planning methods, please select an option from the menu or type 'human' to speak with a human agent."
          );
          this.actionProvider.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { message, type: 'user', id: uuidv4() }, genericResponse],
          }));
        }
        break;
    }
  }
}

export default MessageParser;
function uuidv4(): string | undefined {
  throw new Error("Function not implemented.");
}

