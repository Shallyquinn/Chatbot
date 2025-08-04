// src/chatbot/ActionProvider.tsx - Updated Interface Section
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatStep, ChatbotState } from "./types";
import FPMChangeProvider from "./sections/changeFPM/FPMChangeProvider";
import GetPregnantActionProvider from "./sections/getPregnant/getPregnantActionProvider";
import PreventPregnancyActionProvider from "./sections/preventPregnancy/preventPregnancyActionProvider";

// =============================================================================
// ACTION PROVIDER INTERFACE - Complete interface matching all widgets
// =============================================================================

export interface ActionProviderInterface {
  // =============================================================================
  // BASIC SETUP HANDLERS
  // =============================================================================
  handleLanguageSelection: (language: string) => void;
  handleGenderSelection: (gender: string) => void;
  handleStateSelection: (state: string) => void;
  handleLGASelection: (lga: string) => void;
  handleLocationInput: (location: string) => void;
  handleLocationConfirmation: (location: string) => void;
  handleAgeSelection: (age: string) => void;
  handleMaritalStatusSelection: (status: string) => void;

  // =============================================================================
  // FAMILY PLANNING CORE HANDLERS
  // =============================================================================
  handlePlanningMethodSelection: (method: string) => void;

  // =============================================================================
  // PREVENT PREGNANCY HANDLERS - Delegated to PreventPregnancyActionProvider
  // =============================================================================
  handleContraceptionTypeSelection: (type: string) => void;
  handleEmergencyProductSelection: (product: string) => void;
  handleContraceptionProductSelection: (product: string) => void;
  handlePreventionDurationSelection: (duration: string) => void;
  handleMethodOptionsSelection: (method: string) => void;

  // =============================================================================
  // SEX LIFE IMPROVEMENT HANDLERS
  // =============================================================================
  handleSexLifeImprovement: () => void;
  handleSexEnhancementOptions: (option: string) => void;
  handleLubricantOptions: (lubricant: string) => void;
  handleNextAction: (action: string) => void;

  // =============================================================================
  // GENERAL QUESTION HANDLERS
  // =============================================================================
  handleGeneralQuestion: () => void;
  handleAgentTypeSelection: (type: string) => void;
  handleMoreHelp: (answer: string) => void;
  handleMoreHelpOptions: (option: string) => void;
  handleUserQuestion: (question: string) => void;

  // =============================================================================
  // FPM CHANGE/STOP HANDLERS - Delegated to FPMChangeProvider
  // =============================================================================
  handleFPMChangeSelection: (option: string) => void;
  handleFPMConcernSelection: (option: string) => void;
  handleCurrentFPMSelection: (method: string) => void;
  handleFPMConcernTypeSelection: (concernType: string) => void;
  handleFPMSideEffectSelection: (sideEffect: string) => void;
  handleFPMNextAction: (action: string) => void;
  handleFinalFeedback: (feedback: string) => void;

  // FPM Change/Stop - Switch Flow
  handleSwitchCurrentFPMSelection: (method: string) => void;
  handleSatisfactionAssessment: (satisfaction: string) => void;
  handleSwitchReason: (reason: string) => void;
  handleMethodRecommendationInquiry: (response: string) => void;
  handleKidsInFuture: (response: string) => void;
  handleTimingSelection: (timing: string) => void;
  handleImportantFactors: (factor: string) => void;
  handleMenstrualFlowPreference: (preference: string) => void;

  // FPM Change/Stop - Stop Flow
  handleStopFPMSelection: (method: string) => void;
  handleStopReason: (reason: string) => void;

  // =============================================================================
  // GET PREGNANT HANDLERS - Delegated to GetPregnantActionProvider
  // =============================================================================
  handleGetPregnantInitiation: () => void;
  handleGetPregnantFPMSelection: (selection: string) => void;
  handleGetPregnantTryingDuration: (duration: string) => void;
  handleGetPregnantIUDRemoval: (status: string) => void;
  handleGetPregnantImplantRemoval: (status: string) => void;
  handleGetPregnantInjectionStop: (status: string) => void;
  handleGetPregnantPillsStop: (status: string) => void;
  handleGetPregnantNextAction: (action: string) => void;
  handleGetPregnantUserQuestion: (question: string) => void;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

type CreateChatBotMessage = (
  message: string,
  options?: {
    delay?: number;
    widget?: string;
    loading?: boolean;
    payload?: unknown;
    terminateLoading?: boolean;
    withAvatar?: boolean;
  }
) => ChatMessage;

type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

// =============================================================================
// ACTION PROVIDER CLASS IMPLEMENTATION
// =============================================================================

class ActionProvider implements ActionProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;

