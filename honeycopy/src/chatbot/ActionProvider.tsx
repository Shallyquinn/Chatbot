// src/chatbot/ActionProvider.tsx
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatbotState } from './types';
import FPMChangeProvider, { FPMChangeProviderInterface } from './FPMChangeProvider';

export interface ActionProviderInterface extends FPMChangeProviderInterface {
  handleLanguageSelection: (language: string) => void;
  handleGenderSelection: (gender: string) => void;
  handleLocationInput: (location: string) => void;
  handleLocationConfirmation: (location: string) => void;
  handleAgeSelection: (age: string) => void;
  handleMaritalStatusSelection: (status: string) => void;
  handlePlanningMethodSelection: (method: string) => void;
  handleContraceptionTypeSelection: (type: string) => void;
  handleContraceptionProductSelection: (product: string) => void;
  handlePreventionDurationSelection: (duration: string) => void;
  handleMethodOptionsSelection: (method: string) => void;
  // New handlers for sex life improvement path
  handleSexLifeImprovement: () => void;
  handleSexEnhancementOptions: (option: string) => void;
  handleLubricantOptions: (lubricant: string) => void;
  handleNextAction: (action: string) => void;
  // General questions
  handleGeneralQuestion: () => void;
  handleAgentTypeSelection: (type: string) => void;
  handleMoreHelpOptions: (option: string) => void;
  handleUserQuestion: (question: string) => void;
}

type CreateChatBotMessage = (message: string, options?: Partial<ChatMessage>) => ChatMessage;
type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

