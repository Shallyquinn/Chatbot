// src/chatbot/FPMChangeProvider.tsx
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatbotState } from './types';

// Define the types for our FPM change provider
type CreateChatBotMessage = (message: string, options?: Partial<ChatMessage>) => ChatMessage;
type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

export interface FPMChangeProviderInterface {
  handleFPMChangeSelection: (option: string) => void;
  handleFPMConcernSelection: (option: string) => void;
  handleCurrentFPMSelection: (method: string) => void;
  handleFPMConcernTypeSelection: (concernType: string) => void;
  handleFPMSideEffectSelection: (sideEffect: string) => void;
  handleFPMNextAction: (action: string) => void;
  handleFinalFeedback: (feedback: string) => void;
}

class FPMChangeProvider implements FPMChangeProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  
  constructor(createChatBotMessage: CreateChatBotMessage, setStateFunc: SetStateFunc, state: ChatbotState) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;
  }

  // Handler for FPM change selection (first step after selecting "Change/stop current FPM")
  handleFPMChangeSelection = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    const concernMessage = this.createChatBotMessage(
      "I am sorry to hear that you are dissatisfied with the current family planning method.\n\nCould you tell me a little more about the situation? What is your concern?\nFP = Family Planning method (contraceptive)",
      { 
        widget: "fpmConcernOptions", 
        delay: 500 
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, concernMessage],
      currentStep: "fpmConcern",
    }));
  };

  // Handler for FPM concern selection ("Concerned about FP", "Want to switch FP", "Want to stop FP")
  handleFPMConcernSelection = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    // For all options, we ask which method they're currently using
    const methodQuestion = this.createChatBotMessage(
      "Ok, I can help you. Which method are you currently using?", 
      { 
        widget: "currentFPMOptions", 
        delay: 500 
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, methodQuestion],
      currentStep: "currentFPM",
    }));
  };

  // Handler for current FPM selection
  handleCurrentFPMSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };

    const concernTypeQuestion = this.createChatBotMessage(
      "What kind of concerns do you have?", 
      { 
        widget: "fpmConcernTypeOptions", 
        delay: 500 
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, concernTypeQuestion],
      currentStep: "fpmConcernType",
    }));
  };

  // Handler for FPM concern type selection
  handleFPMConcernTypeSelection = (concernType: string): void => {
    const userMessage: ChatMessage = {
      message: concernType,
      type: 'user',
      id: uuidv4(),
    };

    if (concernType === "Side effects") {
      const sideEffectsInfo = this.createChatBotMessage(
        "*Complications* are rare but may occur and they include;\n\n1. Headache.\n2. Nausea or vomiting.\n3. Dizziness.\n4. Breast tenderness.\n5. Weight gain.\n6. Menstrual changes.\n7. Spotting and irregular vaginal bleeding.\n\nNormally, they wear out *after a few weeks*. If your symptoms are not mentioned above or you are still worried, please visit your family planning provider.",
        { delay: 500 }
      );

      const sideEffectsFollowUp = this.createChatBotMessage(
        "Are you experiencing any of the mentioned side effects, which one?",
        { delay: 1000 }
      );

      const nextActions = this.createChatBotMessage(
        "What would you like to do next?", 
        { 
          widget: "fpmNextActionOptions", 
          delay: 1500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, sideEffectsInfo, sideEffectsFollowUp, nextActions],
        currentStep: "fpmNextAction",
      }));
    } else if (concernType === "Effect on fertility") {
      const fertilityInfo = this.createChatBotMessage(
        "The Implant method is safe and you can have more children when you stop using it.\nOnce you stop using the IUD you can get pregnant almost immediately.",
        { delay: 500 }
      );

      const nextActions = this.createChatBotMessage(
        "What would you like to do next?", 
        { 
          widget: "fpmNextActionOptions", 
          delay: 1000 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, fertilityInfo, nextActions],
        currentStep: "fpmNextAction",
      }));
    } else {
      // For other concern types
      const generalResponse = this.createChatBotMessage(
        "I understand your concern about " + concernType.toLowerCase() + ". This is an important consideration when choosing a family planning method.",
        { delay: 500 }
      );

      const referralMessage = this.createChatBotMessage(
        "For detailed information about this, I recommend speaking with a healthcare provider who can address your specific situation.",
        { delay: 1000 }
      );

      const nextActions = this.createChatBotMessage(
        "What would you like to do next?", 
        { 
          widget: "fpmNextActionOptions", 
          delay: 1500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, generalResponse, referralMessage, nextActions],
        currentStep: "fpmNextAction",
      }));
    }
  };

  // Handler for FPM side effect selection
  handleFPMSideEffectSelection = (sideEffect: string): void => {
    const userMessage: ChatMessage = {
      message: sideEffect,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      "Okay, I understand and I am sorry you are experiencing these issues.\nPlease call 7790 and ask to speak to a nurse counselor who will direct and counsel you on what to do.",
      { delay: 500 }
    );

    const nextActions = this.createChatBotMessage(
      "What would you like to do next?", 
      { 
        widget: "fpmNextActionOptions", 
        delay: 1000 
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, nextActions],
      currentStep: "fpmNextAction",
    }));
  };

  // Handler for FPM next action
  handleFPMNextAction = (action: string): void => {
    const userMessage: ChatMessage = {
      message: action,
      type: 'user',
      id: uuidv4(),
    };

    if (action === "End this chat") {
      const feedbackRequest = this.createChatBotMessage(
        "Did I answer your question?", 
        { 
          widget: "feedbackOptions", 
          delay: 500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, feedbackRequest],
        currentStep: "feedback",
      }));
    } else if (action === "Talk to AI / Human") {
      const humanAIOptions = this.createChatBotMessage(
        "Do you want to be connected to a human medical professional agent or AI chatbot?", 
        { 
          widget: "humanAIOptions", 
          delay: 500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, humanAIOptions],
        currentStep: "humanAISelection",
      }));
    } else if (action === "Find nearest clinic") {
      const clinicMessage = this.createChatBotMessage(
        "To find the nearest clinic, please share your location or enter your city/area name.", 
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, clinicMessage],
        currentStep: "locationInput",
      }));
    }
  };

  // Handler for final feedback
  handleFinalFeedback = (feedback: string): void => {
    const userMessage: ChatMessage = {
      message: feedback,
      type: 'user',
      id: uuidv4(),
    };

    if (feedback === "Yes") {
      const thankYou = this.createChatBotMessage(
        "Great, I am happy that I was of great service to you.", 
        { delay: 500 }
      );

      const callInfo = this.createChatBotMessage(
        "If you want to speak to an agent for further enquiries and discussion, please call 7790.\n\nIf you want to be connected to a medical professional agent here in chat, just type the word \"human\".", 
        { delay: 1000 }
      );

      const moreHelp = this.createChatBotMessage(
        "Can I help you with anything else?", 
        { 
          widget: "moreHelpOptions", 
          delay: 1500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, thankYou, callInfo, moreHelp],
        currentStep: "moreHelp",
      }));
    } else {
      const sorryMessage = this.createChatBotMessage(
        "I'm sorry I couldn't fully address your concerns. For more personalized assistance, please call 7790 to speak with a healthcare professional.", 
        { delay: 500 }
      );

      const moreHelp = this.createChatBotMessage(
        "Can I help you with anything else?", 
        { 
          widget: "moreHelpOptions", 
          delay: 1000 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, sorryMessage, moreHelp],
        currentStep: "moreHelp",
      }));
    }
  };
}

export default FPMChangeProvider;