  // Initialize providers
  private fpmChangeProvider: FPMChangeProvider;
  private getPregnantActionProvider: GetPregnantActionProvider;
  private preventPregnancyActionProvider: PreventPregnancyActionProvider;

  // Store user's location data
  private userState: string = "";
  private userLGA: string = "";

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState
  ) {
    // console.log('🏗️ ActionProvider constructor called'); // Add this debug log
    // console.log('🏗️ State at construction:', state); // Add this debug log
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;

    // Initialize the FPMChangeProvider with the same parameters
    this.fpmChangeProvider = new FPMChangeProvider(
      createChatBotMessage,
      setStateFunc,
      state
    );

    this.getPregnantActionProvider = new GetPregnantActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state
    );

    this.preventPregnancyActionProvider = new PreventPregnancyActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state
    );

    console.log("🏗️ ActionProvider constructed with all providers");
  }

  // =============================================================================
  // BASIC SETUP HANDLER IMPLEMENTATIONS
  // =============================================================================

  handleLanguageSelection = (language: string): void => {
    const userMessage: ChatMessage = {
      message: language,
      type: "user",
      id: uuidv4(),
    };

    const greeting = this.createChatBotMessage(
      'Hey! My name is Honey. I am a family planning and pregnancy prevention chatbot. I am here to help with information on family planning, sexual health, and intimacy.\n\n I can answer your family planning questions, refer you to a medical professional to talk to, and also refer you to a family planning clinic\n\n If you want to be connected to a medical professional agent, just type the word "human" at any time. \n\n Any communication happening in this chat is strictly confidential, so you can feel safe sharing personal information',
      { delay: 500 }
    );
    const followup1 = this.createChatBotMessage(
      "For easy navigation of my features, use the following keywords to access different features.\nMenu: To navigate to the main chatbot paths/menu.\nClinic: Get the address of the clinic in your town\nHoney: Connect with the AI chatbot or a human agent to ask your questions.\nHuman: Request to be connected to a medical professional agent\nLanguage: Choose the language to chat with the bot (English, Hausa, or Yoruba).",
      { delay: 1000 }
    );
    const followUp2 = this.createChatBotMessage(
      "Before we continue, I would like to ask you a few questions to assist you better.",
      { delay: 1000 }
    );
    const genderQuestion = this.createChatBotMessage("What is your gender?", {
      widget: "genderOptions",
      delay: 1500,
    });
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        greeting,
        followup1,
        followUp2,
        genderQuestion,
      ],
      currentStep: "gender",
      selectedLanguage: language,
    }));
  };

  // Handler for gender selection; asks for LGA input.
  handleGenderSelection = (gender: string): void => {
    const userMessage: ChatMessage = {
      message: gender,
      type: "user",
      id: uuidv4(),
    };

    const stateQuestion = this.createChatBotMessage(
      "What state are you chatting from? Please search below and select your state.",
      {
        widget: "stateSelection",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, stateQuestion],
      currentStep: "stateSelection",
      selectedGender: gender,
    }));
  };

  handleStateSelection = (state: string): void => {
    this.userState = state;

    const userMessage: ChatMessage = {
      message: state,
      type: "user",
      id: uuidv4(),
    };

    const lgaQuestion = this.createChatBotMessage(
      `Great! What Local Government Area (LGA) in ${state} are you from?`,
      {
        widget: "lgaSelection",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, lgaQuestion],
      currentStep: "lgaSelection",
      selectedState: state,
    }));
  };

  handleLGASelection = (lga: string): void => {
    const userMessage: ChatMessage = {
      message: lga,
      type: "user",
      id: uuidv4(),
    };

    this.userLGA = lga;
    const confirmMessage = this.createChatBotMessage(
      `Perfect! You're chatting from ${lga}, ${this.userState}.`,
      { delay: 500 }
    );

    const ageQuestion = this.createChatBotMessage("What's your age group?", {
      widget: "ageOptions",
      delay: 500,
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, confirmMessage, ageQuestion],
      currentStep: "age",
      selectedLGA: lga,
    }));
  };

  handleLocationInput = (location: string): void => {
    const userMessage: ChatMessage = {
      message: location,
      type: "user",
      id: uuidv4(),
    };

    const confirmLocation = this.createChatBotMessage(
      `Please confirm your local government area is ${location}`,
      {
        widget: "locationConfirmation",
        delay: 500,
      }
    );
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, confirmLocation],
      currentStep: "locationConfirm",
    }));
  };

  // Handler for confirming location - LEGACY, kept for compatibility
  handleLocationConfirmation = (locationOption: string): void => {
    const userMessage: ChatMessage = {
      message: locationOption,
      type: "user",
      id: uuidv4(),
    };

    if (locationOption === "Yes, that's correct") {
      const ageQuestion = this.createChatBotMessage("How old are you?", {
        widget: "ageOptions",
        delay: 500,
      });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, ageQuestion],
        currentStep: "age",
      }));
    } else if (locationOption === "Change Location") {
      const stateQuestion = this.createChatBotMessage(
        "Let's start over. What state are you chatting from?",
        {
          widget: "stateSelection",
          delay: 500,
        }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, stateQuestion],
        currentStep: "stateSelection",
      }));
    }
  };

  handleAgeSelection = (age: string): void => {
    const userMessage: ChatMessage = {
      message: age,
      type: "user",
      id: uuidv4(),
    };

    const maritalQuestion = this.createChatBotMessage(
      "What's your marital status?",
      {
        widget: "maritalOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, maritalQuestion],
      currentStep: "marital",
      selectedAge: age,
    }));
  };

  handleMaritalStatusSelection = (status: string): void => {
    const userMessage: ChatMessage = {
      message: status,
      type: "user",
      id: uuidv4(),
    };

    const thankYou = this.createChatBotMessage("Thank you for sharing!", {
      delay: 500,
    });
    const assistMsg = this.createChatBotMessage(
      "Now I can assist you better.",
      { delay: 500 }
    );
    const fpmQuestion = this.createChatBotMessage(
      "I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. What do you want to know? \n\nFPM = Family Planning Method",
      { widget: "fpmOptions", delay: 500 }
    );
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        thankYou,
        assistMsg,
        fpmQuestion,
      ],
      currentStep: "fpm",
    }));
  };
  // =============================================================================
  // FAMILY PLANNING CORE HANDLER IMPLEMENTATIONS
  // =============================================================================

  handlePlanningMethodSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    let responseMessage: ChatMessage;
    let contraceptionQ: ChatMessage;

    switch (method) {
      case "How to get pregnant":
        // Delegate to GetPregnantActionProvider
        this.handleGetPregnantInitiation(); // Remove userMessage argument
        return;

      case "How to prevent pregnancy":
        // Delegate to PreventPregnantActionProvider
        this.preventPregnancyActionProvider.handlePreventPregnancyInitiation(); // Remove userMessage argument
        return;

        // responseMessage = this.createChatBotMessage(
        //   "I see! 👍 You are at the right place, I can assist you with this.",
        //   { delay: 500 }
        // );
        // contraceptionQ = this.createChatBotMessage(
        //   "What kind of contraception do you want to know about? \n\n Emergency = you had sex recently and want to avoid pregnancy",
        //   {
        //     widget: "contraceptionOptions",
        //     delay: 500,
        //   }
        // );
        // this.setState((prev: ChatbotState) => ({
        //   ...prev,
        //   messages: [
        //     ...prev.messages,
        //     userMessage,
        //     responseMessage,
        //     contraceptionQ,
        //   ],
        //   currentStep: "contraception",
        // }));
        // break;

      case "How to improve sex life":
        responseMessage = this.createChatBotMessage(
          "I can help improve your sexual experience. What would you like to focus on?",
          {
            widget: "sexEnhancementOptions",
            delay: 500,
          }
        );
        this.handleSexLifeImprovement();
        break;

      case "Change/stop current FPM":
        // Delegate to FPMChangeProvider
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage],
        }));
        this.handleFPMChangeSelection(method);
        return;

      case "Ask a general question":
        this.handleGeneralQuestion();
        return;

      default:
        responseMessage = this.createChatBotMessage(
          "I'm sorry, I didn't understand that option. Please select from the available choices.",
          { delay: 500 }
        );
        break;
    }

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep:
        method === "How to prevent pregnancy"
          ? "contraception"
          : "sexEnhancement",
    }));
  };

  handleContraceptionTypeSelection = (type: string): void => {
    const userMessage: ChatMessage = {
      message: type,
      type: "user",
      id: uuidv4(),
    };

    let responseMessage: ChatMessage;
    let nextStep: ChatStep;

    if (type === "Emergency") {
      responseMessage = this.createChatBotMessage(
        "For emergency contraception, here are the available options:",
        {
          widget: "emergencyProductOptions",
          delay: 500,
        }
      );
      nextStep = "emergencyProduct";
    } else {
      responseMessage = this.createChatBotMessage(
        "How long do you want to prevent pregnancy?",
        {
          widget: "durationOptions",
          delay: 500,
        }
      );
      nextStep = "duration";
    }

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: nextStep,
    }));
  };

  handleContraceptionProductSelection = (product: string): void => {
    const userMessage: ChatMessage = {
      message: product,
      type: "user",
      id: uuidv4(),
    };

    const productInfo = this.getEmergencyProductInfo(product);
    const responseMessage = this.createChatBotMessage(productInfo, {
      delay: 500,
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: "default",
    }));
  };

  handlePreventionDurationSelection = (duration: string): void => {
    const userMessage: ChatMessage = {
      message: duration,
      type: "user",
      id: uuidv4(),
    };

    const methods = this.getMethodsForDuration(duration);
    const responseMessage = this.createChatBotMessage(
      `Based on your preference for ${duration}, here are the recommended methods: ${methods.join(
        ", "
      )}`,
      {
        widget: "methodOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: "methodDetails",
    }));
  };

  handleMethodOptionsSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    const methodInfo = this.getMethodInfo(method);
    const responseMessage = this.createChatBotMessage(methodInfo, {
      delay: 500,
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: "default",
    }));
  };

  // =============================================================================
  // SEX LIFE IMPROVEMENT HANDLER IMPLEMENTATIONS
  // =============================================================================

  handleSexLifeImprovement = (): void => {
    const responseMessage = this.createChatBotMessage(
      "I can help improve your sexual experience. What would you like to focus on?",
      {
        widget: "sexEnhancementOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, responseMessage],
      currentStep: "sexEnhancement",
    }));
  };

  handleSexEnhancementOptions = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: "user",
      id: uuidv4(),
    };

    let responseMessage: ChatMessage;

    if (option === "Gels and Lubricants") {
      responseMessage = this.createChatBotMessage(
        "Here are some recommended lubricant options:",
        {
          widget: "lubricantOptions",
          delay: 500,
        }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        currentStep: "lubricantSelection",
      }));
    } else {
      responseMessage = this.createChatBotMessage(
        "For erectile dysfunction concerns, I recommend consulting with a healthcare provider for proper evaluation and treatment options.",
        { delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        currentStep: "default",
      }));
    }
  };

  handleLubricantOptions = (lubricant: string): void => {
    const userMessage: ChatMessage = {
      message: lubricant,
      type: "user",
      id: uuidv4(),
    };

    const lubricantInfo = this.getLubricantInfo(lubricant);
    const responseMessage = this.createChatBotMessage(lubricantInfo, {
      delay: 500,
    });

    const nextActionMessage = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "nextActionOptions",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        responseMessage,
        nextActionMessage,
      ],
      currentStep: "nextAction",
    }));
  };

  handleNextAction = (action: string): void => {
    const userMessage: ChatMessage = {
      message: action,
      type: "user",
      id: uuidv4(),
    };

    let responseMessage: ChatMessage;

    switch (action) {
      case "Chat with AI /Human":
        this.handleGeneralQuestion
        break;
      case "Learn other methods":
        const methodsMessage = this.createChatBotMessage(
          "What would you like me to help you with?",
          {
            widget: "fpmOptions",
            delay: 500,
          }
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, methodsMessage],
          currentStep: "fpm",
        }));
        break;
      case "Back to main menu":
        const mainMenuMessage = this.createChatBotMessage(
          "What would you like me to help you with?",
          {
            widget: "fpmOptions",
            delay: 500,
          }
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, mainMenuMessage],
          currentStep: "fpm",
        }));
        break;
      default:
        responseMessage = this.createChatBotMessage(
          "Thank you for using our family planning assistant!",
          { delay: 500 }
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, responseMessage],
          currentStep: "default",
        }));
        break;
    }

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep:
        action === "Chat with AI /Human" ? "agentTypeSelection" : "fpm",
    }));
  };

  // =============================================================================
  // GENERAL QUESTION HANDLER IMPLEMENTATIONS
  // =============================================================================

  handleGeneralQuestion = (): void => {
    const responseMessage = this.createChatBotMessage(
      "I'd be happy to help with your questions! ",
      {delay: 500}
    );
    const agentMessage = this.createChatBotMessage(  
      "Would you prefer to speak with a human agent or continue with me (AI chatbot)?",
      {
        widget: "agentTypeOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, responseMessage, agentMessage],
      currentStep: "agentTypeSelection",
    }));
  };

  handleAgentTypeSelection = (type: string): void => {
    const userMessage: ChatMessage = {
      message: type,
      type: "user",
      id: uuidv4(),
    };

    let responseMessage: ChatMessage;

    if (type === "Human Agent") {
      const humanMessage = this.createChatBotMessage(
        "I'm connecting you with a human agent. Please wait a moment while I transfer your chat.",
        { delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, humanMessage],
        currentStep: "waitingForHuman",
      }));
    } else if(type === "AI Agent") {
      const aiMessage = this.createChatBotMessage(
        "Perfect! I'm here to help. Please ask your question and I'll do my best to provide accurate information.",
        { delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, aiMessage],
        currentStep: "waitingForHuman",
      }));
    }

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: type === "Human agent" ? "waitingForHuman" : "userQuestion",
    }));
  };

  handleMoreHelp = (answer: string): void => {
    const userMessage: ChatMessage = {
      message: answer,
      type: "user",
      id: uuidv4(),
    };

    if (answer === "Yes") {
      const helpOptions = this.createChatBotMessage(
        "What additional help would you like?",
        {
          widget: "moreHelpOptions",
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, helpOptions],
        currentStep: "moreHelp",
      }));
    } else {
      const thankYou = this.createChatBotMessage(
        "Thank you for using our service! Feel free to come back anytime you need help. Have a great day!",
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, thankYou],
        currentStep: "default",
      }));
    }
  };

  handleMoreHelpOptions = (option: string): void => {
    // Implementation for more help options
    console.log("More help option:", option);
    this.handleMoreHelp(option);
  };

  handleUserQuestion = (question: string): void => {
    const userMessage: ChatMessage = {
      message: question,
      type: "user",
      id: uuidv4(),
    };

    // Simple response - in a real implementation, this would process the question
    const responseMessage = this.createChatBotMessage(
      "Thank you for your question. I'll do my best to help you with that.",
      { delay: 500 }
    );

    const helpMessage = this.createChatBotMessage(
      "Is there anything else I can help you with?",
      {
        widget: "moreHelpOptions",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, helpMessage],
      currentStep: "default",
      // currentStep: "moreHelp",
    }));
  };

  // =============================================================================
  // FPM CHANGE/STOP HANDLER IMPLEMENTATIONS - Delegated to FPMChangeProvider
  // =============================================================================

  handleFPMChangeSelection = (option: string): void => {
    this.fpmChangeProvider.handleFPMChangeSelection(option);
  };

  handleFPMConcernSelection = (option: string): void => {
    this.fpmChangeProvider.handleFPMConcernSelection(option);
  };

  handleCurrentFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleCurrentFPMSelection(method);
  };

  handleFPMConcernTypeSelection = (concernType: string): void => {
    this.fpmChangeProvider.handleFPMConcernTypeSelection(concernType);
  };

  handleFPMSideEffectSelection = (sideEffect: string): void => {
    this.fpmChangeProvider.handleFPMSideEffectSelection(sideEffect);
  };

  handleFPMNextAction = (action: string): void => {
    this.fpmChangeProvider.handleFPMNextAction(action);
  };

  handleFinalFeedback = (feedback: string): void => {
    this.fpmChangeProvider.handleFinalFeedback(feedback);
  };

  // =============================================================================
  // FPM SWITCH FLOW HANDLERS - Add these to your ActionProvider class
  // =============================================================================

  // FPM Switch Flow Handlers
  handleSwitchCurrentFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleSwitchCurrentFPMSelection(method);
  };

  handleSatisfactionAssessment = (satisfaction: string): void => {
    this.fpmChangeProvider.handleSatisfactionAssessment(satisfaction);
  };

  handleSwitchReason = (reason: string): void => {
    this.fpmChangeProvider.handleSwitchReason(reason);
  };

  handleMethodRecommendationInquiry = (response: string): void => {
    this.fpmChangeProvider.handleMethodRecommendationInquiry(response);
  };

  handleKidsInFuture = (response: string): void => {
    this.fpmChangeProvider.handleKidsInFuture(response);
  };

  handleTimingSelection = (timing: string): void => {
    this.fpmChangeProvider.handleTimingSelection(timing);
  };

  handleImportantFactors = (factor: string): void => {
    this.fpmChangeProvider.handleImportantFactors(factor);
  };

  handleMenstrualFlowPreference = (preference: string): void => {
    this.fpmChangeProvider.handleMenstrualFlowPreference(preference);
  };

  // =============================================================================
  // FPM STOP FLOW HANDLERS - Add these to your ActionProvider class
  // =============================================================================

  handleStopFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleStopFPMSelection(method);
  };

  handleStopReason = (reason: string): void => {
    this.fpmChangeProvider.handleStopReason(reason);
  };

  // =============================================================================
  // GET PREGNANT HANDLER IMPLEMENTATIONS - Delegated to GetPregnantActionProvider
  // =============================================================================

  handleGetPregnantInitiation = (): void => {
    this.getPregnantActionProvider.handleGetPregnantInitiation();
  };

  handleGetPregnantFPMSelection = (selection: string): void => {
    this.getPregnantActionProvider.handleGetPregnantFPMSelection(selection);
  };

  handleGetPregnantTryingDuration = (duration: string): void => {
    this.getPregnantActionProvider.handleGetPregnantTryingDuration(duration);
  };

  handleGetPregnantIUDRemoval = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantIUDRemoval(status);
  };

  handleGetPregnantImplantRemoval = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantImplantRemoval(status);
  };

  handleGetPregnantInjectionStop = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantInjectionStop(status);
  };

  handleGetPregnantPillsStop = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantPillsStop(status);
  };

  handleGetPregnantNextAction = (action: string): void => {
    this.getPregnantActionProvider.handleGetPregnantNextAction(action);
  };

  handleGetPregnantUserQuestion = (question: string): void => {
    this.getPregnantActionProvider.handleGetPregnantUserQuestion(question);
  };

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private getEmergencyProductInfo(product: string): string {
    const products: Record<string, string> = {
      Postpill:
        "Postpill is an emergency contraceptive that should be taken within 72 hours of unprotected sex. It's most effective when taken as soon as possible.",
      "Postinor-2":
        "Postinor-2 is an emergency contraceptive containing levonorgestrel. Take it within 72 hours of unprotected sex for best results.",
    };
    return (
      products[product] ||
      "Please consult with a healthcare provider about emergency contraception options."
    );
  }

  private getMethodsForDuration(duration: string): string[] {
    // Return methods based on the selected duration
    switch (duration) {
      case "Short-term":
        return ["Daily pills", "Condoms"];
      case "Medium-term":
        return ["Injectables"];
      case "Long-term":
        return ["Implants", "IUD"];
      default:
        return ["Daily pills", "Injectables", "Implants"];
    }
  }

  private getMethodInfo(method: string): string {
    const methods: Record<string, string> = {
      "Daily pills":
        "Daily contraceptive pills are highly effective when taken consistently. They contain hormones that prevent ovulation.",
      Injectables:
        "Injectable contraceptives like Depo-Provera provide protection for 3 months per injection.",
      Implants:
        "Contraceptive implants are small rods placed under the skin that provide protection for 3-5 years.",
      "Emergency pills":
        "Emergency contraceptives should be used only as backup and taken within 72 hours of unprotected sex.",
    };
    return (
      methods[method] ||
      "Please consult with a healthcare provider for detailed information about this method."
    );
  }

  private getLubricantInfo = (category: string, product?: string): string => {
    const lubricantData: Record<
      string,
      {
        description: string;
        products?: Record<string, string>;
      }
    > = {
      "Water-based": {
        description:
          "Water-based lubricants are safe to use with condoms and are easy to clean up. They're compatible with all types of contraceptives.",
        products: {
          "Fiesta Intim Gel":
            "Fiesta Intim Gel is a water-based lubricant designed to enhance comfort and pleasure during intimate moments.",
          "KY Jelly":
            "KY Jelly is a well-known water-based personal lubricant that's gentle and effective for reducing friction during intimacy."
        }
      },
      "Silicone-based": {
        description:
          "Silicone-based lubricants last longer than water-based ones and are good for longer sessions. They're also condom-compatible."
      },
      "Natural options": {
        description:
          "Natural options include coconut oil or aloe vera, but note that oil-based products can break down latex condoms."
      }
    };

    const categoryData = lubricantData[category];

    if (!categoryData) {
      return "This lubricant can help enhance comfort during intimate moments. \nPlease consult with a healthcare provider about safe lubricant options.";
    }

    if (product && categoryData.products && categoryData.products[product]) {
      return categoryData.products[product];
    }

    return categoryData.description;
  };
}

export default ActionProvider;
