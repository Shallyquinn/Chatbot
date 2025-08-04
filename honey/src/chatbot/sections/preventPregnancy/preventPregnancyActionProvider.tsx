// src/chatbot/sections/preventPregnancy/preventPregnancyTypes.tsx
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatbotState } from "../../types";
import {
  CreateChatBotMessage,
  SetStateFunc,
  PreventPregnancyProviderInterface,
  ContraceptionType,
  EmergencyProduct,
  PreventionDuration,
  ContraceptiveMethod,
  getMethodOptionsForDuration
} from "./preventPregnancyTypes";


class PreventPregnancyActionProvider implements PreventPregnancyProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;
  }

  // =============================================================================
  // PREVENT PREGNANCY INITIATION
  // =============================================================================

  handlePreventPregnancyInitiation = (): void => {
    const userMessage: ChatMessage = {
      message: "How to prevent pregnancy",
      type: "user",
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      "I see! 👍\n\nYou are at the right place, I can assist you with this.",
      { delay: 500 }
    );

    const followUpMessage = this.createChatBotMessage(
      "What kind of contraception do you want to know about?",
      { 
        delay: 1000,
        widget: "contraceptionTypeOptions"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, followUpMessage],
      currentStep: "contraception",
    }));
  };

  // =============================================================================
  // CONTRACEPTION TYPE SELECTION
  // =============================================================================

  handleContraceptionTypeSelection = (type: string): void => {
    const userMessage: ChatMessage = {
      message: type,
      type: "user",
      id: uuidv4(),
    };

    if (type === "Emergency") {
      this.handleEmergencyPath(userMessage);
    } else if (type === "Prevent in future") {
      this.handlePreventFuturePath(userMessage);
    }
  };

  // =============================================================================
  // EMERGENCY CONTRACEPTION PATH
  // =============================================================================

  private handleEmergencyPath = (userMessage: ChatMessage): void => {
    const responseMessage = this.createChatBotMessage(
      "To avoid pregnancy after unprotected sex, you can take emergency contraceptive pills.\n\nEmergency pills are very effective when taken within 24 to 72 hours after unprotected sex. You are advised to not take it more than 3 times in a month. If you are ovulating, you should use an alternative contraceptive plan (condoms).",
      { delay: 500 }
    );

    const productMessage = this.createChatBotMessage(
      "Let me tell you some of the effective and available emergency contraceptive pills:\n1. Postpill\n2. Postinor-2",
      { delay: 1000 }
    );

    const selectionMessage = this.createChatBotMessage(
      "Which product do you want to learn about?",
      { 
        delay: 1500,
        widget: "emergencyProductOptions"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, productMessage, selectionMessage],
      currentStep: "emergencyProduct",
    }));
  };

  // =============================================================================
  // EMERGENCY PRODUCT SELECTION
  // =============================================================================

  handleEmergencyProductSelection = (product: string): void => {
    const userMessage: ChatMessage = {
      message: product,
      type: "user", 
      id: uuidv4(),
    };

    let productInfo = "";
    let audioWidget = "";

    if (product === "Postpill") {
      productInfo = "Postpill is a one-dose emergency contraceptive pill by DKT. It contains 1.5 mg Levongestrel. It should be taken within 72 hours (3 days) of unprotected sex.\n\nThe sooner you take it, the more effective it is. It is 95% effective when taken within 24 hours of unprotected sex.\n\nIf more than 120 hours (5 days) have passed since unprotected sex, it won't be effective. In such a case, you should consult a healthcare provider.";
      audioWidget = "postpillAudio";
    } else if (product === "Postinor-2") {
      productInfo = "Postinor-2 is an emergency contraceptive containing levonorgestrel. Take it within 72 hours of unprotected sex for best results.\n\nIt works by preventing or delaying ovulation. The sooner you take it after unprotected sex, the more effective it is.\n\nIt should not be used as a regular contraceptive method.";
      audioWidget = "postinor2Audio";
    }

    const responseMessage = this.createChatBotMessage(productInfo, { delay: 500 });

    const audioMessage = this.createChatBotMessage(
      `Click to listen to a short introduction of ${product} in Pidgin, if you want to.`,
      { 
        delay: 1000,
        widget: audioWidget
      }
    );

    const followUpMessage = this.createChatBotMessage(
      "Do you want to find out about other family planning methods?",
      { 
        delay: 1500,
        widget: "learnMoreMethods"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, audioMessage, followUpMessage],
      currentStep: "methodDetails",
    }));
  };

  // =============================================================================
  // PREVENT FUTURE PATH
  // =============================================================================

  private handlePreventFuturePath = (userMessage: ChatMessage): void => {
    const responseMessage = this.createChatBotMessage(
      "Alright\n\nI am happy to provide you with more information about family planning methods that are effective in preventing pregnancy.",
      { delay: 500 }
    );

    const durationMessage = this.createChatBotMessage(
      "For how long do you want to prevent pregnancy?",
      { 
        delay: 1000,
        widget: "preventionDurationOptions"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, durationMessage],
      currentStep: "duration",
    }));
  };

  // =============================================================================
  // PREVENTION DURATION SELECTION
  // =============================================================================

  handlePreventionDurationSelection = (duration: string): void => {
    const userMessage: ChatMessage = {
      message: duration,
      type: "user",
      id: uuidv4(),
    };

    let responseMessage: ChatMessage;
    let widget = "";

    const durationKey = duration as PreventionDuration;
    const availableMethods = getMethodOptionsForDuration(durationKey);

    switch (duration) {
      case "Up to 1 year":
        responseMessage = this.createChatBotMessage(
          "The short-term family planning methods are:\n\n1. Daily contraceptive pills\n2. The barrier contraceptives (diaphragm, female condom, male condom)",
          { delay: 500 }
        );
        widget = "shortTermMethods";
        break;

      case "1 - 2 years":
        responseMessage = this.createChatBotMessage(
          "If you want to prevent pregnancy within 1-2 years, you can use any of the short-acting family planning methods or injectables.",
          { delay: 500 }
        );
        widget = "mediumTermMethods";
        break;

      case "3-4 years":
        responseMessage = this.createChatBotMessage(
          "For 3-4 years of protection, you can use medium-term methods like injectables, IUD, IUS, or implants.",
          { delay: 500 }
        );
        widget = "longTermMethods";
        break;

      case "5-10 years":
        responseMessage = this.createChatBotMessage(
          "For long-term protection (5-10 years), the most effective methods are IUD, IUS, and implants.",
          { delay: 500 }
        );
        widget = "extendedLongTermMethods";
        break;

      case "Permanently":
        responseMessage = this.createChatBotMessage(
          "For permanent prevention of pregnancy, you can consider sterilization methods. These are permanent and irreversible procedures.",
          { delay: 500 }
        );
        widget = "permanentMethods";
        break;

      default:
        responseMessage = this.createChatBotMessage(
          "Let me show you the available contraceptive methods.",
          { delay: 500 }
        );
        widget = "shortTermMethods";
    }

    const methodMessage = this.createChatBotMessage(
      "Click on any of the methods to get more information about it:",
      { 
        delay: 1000,
        widget: widget
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, methodMessage],
      currentStep: "methodDetails",
    }));
  };

  // =============================================================================
  // METHOD SELECTION HANDLING
  // =============================================================================

  handleMethodOptionsSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    const methodInfo = this.getMethodInformation(method as ContraceptiveMethod);
    const responseMessage = this.createChatBotMessage(methodInfo.description, { delay: 500 });

    let audioMessage: ChatMessage | null = null;
    if (methodInfo.audioWidget) {
      audioMessage = this.createChatBotMessage(
        methodInfo.audioPrompt,
        { 
          delay: 1000,
          widget: methodInfo.audioWidget
        }
      );
    }

    const messages = audioMessage 
      ? [userMessage, responseMessage, audioMessage]
      : [userMessage, responseMessage];

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: "methodDetails",
    }));
  };

  // =============================================================================
  // METHOD INFORMATION DATABASE
  // =============================================================================

  private getMethodInformation = (method: ContraceptiveMethod) => {
    const methodData: Record<ContraceptiveMethod, {
      description: string;
      audioWidget?: string;
      audioPrompt?: string;
    }> = {
      "Daily pills": {
        description: "Daily pills are combined oral contraceptive pills for pregnancy prevention, dermatological and gynecological benefits.\n\nThey are very effective (99%) when used correctly. They must be taken daily at the same time. They can help regulate menstrual cycles and reduce menstrual cramps.",
        audioWidget: "dailyPillsAudio",
        audioPrompt: "Click to listen to a short introduction of daily pills in Pidgin, if you want to."
      },
      "Diaphragm": {
        description: "This will give you every detail about the diaphragm, including an audio explanation and videos on how to use it.\n\nThe path has no partner clinic referral.",
        audioWidget: "diaphragmAudio", 
        audioPrompt: "Click to listen to more about the diaphragm."
      },
      "Female condom": {
        description: "Female condoms are inserted into the vagina before sex. They provide protection against pregnancy and sexually transmitted infections.\n\nThey are 95% effective when used correctly and can be inserted up to 8 hours before sex.",
        audioWidget: "femaleCondomAudio",
        audioPrompt: "Click to learn more about female condoms."
      },
      "Male condom": {
        description: "Male condoms are worn on the penis during sex. They are 98% effective when used correctly and also protect against sexually transmitted infections.\n\nThey are widely available and have no side effects.",
        audioWidget: "maleCondomAudio",
        audioPrompt: "Click to learn more about male condoms."
      },
      "Injectables": {
        description: "Injectable contraceptives are long-acting hormonal methods given as shots. They provide protection for 3 months (Sayana Press) or 3-4 months (Depo-Provera).\n\nThey are over 99% effective and don't require daily attention.",
        audioWidget: "injectablesAudio",
        audioPrompt: "Click to learn more about injectables."
      },
      "IUD": {
        description: "The Intrauterine Device (IUD) is a small T-shaped device inserted into the uterus. It can prevent pregnancy for 5-10 years depending on the type.\n\nIt's over 99% effective and can be removed at any time if you want to get pregnant.",
        audioWidget: "iudAudio",
        audioPrompt: "Click to learn more about IUD."
      },
      "IUS": {
        description: "The Intrauterine System (IUS) is similar to the IUD but releases hormones. It can prevent pregnancy for 3-5 years.\n\nIt's over 99% effective and may reduce menstrual bleeding.",
        audioWidget: "hormonalIUSAudio",
        audioPrompt: "Click to learn more about IUS."
      },
      "Implants": {
        description: "Contraceptive implants are small rods inserted under the skin of your arm. They release hormones and can prevent pregnancy for 3-4 years.\n\nThey are over 99% effective and reversible.",
        audioWidget: "implantsAudio",
        audioPrompt: "Click to learn more about implants."
      },
      "Female sterilisation": {
        description: "Female sterilization (tubal ligation) is a permanent method where the fallopian tubes are blocked or cut.\n\nIt's over 99% effective but should be considered permanent. It requires surgery.",
        audioWidget: "sterilizationAudio",
        audioPrompt: "Click to learn more about female sterilization."
      },
      "Male sterilisation": {
        description: "Male sterilization (vasectomy) is a permanent method where the vas deferens are cut or blocked.\n\nIt's over 99% effective but should be considered permanent. It's a simpler procedure than female sterilization.",
        audioWidget: "vasectomyAudio", 
        audioPrompt: "Click to learn more about vasectomy."
      }
    };

    return methodData[method] || {
      description: "Please consult with a healthcare provider about this contraceptive method for detailed information."
    };
  };
}

export default PreventPregnancyActionProvider;
export type { PreventPregnancyProviderInterface };