// src/chatbot/ActionProvider.tsx - Updated Interface Section
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatStep, ChatbotState } from "./types";
import FPMChangeProvider from "./sections/changeFPM/FPMChangeProvider";
import GetPregnantActionProvider from "./sections/getPregnant/getPregnantActionProvider";
import PreventPregnancyActionProvider from './sections/preventPregnancy/preventPregnancyActionProvider';
import {apiService, ApiService} from "@/services/api";

import { ThumbsDown } from "lucide-react";
import { responses } from "./sections/changeFPM/fpmResponses";
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
  handlePreventionDurationSelection: (duration: string) => void;
  handleMethodOptionsSelection: (method: string) => void;

  // =============================================================================
  // SEX LIFE IMPROVEMENT HANDLERS
  // =============================================================================
  handleSexLifeImprovement: () => void;
  handleSexEnhancementOptions: (option: string) => void;
  handleLubricantOptions: (lubricant: string) => void;
  handleNextAction: (action: string) => void;
  handleErectileDysfunctionOptions: (option: string) => void;
  handleSexEnhancementNextAction: (option: string) => void;

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
  private api: ApiService;


  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;
    this.api = apiService;

    // Initialize the FPMChangeProvider with the same parameters
    this.fpmChangeProvider = new FPMChangeProvider(
      createChatBotMessage,
      setStateFunc,
      state,
      this.api
    );

    this.getPregnantActionProvider = new GetPregnantActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state,
      this.api
    );

    this.preventPregnancyActionProvider = new PreventPregnancyActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state,
      this.api
    );

    console.log("🏗️ ActionProvider constructed with all providers");
  }

  

  


  // =============================================================================
  // BASIC SETUP HANDLER IMPLEMENTATIONS
  // =============================================================================

  handleLanguageSelection = async (language: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: language,
      type: "user",
      id: uuidv4(),
    };

    try {
      await this.api.updateUser({ selected_language: language });
    } catch (error) {
      console.error("Failed to save language selection:", error);
    }
    
    const greeting = this.createChatBotMessage(
      'Ẹ pẹlẹ ní bẹyẹn! Oruko mi ni Honey. Mo je Ẹrọ ibaraẹnisọrọ aládàáni fun ifetosi omobibi ati idena Oyun. Mo le fun o ni alate Lori ifetosi omobibi ati Ìlera Ibalopo.\n\n Mo lè dahun àwọn ìbéèrè rẹ lórí ìfètòsọ́mọbíbí, mo lè tọ́kà rẹ sí akọṣẹmọṣẹ oníṣègùn tí ó lè bá sọ̀rọ̀ bẹ̀ẹ̀, mo lè tọ́kà ilé ìwòsàn ìfètòsọ́mọbíbí fún ọ\n\n If you want to be connected to a medical professional agent, just type the word "human" at any time. \n\n Gbogbo ohun tí a bá sọ nínú ibaraẹnisọrọ yìí jẹ́ aṣiri patápátá, nítorína, fókan bàlẹ̀ láti bá mi sọ aṣiri rẹ.',
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
    const genderQuestion = this.createChatBotMessage("Obìnrin ni yín tàbí ọkùnrin?", {
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

  handleGenderSelection = async(gender: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: gender,
      type: "user",
      id: uuidv4(),
    };
   
    try {
      await this.api.updateUser({ selected_gender: gender });
    } catch (error) {
      console.error("Failed to save gender selection:", error);
    }
    const stateQuestion = this.createChatBotMessage(
      "What state are you chatting from? Please search below and select your state.",
      {
        widget: "stateOptions",
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

  handleStateSelection = async(state: string): Promise<void> => {
    this.userState = state;
    const userMessage: ChatMessage = {
      message: state,
      type: "user",
      id: uuidv4(),
    };
    try {
      await this.api.updateUser({ selected_state: state });
    } catch (error) {
      console.error("Failed to save state selection:", error);
    }

    const lgaQuestion = this.createChatBotMessage(
      `Great!E te Ijọba ìbílẹ̀ ti ẹ n  ti n bá wa sọ̀rọ̀  within ${state} state?`,
      {
        widget: "lgaOptions",
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

  handleLGASelection = async(lga: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: lga,
      type: "user",
      id: uuidv4(),
    };
   try {
    await this.api.updateUser({selected_lga: lga});
   } catch (error) {
    console.error("Failed to save LGA selection:", error)
   }

    const confirmMessage = this.createChatBotMessage(
      `Perfect! You're chatting from ${lga}, ${this.userState}.`,
      { delay: 500 }
    );

    const ageQuestion = this.createChatBotMessage(" Kin ni ọjọ orí rẹ?", {
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

  handleLocationInput = async(location: string): Promise<void> => {
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

  handleLocationConfirmation = (locationOption: string): void => {
    const userMessage: ChatMessage = {
      message: locationOption,
      type: "user",
      id: uuidv4(),
    };

    if (locationOption === "Yes, that's correct") {
      const ageQuestion = this.createChatBotMessage("Kin ni ọjọ orí rẹ?", {
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
          widget: "stateOptions",
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

  handleAgeSelection = async(age: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: age,
      type: "user",
      id: uuidv4(),
    };

     try {
      await this.api.updateUser({ selected_age_group: age });
    } catch (error) {
      console.error("Failed to save age selection:", error);
    }

    const maritalQuestion = this.createChatBotMessage(
      "Ṣe wúndíá tàbí àpọn ni ọ báyìí àbí o ti ṣègbéyàwó?",
      {
        widget: "maritalStatusOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, maritalQuestion],
      currentStep: "maritalStatus",
      selectedAge: age,
    }));
  };

  handleMaritalStatusSelection = async(status: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: status,
      type: "user",
      id: uuidv4(),
    };
      try {
      await this.api.updateUser({ selected_marital_status: status });
    } catch (error) {
      console.error("Failed to save marital status:", error);
    }

    const thankYou = this.createChatBotMessage("O seun fún ìdáhùn yìí!", {
      delay: 500,
    });
    const assistMsg = this.createChatBotMessage(
      "Ní bayi mo le ran ọ lọwọ síi.",
      { delay: 500 }
    );
    const fpmQuestion = this.createChatBotMessage(
      "Mo le fún ọ ní àlàyé lórí àwọn ìlànà Ifeto ṣọmọ bibi (FPM) tàbí àwọn ìbéère mìíràn tí o jẹ mọ ibalopọ. Kí ni nnkan tí o fẹ́ mọ? \n\nFPM = Family Planning Method",
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

  handlePlanningMethodSelection = async(method: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };
     await this.api.updateUser({current_fpm_method:method})
    

    let responseMessage: ChatMessage;

    switch (method) {
      case "How to get pregnant":
        this.handleGetPregnantInitiation();
        return;

      case "How to prevent pregnancy":
        this.preventPregnancyActionProvider.handlePreventPregnancyInitiation();
        return;

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
    await this.api.createConversation({
      message_text: method,
      message_type: "user",
      chat_step:"planningMethodSelection",
      message_sequence_number:1,
      widget_name:'planningMethodSelection',
      widget_options:["contraception", "sexEnhancement"],
      message_delay_ms:userMessage.delay
     })
  };


  handleContraceptionTypeSelection = (type: string): void => {
    this.preventPregnancyActionProvider.handleContraceptionTypeSelection(type);
  };

  handleEmergencyProductSelection = (product: string): void => {
    this.preventPregnancyActionProvider.handleEmergencyProductSelection(product);
  };

  handlePreventionDurationSelection = (duration: string): void => {
    this.preventPregnancyActionProvider.handlePreventionDurationSelection(duration);
  };

  handleMethodOptionsSelection = (method: string): void => {
    this.preventPregnancyActionProvider.handleMethodOptionsSelection(method);
  };

  // =============================================================================
  // SEX LIFE IMPROVEMENT HANDLER IMPLEMENTATIONS
  // =============================================================================

  handleSexLifeImprovement = async(): Promise<void> => {
    const responseMessage = this.createChatBotMessage(
      "I can help improve your sexual experience. What would you like to focus on?",
      {
        widget: "sexEnhancementOptions",
        delay: 500,
      }
    );
     await this.api.createConversation({
      message_type:'user',
      message_text:responseMessage.message,
      chat_step:'sexEnhancement',
      widget_name:"sexEnhancementOptions",
      message_delay_ms:responseMessage.delay,
    })

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, responseMessage],
      currentStep: "sexEnhancement",
    }));
    
  };

  handleSexEnhancementOptions = async (option: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: option,
      type: "user",
      id: uuidv4(),
    };

     await this.api.createConversation({
      message_type:'bot',
      message_text:'I can help improve your sexual experience. What would you like to focus on?',
      chat_step:'lubricantSelection',
      widget_name:"lubricantOptions",
      widget_options:['']
    })

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

    switch (action) {
      case "Chat with AI /Human":
        this.handleGeneralQuestion();
        return;
        
      case "Learn other methods": {
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
        return;
      }
      
      case "Back to main menu": {
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
        return;
      }
      
      default: {
        const responseMessage = this.createChatBotMessage(
          "Thank you for using our family planning assistant!",
          { delay: 500 }
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, responseMessage],
          currentStep: "default",
        }));
      }
    }
  };
  handleErectileDysfunctionOptions = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      "For erectile dysfunction concerns, I recommend consulting with a healthcare provider for proper evaluation and treatment options.",
      { delay: 500 }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: "default",
    }));
  };

  handleSexEnhancementNextAction = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      "Thank you for your interest in sexual health. Is there anything else I can help you with?",
      {
        widget: "moreHelpOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: "moreHelp",
    }));
  };

  // =============================================================================
  // GENERAL QUESTION HANDLER IMPLEMENTATIONS
  // =============================================================================

  handleGeneralQuestion = async(): Promise<void> => {
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
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type:'bot',
      chat_step:"agentTypeSelection",
      message_sequence_number:1,
      widget_name:"agentTypeOptions"
    })
  };

  handleAgentTypeSelection = async(type: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: type,
      type: "user",
      id: uuidv4(),
    };

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
        currentStep: "userQuestion",
      }));
    } else {
      const errorMessage = this.createChatBotMessage(
        "I'm sorry, I didn't understand that. Please choose either 'Human Agent' or 'AI Agent'.",
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
        currentStep: "agentTypeSelection",
      }));
    }
    await this.api.createConversation({
      message_text: type,
      message_type:'user',
      chat_step:"agentTypeSelection",
      message_sequence_number:1,
      widget_name:"agentTypeOptions"
    })
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
    console.log("More help option:", option);
    this.handleMoreHelp(option);
  };

  handleUserQuestion = (question: string): void => {
    const userMessage: ChatMessage = {
      message: question,
      type: "user",
      id: uuidv4(),
    };

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
  // FPM SWITCH FLOW HANDLERS
  // =============================================================================

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
  // FPM STOP FLOW HANDLERS
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