class ActionProvider implements ActionProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  fpmChangeProvider: FPMChangeProvider;
  
  constructor(createChatBotMessage: CreateChatBotMessage, setStateFunc: SetStateFunc, state: ChatbotState) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;

    // Initialize the FPMChangeProvider with the same parameters
    this.fpmChangeProvider = new FPMChangeProvider(createChatBotMessage, setStateFunc, state);
  }

  // Delegate methods to FPMChangeProvider
  handleFPMChangeSelection = (option: string): void => {
    this.fpmChangeProvider.handleFPMChangeSelection(option);
  }

  handleFPMConcernSelection = (option: string): void => {
    this.fpmChangeProvider.handleFPMConcernSelection(option);
  }

  handleCurrentFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleCurrentFPMSelection(method);
  }

  handleFPMConcernTypeSelection = (concernType: string): void => {
    this.fpmChangeProvider.handleFPMConcernTypeSelection(concernType);
  }

  handleFPMSideEffectSelection = (sideEffect: string): void => {
    this.fpmChangeProvider.handleFPMSideEffectSelection(sideEffect);
  }

  handleFPMNextAction = (action: string): void => {
    this.fpmChangeProvider.handleFPMNextAction(action);
  }

  handleFinalFeedback = (feedback: string): void => {
    this.fpmChangeProvider.handleFinalFeedback(feedback);
  }

  // Handler for language selection; sends initial greeting and asks for gender.
  handleLanguageSelection = (language: string): void => {
    const userMessage: ChatMessage = {
      message: language,
      type: 'user',
      id: uuidv4(),
    };
    
    const greeting = this.createChatBotMessage(
      "Hey! My name is Honey. I am a family planning and pregnancy prevention chatbot. I am here to help with family planning, sexual health, and intimacy.",
      { delay: 500 }
    );
    const followUp = this.createChatBotMessage(
      "Before we continue, I would like to ask you a few questions to assist you better.",
      { delay: 1000 }
    );
    const genderQuestion = this.createChatBotMessage("What is your gender?", {
      widget: "genderOptions",
      delay: 1500,
    });
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, greeting, followUp, genderQuestion],
      currentStep: "gender",
    }));
  };

  // Handler for gender selection; asks for LGA input.
  handleGenderSelection = (gender: string): void => {
    const userMessage: ChatMessage = {
      message: gender,
      type: 'user',
      id: uuidv4(),
    };

    const locationQuestion = this.createChatBotMessage("What Local Government Area (LGA) are you chatting from?", {
      delay: 500,
    });
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, locationQuestion],
      currentStep: "locationInput",
    }));
  };

  // Handler for location input (free text); then asks for location confirmation.
  handleLocationInput = (location: string): void => {
    const userMessage: ChatMessage = {
      message: location,
      type: 'user',
      id: uuidv4(),
    };
    const confirmLocation = this.createChatBotMessage("Please confirm your local government area.", {
      widget: "locationOptions",
      delay: 500,
    });
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, confirmLocation],
      currentStep: "locationConfirm",
    }));
  };

  // Handler for confirming location; moves to age selection.
  handleLocationConfirmation = (locationOption: string): void => {
    const userMessage: ChatMessage = {
      message: locationOption,
      type: 'user',
      id: uuidv4(),
    };

    const ageQuestion = this.createChatBotMessage("How old are you?", {
      widget: "ageOptions",
      delay: 500,
    });
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, ageQuestion],
      currentStep: "age",
    }));
  };

  // Handler for age selection; asks for marital status.
  handleAgeSelection = (age: string):void => {
    const userMessage: ChatMessage = {
      message: age,
      type: 'user',
      id: uuidv4(),
    };

    const maritalQuestion = this.createChatBotMessage("What is your current marital status?", {
      widget: "maritalOptions",
      delay: 500,
    });
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, maritalQuestion],
      currentStep: "marital",
    }));
  };

  // Handler for marital status selection; thanks the user and asks for FPM information.
  handleMaritalStatusSelection = (status: string): void => {
    const userMessage: ChatMessage = {
      message: status,
      type: 'user',
      id: uuidv4(),
    };

    const thankYou = this.createChatBotMessage("Thank you for sharing!", { delay: 500 });
    const assistMsg = this.createChatBotMessage("Now I can assist you better.", { delay: 500 });
    const fpmQuestion = this.createChatBotMessage(
      "I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. What do you want to know? FPM = Family Planning Method",
      { widget: "fpmOptions", delay: 500 }
    );
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, thankYou, assistMsg, fpmQuestion],
      currentStep: "fpm",
    }));
  };

  // Handler for FPM selection; specifically handles "How to prevent pregnancy".
  handlePlanningMethodSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };

    if (method === "How to prevent pregnancy") {
      const response = this.createChatBotMessage("I see! 👍 You are at the right place, I can assist you with this.", { delay: 500 });
      const contraceptionQ = this.createChatBotMessage(
        "What kind of contraception do you want to know about? \n Emergency = you had sex recently and want to avoid pregnancy",
        { widget: "contraceptionOptions", delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, response, contraceptionQ],
        currentStep: "contraception",
      }));
    } else if (method === "How to improve sex life") {
      // Call the new handler for sex life improvement
      this.handleSexLifeImprovement();
    } else if (method === "Change/stop current FPM") {
      // Call the new handler for changing/stopping FPM
      this.handleFPMChangeSelection(method);
    } else if (method === "Ask a general question") {
      // Call the handler for general questions
      this.handleGeneralQuestion();
    } else {
      const generic = this.createChatBotMessage("This option is not implemented yet.", { delay: 500 });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, generic],
        currentStep: "default",
      }));
    }
  };

  // Handler for contraception type selection ("Emergency" or "Prevent in future").
  handleContraceptionTypeSelection = (type: string): void => {
    const userMessage: ChatMessage = {
      message: type,
      type: 'user',
      id: uuidv4(),
    };

    if (type === "Emergency") {
      const emergencyMsg = this.createChatBotMessage(
        "To avoid pregnancy after unprotected sex, you can take emergency contraceptive pills.\n\nEmergency pills are very effective when taken within 24 to 72 hours after unprotected sex. You are advised not to take it more than 3 times in a month. If you are ovulating, use an alternative method (condoms).\n\nNote: They are not effective if you are already pregnant.",
        { delay: 500 }
      );
      const pillsMsg = this.createChatBotMessage(
        "Here are some available emergency contraceptive pills:\n1. Postpill\n2. Postinor-2\n\nPostpill can be taken within 5 days after sex, while Postinor-2 is effective within 3 days after sex.",
        { delay: 500 }
      );
      const productQ = this.createChatBotMessage("Which product do you want to learn about?", {
        widget: "emergencyProductOptions",
        delay: 500,
      });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, emergencyMsg, pillsMsg, productQ],
        currentStep: "emergencyProduct",
      }));
    } else if (type === "Prevent in future") {
      const futureMsg = this.createChatBotMessage(
        "Allright 👌 I am happy to provide you with more information about family planning methods that are effective and safe for you.",
        { delay: 500 }
      );
      const durationQ = this.createChatBotMessage(
        "For how long do you want to prevent pregnancy? Options: Up to 1 year, 1-2 years, 3-4 years, 5-10 years, Permanently",
        { widget: "durationOptions", delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, futureMsg, durationQ],
        currentStep: "duration",
      }));
    }
  };

  // Handler for emergency product selection ("Postpill" or "Postinor-2").
  handleContraceptionProductSelection = (product: string): void => {
    const userMessage: ChatMessage = {
      message: product,
      type: 'user',
      id: uuidv4(),
    };

    if (product === "Postpill") {
      const details = this.createChatBotMessage("Postpill can be taken within 5 days after sex.", { delay: 500 });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, details],
        currentStep: "default",
      }));
    } else if (product === "Postinor-2") {
      const details = this.createChatBotMessage("Postinor-2 is effective within 3 days after sex.", { delay: 500 });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, details],
        currentStep: "default",
      }));
    }
  };

  // Handler for prevention duration selection (e.g., "1-2 years").
  handlePreventionDurationSelection = (duration: string):void => {
    const userMessage: ChatMessage = {
      message: duration,
      type: 'user',
      id: uuidv4(),
    };

    if (duration === "1-2 years") {
      const methodQ = this.createChatBotMessage(
        "If you want to prevent pregnancy within 1-2 years, you can use any of the short-acting methods, such as daily pills, injectables, implants, or even emergency pills. Which method do you want to learn more about?",
        { widget: "methodOptions", delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, methodQ],
        currentStep: "methodDetails",
      }));
    } else {
      const generic = this.createChatBotMessage("Detailed information for that duration is not available yet.", { delay: 500 });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, generic],
        currentStep: "default",
      }));
    }
  };

  // Handler for method option selection (e.g., "Daily pills", "Injectables", etc.).
  handleMethodOptionsSelection = (method: string):void => {
    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };

    if (method === "Daily pills") {
      const details = this.createChatBotMessage(
        "Daily pills are combined oral contraceptive pills for pregnancy prevention, dermatological and gynecological conditions, and managing menstrual irregularities. They work by making the sperm difficult to enter the womb. Daily pills come in either a 21-day pack (with a 7-day break) or a 28-day pack (with a pill containing Iron during the break).",
        { delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, details],
        currentStep: "default",
      }));
    } else {
      const generic = this.createChatBotMessage("Detailed information for that method is not available yet.", { delay: 500 });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, generic],
        currentStep: "default",
      }));
    }
  };

  // New handlers for sex life improvement path
  handleSexLifeImprovement = (): void => {
    const userMessage: ChatMessage = {
      message: "How to improve sex life",
      type: 'user',
      id: uuidv4(),
    };

    const introMessage = this.createChatBotMessage(
      "Sex can be enjoyed more with lubricants and gels.\nHard erection can also be induced for more pleasured sex.", 
      { delay: 500 }
    );

    const optionsMessage = this.createChatBotMessage(
      "What do you want to learn more about?", 
      { 
        widget: "sexEnhancementOptions", 
        delay: 1000 
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, introMessage, optionsMessage],
      currentStep: "sexEnhancement",
    }));
  };

  handleSexEnhancementOptions = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    if (option === "Hard Erection") {
      const erectionInfo1 = this.createChatBotMessage(
        "Erectile dysfunction is when a man is having difficulty getting a firm erection or when a man lose an erection before or during sexual activity. There are medicines that are used for treatment of erectile dysfuction and helps induce erection.", 
        { delay: 500 }
      );

      const erectionInfo2 = this.createChatBotMessage(
        "Let me tell you one of the common and most effective product for inducing hard erection called Penegra.", 
        { delay: 1000 }
      );

      const penegraInfo = this.createChatBotMessage(
        "Penegra is a product like Viagra that used to treat erectile dysfunction. Erectile Dysfunction refers to the consistent/inability of a man to obtain an erection sufficient for satisfactory sex.\n\nPenegra helps to induce a hard erection which can last for an extended duration thereby enhancing confidence, well-being, and satisfaction. Penegra only induces a hard erection when the penis is stimulated.", 
        { delay: 1500 }
      );

      const audioIntro = this.createChatBotMessage(
        "You can click on the audio below to listen to a short introduction of Penegra in Pidgin, if you want to.", 
        { delay: 2000 }
      );

      const audioFile = this.createChatBotMessage(
        "Audio file: Introduction to Penegra", 
        { 
          widget: "penegraAudio", 
          delay: 2500 
        }
      );

      const purchaseInfo = this.createChatBotMessage(
        "You can buy it at any pharmacy or health store around you.", 
        { delay: 3000 }
      );

      const nextSteps = this.createChatBotMessage(
        "What would you like to do next?\nCall 7790 for free to speak to a counsellor.", 
        { 
          widget: "nextActionOptions", 
          delay: 3500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, erectionInfo1, erectionInfo2, penegraInfo, audioIntro, audioFile, purchaseInfo, nextSteps],
        currentStep: "nextAction",
      }));
    } else if (option === "Gels and Lubricants") {
      const lubricantsInfo = this.createChatBotMessage(
        "Lubricants, also called gels or lubes, are special fluids used during sex. They help reduce friction, discomfort, and dryness, making sex more pleasurable and preventing condoms from breaking. Lubricants come in water-based, silicone-based, or oil-based types. Water-based lubes are safe with all condoms, they don't change the vagina's pH, don't stain clothes, and wash off easily with water. Silicone and oil-based lubes should only be used with specific condom materials.\n\nClick to listen to a short introduction of Lubricant in Pidgin, if you want.", 
        { delay: 500 }
      );

      const audioFile = this.createChatBotMessage(
        "Audio file: Introduction to Lubricants", 
        { 
          widget: "lubricantAudio", 
          delay: 1000 
        }
      );

      const lubricantOptions = this.createChatBotMessage(
        "Here are some of the effective and available lubricants and gels.\n1. Fiesta Intim Gel\n2. KY Jelly \n\nClick on any of them to get their full details.", 
        { 
          widget: "lubricantOptions", 
          delay: 1500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, lubricantsInfo, audioFile, lubricantOptions],
        currentStep: "lubricantSelection",
      }));
    }
  };

  handleLubricantOptions = (lubricant: string): void => {
    const userMessage: ChatMessage = {
      message: lubricant,
      type: 'user',
      id: uuidv4(),
    };

    if (lubricant === "KY Jelly") {
      const kyJellyInfo = this.createChatBotMessage(
        "KY Jelly is a water-based, fragrance-free, non-greasy formula that quickly prepares you for sexual intimacy & eases the discomfort of personal dryness.", 
        { delay: 500 }
      );

      const kyJellyImage = this.createChatBotMessage(
        "KY Jelly Image", 
        { 
          widget: "kyJellyImage", 
          delay: 1000 
        }
      );

      const purchaseInfo = this.createChatBotMessage(
        "You can visit your nearest chemist/pharmacy to buy.", 
        { delay: 1500 }
      );

      const nextSteps = this.createChatBotMessage(
        "What would you like to do next?\nCall 7790 for free to speak to a counsellor.", 
        { 
          widget: "nextActionOptions", 
          delay: 2000 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, kyJellyInfo, kyJellyImage, purchaseInfo, nextSteps],
        currentStep: "nextAction",
      }));
    } else if (lubricant === "Fiesta Intim Gel") {
      const fiestaInfo = this.createChatBotMessage(
        "Fiesta Gels are classy and smooth, with a wet sensation for heightened sexual pleasure.\n\nHow to Use\nPour a small amount of Fiesta Intim natural gel on your palm and apply directly on your erect penis. For extra pleasure, you can also apply on the woman's intimate area.", 
        { delay: 500 }
      );

      const fiestaImage = this.createChatBotMessage(
        "Fiesta Intim Gel Image", 
        { 
          widget: "fiestaGelImage", 
          delay: 1000 
        }
      );

      const videoInfo = this.createChatBotMessage(
        "You can click to watch a video on how to use this lubricant in Pidgin.", 
        { delay: 1500 }
      );

      const videoLink = this.createChatBotMessage(
        "Watch Fiesta Gel Video", 
        { 
          widget: "fiestaGelVideo", 
          delay: 2000 
        }
      );

      const purchaseInfo = this.createChatBotMessage(
        "You can purchase it at your nearest pharmacy or health shop.", 
        { delay: 2500 }
      );

      const nextSteps = this.createChatBotMessage(
        "What would you like to do next?\nCall 7790 for free to speak to a counsellor.", 
        { 
          widget: "nextActionOptions", 
          delay: 3000 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, fiestaInfo, fiestaImage, videoInfo, videoLink, purchaseInfo, nextSteps],
        currentStep: "nextAction",
      }));
    }
  };

  handleNextAction = (action: string): void => {
    const userMessage: ChatMessage = {
      message: action,
      type: 'user',
      id: uuidv4(),
    };

    if (action === "Chat with AI /Human") {
      const response = this.createChatBotMessage(
        "This feature is not implemented yet. Please try another option.", 
        { delay: 500 }
      );

      const nextSteps = this.createChatBotMessage(
        "What would you like to do next?\nCall 7790 for free to speak to a counsellor.", 
        { 
          widget: "nextActionOptions", 
          delay: 1000 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, response, nextSteps],
        currentStep: "nextAction",
      }));
    } else if (action === "Learn other methods") {
      const enhancementOptions = this.createChatBotMessage(
        "What do you want to learn more about?", 
        { 
          widget: "sexEnhancementOptions", 
          delay: 500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, enhancementOptions],
        currentStep: "sexEnhancement",
      }));
    } else if (action === "Back to main menu") {
      const mainMenuOptions = this.createChatBotMessage(
        "I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. What do you want to know? FPM = Family Planning Method", 
        { 
          widget: "fpmOptions", 
          delay: 500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, mainMenuOptions],
        currentStep: "fpm",
      }));
    }

    // Handler for general questions
    handleGeneralQuestion = (): void => {
      const userMessage: ChatMessage = {
        message: "Ask a general question",
        type: 'user',
        id: uuidv4(),
      };

      const agentOptions = this.createChatBotMessage(
        "Do you want to be connected to a human medical professional agent or AI chatbot?",
        { 
          widget: "humanAIOptions", 
          delay: 500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, agentOptions],
        currentStep: "agentTypeSelection",
      }));
    };

  // Handler for agent type selection (human or AI)
  handleAgentTypeSelection = (type: string): void => {
    const userMessage: ChatMessage = {
      message: type,
      type: 'user',
      id: uuidv4(),
    };

    if (type === "AI chatbot") {
      const botInfo = this.createChatBotMessage(
        "Okay! Please note that I am a family planning bot and can only respond to questions relating to family planning.",
        { delay: 500 }
      );

      const askQuestion = this.createChatBotMessage(
        "What is your question?",
        { delay: 1000 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, botInfo, askQuestion],
        currentStep: "userQuestion",
      }));
    } else if (type === "Human agent") {
      const humanAgentInfo = this.createChatBotMessage(
        "You'll be connected to a human agent shortly. Please note that there might be a wait time depending on availability.",
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, humanAgentInfo],
        currentStep: "waitingForHuman",
      }));
    }
  };

  // Handler for user questions
  handleUserQuestion = (question: string): void => {
    const userMessage: ChatMessage = {
      message: question,
      type: 'user',
      id: uuidv4(),
    };

    // This is a generic response - in a real implementation, you might have more sophisticated responses
    const answer = this.createChatBotMessage(
      "Choosing the right family planning method depends on personal health, lifestyle, and preferences. It's important to consider factors like how long you want to prevent pregnancy, whether you want a hormonal or non-hormonal method, and any health conditions you may have. Consulting with a healthcare provider can help you make an informed decision. You can also call 7790 for free for more information on family planning options.",
      { delay: 500 }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, answer],
      currentStep: "default",
    }));
  };

  // Handler for more help options
  handleMoreHelpOptions = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    if (option === "Yes, I want to ask") {
      const mainMenuOptions = this.createChatBotMessage(
        "I can provide you with information about Family Planning Methods (FPM) or other sex-related questions.\n\nIf you want to be connected to a human agent, just type the word \"human\" at any time.\n\nTo see all the sex health clinics available in Nigeria, type in «clinic».\n\nWhat do you want to know? FPM = Family Planning Method",
        { 
          widget: "fpmOptions", 
          delay: 500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, mainMenuOptions],
        currentStep: "fpm",
      }));
    } else if (option === "No") {
      const feedbackRequest = this.createChatBotMessage(
        "Would you like to leave feedback for us?\n\nThis will help us to improve the project and help more people.",
        { delay: 500 }
      );

      const goodbye = this.createChatBotMessage(
        "Thanks for your time. I look forward to chatting with you again soon. If you need any additional information on family planning and contraception, I'm available 24/7! 👍",
        { delay: 1500 }
      );

      const mainMenuOptions = this.createChatBotMessage(
        "I can provide you with information about Family Planning Methods (FPM) or other sex-related questions.\n\nIf you want to be connected to a human agent, just type the word \"human\" at any time.\n\nTo see all the sex health clinics available in Nigeria, type in «clinic».\n\nWhat do you want to know? FPM = Family Planning Method",
        { 
          widget: "fpmOptions", 
          delay: 2500 
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, feedbackRequest, goodbye, mainMenuOptions],
        currentStep: "fpm",
      }));
    }
  };
  };
}

export default ActionProvider;
