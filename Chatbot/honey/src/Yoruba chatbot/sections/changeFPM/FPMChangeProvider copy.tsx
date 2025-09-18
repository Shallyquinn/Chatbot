// src/chatbot/FPMChangeProvider.tsx
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatStep, ChatbotState } from "../../types";
import {
  FPMChangeProviderInterface,
  CreateChatBotMessage,
  SetStateFunc,
} from "./fpmTypes";
import { getSpecificConcernResponse, responses } from "./fpmResponses";
import {
  UserResponse,
  FPMInteraction,
  ConversationMessage,
  RESPONSE_CATEGORIES,
  RESPONSE_TYPES,
  createConversationMessage,
  createFPMInteraction,
} from "../../database/DataMapping";

/**
 * FPMChangeProvider handles the logic for changing or stopping family planning methods.
 * It manages user interactions related to concerns, current methods, and next actions.
 */

class FPMChangeProvider implements FPMChangeProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;

  // Store user's current selection context
  // Getter for current method from state
  private get currentMethod(): string {
    return this.state.currentFPMMethod || "";
  }

  // Setter for current method to state
  private set currentMethod(value: string) {
    console.log("🔧 Setting currentMethod in state:", value);
    this.setState((prev: ChatbotState) => ({
      ...prev,
      currentFPMMethod: value,
    }));
  }

  // Getter for user intention from state
  private get userIntention(): string {
    return this.state.userIntention || "";
  }

  // Setter for user intention to state
  private set userIntention(value: string) {
    console.log("🔧 Setting userIntention in state:", value);
    this.setState((prev: ChatbotState) => ({
      ...prev,
      userIntention: value,
    }));
  }

  // Getter for current concern type from state
  private get currentConcernType(): string {
    return this.state.currentConcernType || "";
  }

  // Setter for current concern type to state
  private set currentConcernType(value: string) {
    console.log("🔧 Setting currentConcernType in state:", value);
    this.setState((prev: ChatbotState) => ({
      ...prev,
      currentConcernType: value,
    }));
  }
  // Store data locally for immediate use
  private currentMethodLocal: string = "";
  private currentConcernTypeLocal: string = "";
  private userIntentionLocal: string = "";
  private sessionId: string;
  private messageSequence: number = 1;

  // Store flow data for database
  private satisfaction: string = "";
  private switchReason: string = "";
  private kidsInFuture: string = "";
  private timing: string = "";

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
    sessionId: string = "default-session"
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;
    this.sessionId = sessionId;
  }
  // Handler for selecting current FPM in the "switch" flow
  handleSwitchCurrentFPMSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    // Store the selected method
    this.currentMethod = method;

    // Ask about satisfaction with the current method
    const satisfactionQuestion = this.createChatBotMessage(
      "How has the method been working for you? Would you say you are somewhat satisfied, or not at all satisfied with your method?",
      {
        widget: "satisfactionOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, satisfactionQuestion],
      currentStep: "satisfactionAssessment",
    }));
  };

  // Handler for FPM change selection (first step after selecting "Change/stop current FPM")
  handleFPMChangeSelection = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: "user",
      id: uuidv4(),
    };

    const concernMessage = this.createChatBotMessage(
      "I am sorry to hear that you are dissatisfied with the current family planning method.\n Could you tell me a little more about the situation? What is your concern? \n\n FP = Family Planning method (contraceptive)",
      {
        widget: "fpmConcernOptions",
        delay: 500,
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
      type: "user",
      id: uuidv4(),
    };

    // Store the user's intention
    if (option === "Concerned about FP") {
      this.userIntention = "concerned";
    } else if (option === "Want to switch FP") {
      this.userIntention = "switch";
    } else if (option === "Want to stop FP") {
      this.userIntention = "stop";
    }

    let responseMessage: ChatMessage;
    let nextStep: string;

    if (this.userIntention === "switch") {
      responseMessage = this.createChatBotMessage(
        "Okay, I see.\n\nLet me ask you a few questions to better understand what kind of method would suit best for you.",
        { delay: 500 }
      );

      const methodQuestion = this.createChatBotMessage(
        "Which method are you currently using?\nMethod you use now",
        {
          widget: "switchFPMOptions",
          delay: 1000,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          responseMessage,
          methodQuestion,
        ],
        currentStep: "switchCurrentFPM",
      }));
    } else {
      // For concerned and stop - ask which method they're using
      responseMessage = this.createChatBotMessage(
        "Ok, I can help you. Which method are you currently using?\noptions(choose)",
        {
          widget:
            this.userIntention === "stop"
              ? "stopFPMOptions"
              : "currentFPMOptions",
          delay: 500,
        }
      );

      nextStep =
        this.userIntention === "stop" ? "stopCurrentFPM" : "currentFPM";

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        currentStep: nextStep as ChatbotState["currentStep"],
      }));
    }
  };

  // Handler for current FPM selection
  handleCurrentFPMSelection = (method: string): void => {
    console.log("🔍 handleCurrentFPMSelection called with:", method);
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    // Store the current method
    this.currentMethod = method;
    // Create database records
    this.createUserResponseRecord(method, "current_fpm_selection", "Which method are you currently using?", "currentFPMOptions");
    this.createConversationRecord(method, "user", "currentFPM");
    // Add this right after storing the method
    console.log("🔍 this.currentMethod AFTER storing:", this.currentMethod);
    console.log("🔍 Type of this.currentMethod:", typeof this.currentMethod);
    console.log("🔍 Length of this.currentMethod:", this.currentMethod.length);
    console.log("All available response methods:", Object.keys(responses));
    console.log("Method stored vs available:", {
      stored: this.currentMethod,
      available: Object.keys(responses).includes(this.currentMethod),
    }); // debug log

    const concernTypeQuestion = this.createChatBotMessage(
      "Ok, I can help you. What specific concern do you have with this method?\nPlease select a concern type",
      {
        widget: "fpmConcernTypeOptions",
        delay: 500,
      }
    );

    // Store method in state for persistence AND locally
    this.setState((prev: ChatbotState) => {
      console.log("🔧 setState callback - storing method:", method);
      return {
        ...prev,
        messages: [...prev.messages, userMessage, concernTypeQuestion],
        currentFPMMethod: method, // Store in state for persistence
        currentStep: "fpmConcernType" as ChatStep,
      };
    });

    this.createConversationRecord(concernTypeQuestion.message, "bot", "fpmConcernType");
    console.log("✅ State update initiated for method:", method);
  };


  // Handler for satisfaction assessment (switch flow)
  handleSatisfactionAssessment = (satisfaction: string): void => {
    const userMessage: ChatMessage = {
      message: satisfaction,
      type: "user",
      id: uuidv4(),
    };

    this.satisfaction = satisfaction;

    const reasonQuestion = this.createChatBotMessage(
      "May I know why do you want to switch?\nPick a reason why",
      {
        widget: "switchReasonOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, reasonQuestion],
      currentStep: "switchReason",
    }));
  };

  // Handler for switch reason
  handleSwitchReason = (reason: string): void => {
    const userMessage: ChatMessage = {
      message: reason,
      type: "user",
      id: uuidv4(),
    };

    this.switchReason = reason;

    const recommendationQuestion = this.createChatBotMessage(
      "Would you like to know about other methods that you may like better?",
      {
        widget: "methodRecommendationOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, recommendationQuestion],
      currentStep: "methodRecommendation",
    }));
  };

  // Handler for method recommendation inquiry
  handleMethodRecommendationInquiry = (response: string): void => {
    const userMessage: ChatMessage = {
      message: response,
      type: "user",
      id: uuidv4(),
    };

    if (response === "Yes") {
      const introMessage = this.createChatBotMessage(
        "OK. Let me ask you a few questions to better understand what kind of method would be good for you.",
        { delay: 500 }
      );

      const kidsQuestion = this.createChatBotMessage(
        "Would you like to have kids in the future or not?",
        {
          widget: "kidsInFutureOptions",
          delay: 1000,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, introMessage, kidsQuestion],
        currentStep: "kidsInFuture",
      }));
    } else {
      const nextActions = this.createChatBotMessage(
        "What would you like to do next?",
        {
          widget: "fpmNextActionOptions",
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, nextActions],
        currentStep: "fpmNextAction",
      }));
    }
  };

  // Handler for kids in future
  handleKidsInFuture = (response: string): void => {
    const userMessage: ChatMessage = {
      message: response,
      type: "user",
      id: uuidv4(),
    };

    this.kidsInFuture = response;

    if (response === "Yes, I want more kids") {
      const timingQuestion = this.createChatBotMessage(
        "How many years would you like to wait from now before you have another child?\nMenu",
        {
          widget: "timingOptions",
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, timingQuestion],
        currentStep: "timing",
      }));
    } else {
      this.proceedToImportantFactors(userMessage);
    }
  };

  // Handler for timing selection
  handleTimingSelection = (timing: string): void => {
    const userMessage: ChatMessage = {
      message: timing,
      type: "user",
      id: uuidv4(),
    };

    this.timing = timing;
    this.proceedToImportantFactors(userMessage);
  };

  // Helper method to proceed to important factors
  private proceedToImportantFactors = (userMessage: ChatMessage): void => {
    const thanksMessage = this.createChatBotMessage(
      "Okay, thank you for sharing this!",
      { delay: 500 }
    );

    const factorsQuestion = this.createChatBotMessage(
      "When you are picking a contraceptive method, which factor is the most important to you?\nPick one factor",
      {
        widget: "importantFactorsOptions",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, thanksMessage, factorsQuestion],
      currentStep: "importantFactors",
    }));
  };

  // Handler for important factors
  handleImportantFactors = (factor: string): void => {
    const userMessage: ChatMessage = {
      message: factor,
      type: "user",
      id: uuidv4(),
    };

    const response = this.getFactorBasedRecommendation(factor);

    let responseMessage: ChatMessage;
    let nextStep = "fpmNextAction";

    if (factor === "No effect on menstrual🩸") {
      responseMessage = this.createChatBotMessage(
        "When you are picking a contraceptive method, what are the things that are important to you?",
        {
          widget: "menstrualFlowOptions",
          delay: 500,
        }
      );
      nextStep = "menstrualFlow";
    } else {
      responseMessage = this.createChatBotMessage(response, { delay: 500 });

      const nextActions = this.createChatBotMessage(
        "What would you like to do next?",
        {
          widget: "fpmNextActionOptions",
          delay: 1000,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage, nextActions],
        currentStep: "fpmNextAction",
      }));
      return;
    }

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: nextStep as ChatbotState["currentStep"],
    }));
  };

  // Helper for factor-based recommendation
  private getFactorBasedRecommendation(factor: string): string {
    const recommendations: Record<string, string> = {
      // Core effectiveness and safety (from CSV)
      "Efficiency in prevention":
        "The most effective methods are implants and IUDs.\nOther effective methods to consider are injectables, daily pills, and diaphragms.",
      "Should be safe to use":
        "Absolutely.\n\nAll methods we recommend are chosen to keep you safe and healthy.",

      // Convenience and lifestyle (consolidated)
      "Be easy and convenient":
        "Of all methods that are easy to use, the most effective method is the Implants.\n\nOther simple methods to adopt are the Injectables and the Pills.\n\nThe least effective (but still 99%) method you can use is Condoms.",
      "Easy to use":
        "Of all methods that are easy to use, the most effective method is the Implants.\n\nOther simple methods to adopt are the Injectables and the Pills.\n\nThe least effective (but still 99%) method you can use is Condoms.",
      "Long lasting":
        "If you want a long-lasting contraceptive method, the most effective options are Implants (3-5 years) or IUDs (5-10 years). These require minimal maintenance once inserted.",

      // Privacy and discretion (consolidated)
      "Discreet from others":
        "If you're looking for a discreet method, the Implant is the most effective option. Other effective hidden methods includes Injectables and Diaphragm.",
      Discreet:
        "If you're looking for a discreet method, the Implant is the most effective option. Other effective hidden methods includes Injectables and Diaphragm.",

      // Health and side effects (from CSV)
      "No pain/cramp/vomit":
        "The methods that are completely painless are the condoms and diaphrams but they are not as effective as the injectibles, implants and the IUDs. With the injectibles and implants, most people do not experience side effects but some people experience mild headaches. With the IUDs most people do not experience any discomfort after insertion but some people report mild abdominal pain.",
      "No weight gain":
        "Ok, if you do not want to gain weight, the most effective method to adopt is the IUD.\n\nOther method to adopt is the Diaphragm and the least effective methods you can use are the condoms, abstinence from sex on fertile days, and the withdrawal method.",
      "No effect on sex life":
        "The effects of contraceptive methods on sex life can vary depending on individual experiences and preferences.\n\nSome methods, like hormonal contraceptives (such as birth control pills, patches, or IUDs), may have side effects like changes in libido, mood swings, or dryness.\n\nHowever, these effects are not universal, and many individuals use contraceptives without experiencing negative impacts on their sex lives.\n\nOther non-hormonal methods like condoms or copper IUDs typically don't affect libido.\nUltimately, it's essential to discuss any concerns or potential side effects with a healthcare provider to find the best option that suits your needs and lifestyle.",
      "No hormones":
        "If you prefer a non-hormonal method, the Copper IUD is the most effective option. Condoms and diaphragms are also hormone-free but require consistent use.",

      // Future planning (from CSV)
      "Be able have kids after":
        "Okay, I see.\n\nThe most effective methods for quick return to fertility are Implants and IUD.\n\nOther effective methods are Daily Pills and Diaphragm and the least effective methods you can use are the condoms, abstinence from sex on fertile days, and the withdrawal method.",

      // Control and flexibility (consolidated)
      "Stop without clinic":
        "Okay, I see.\n\nSome of the effective methods you can stop easily without going to the clinic are the injectables, the piils and the diaphragm.\n\nOther least effective methods that can easily stop using are the condoms, abstinence from sex on fertile days, and the withdrawal method.",
      "Can stop anytime":
        "If you want immediate control, condoms and daily pills can be stopped anytime. Diaphragms also offer this flexibility. For longer-term methods, injectables wear off naturally in 3 months.",

      // Cost and protection (practical concerns)
      Affordable:
        "For cost-effective options, condoms and daily pills are generally the most affordable. Injectables may also be budget-friendly depending on your healthcare coverage. Call 7790 for local pricing information.",
      "Protects against STIs":
        "Condoms are the only contraceptive method that also protects against sexually transmitted infections (STIs). For dual protection, you might consider using condoms along with another highly effective method.",
    };

    return (
      recommendations[factor] ||
      `Thank you for sharing your preference. For your specific needs regarding ${factor.toLowerCase()}, I recommend speaking with a healthcare provider at 7790 for personalized guidance.`
    );
  }

  // Handler for menstrual flow preference
  handleMenstrualFlowPreference = (preference: string): void => {
    const userMessage: ChatMessage = {
      message: preference,
      type: "user",
      id: uuidv4(),
    };

    const response = this.getMenstrualFlowResponse(preference);
    const responseMessage = this.createChatBotMessage(response, { delay: 500 });

    const nextActions = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "fpmNextActionOptions",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, nextActions],
      currentStep: "fpmNextAction",
    }));
  };

  // Helper for menstrual flow response
  private getMenstrualFlowResponse(preference: string): string {
    const responses: Record<string, string> = {
      // From CSV data (primary options with emoji)
      "No INcrease of🩸flow":
        "If you want to avoid increasing menstrual flow, the most effective methods are Implants.\n\nOther methods to adopt includes the Injectables and Pills.",
      "No DEcrease of🩸flow":
        "If you want to avoid decrease/stop of menstrual flow, The most effective methods is IUD.\n\nOther method to adopt is the pills.",

      // Additional standard options for broader compatibility
      "No change in menstrual flow":
        "If you prefer a method that does not change your menstrual flow, you may consider the Copper IUD or condoms. These methods typically do not affect your periods. Please consult a healthcare provider for more personalized advice.",
      "Lighter or no periods":
        "If you would like lighter or no periods, hormonal IUDs, implants, or injections may be suitable options. These methods can reduce menstrual bleeding or even stop periods for some users. Please consult a healthcare provider for more information.",
      "Regular periods":
        "If having regular periods is important to you, daily pills may help regulate your cycle. Please consult a healthcare provider to discuss the best option for your needs.",
    };

    return (
      responses[preference] ||
      "Thank you for sharing your preference. For more information on how different contraceptive methods affect menstrual flow, please call 7790 to speak with a healthcare professional."
    );
  }

  // Handler for FPM concern type selection
  handleFPMConcernTypeSelection = (concernType: string): void => {
    console.log("🔍 handleFPMConcernTypeSelection called with:", concernType);
    console.log(
      "🔍 this.state.currentFPMMethod at start:",
      this.state.currentFPMMethod
    );
    console.log("🔍 Type of this.currentMethod:", typeof this.state.currentFPMMethod);
    console.log(
      "🔍 Length of this.currentMethod:",
      this.state.currentFPMMethod ? this.state.currentFPMMethod.length : 0
    );
    console.log('🔍 this.currentMethod === "":', this.currentMethod === "");
    console.log("🔍 this.userIntention:", this.userIntention);
    console.log("🔍 this.currentMethod (via getter):", this.currentMethod);
    console.log("🔍 Full state:", this.state);

    const userMessage: ChatMessage = {
      message: concernType,
      type: "user",
      id: uuidv4(),
    };

    // FIXED: Use the locally stored method first, then fallback to state
    const methodToUse = this.currentMethodLocal || this.state.currentFPMMethod || "";
    this.currentConcernTypeLocal = concernType;

    console.log("🔧 Using method for response:", methodToUse);
    console.log("About to call getSpecificConcernResponse with:", {
      method: methodToUse,
      concernType: concernType,
    });

    // Create database records
    this.createUserResponseRecord(concernType, "fpm_concern_selection", "What specific concern do you have?", "fpmConcernTypeOptions");
    this.createConversationRecord(concernType, "user", "fpmConcernType");

    // FIXED: Get specific response based on method and concern type
    const response = getSpecificConcernResponse(methodToUse, concernType);
    console.log("Response received:", response);

    const responseMessage = this.createChatBotMessage(response, { delay: 500 });

    let followUpMessage = null;
    if (concernType === "Side effects") {
      followUpMessage = this.createChatBotMessage(
        "Are you experiencing any of the mentioned side effects, which one?",
        { delay: 1000 }
      );
    }

    const nextActions = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "fpmNextActionOptions",
        delay: followUpMessage ? 1500 : 1000,
      }
    );

    const messages = [userMessage, responseMessage];
    if (followUpMessage) messages.push(followUpMessage);
    messages.push(nextActions);

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentConcernType: concernType, // store concern type in state
      currentStep: "fpmNextAction",
    }));

    // Create database records for bot responses
    this.createConversationRecord(response, "bot", "fpmConcernType");
    if (followUpMessage) {
      this.createConversationRecord(followUpMessage.message, "bot", "fpmConcernType");
    }
    this.createConversationRecord(nextActions.message, "bot", "fpmNextAction");

    // Create FPM interaction record
    this.createFPMInteractionRecord();
  };

  // Handler for stop FP flow
  handleStopFPMSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    this.currentMethod = method;

    const reasonQuestion = this.createChatBotMessage(
      "Okay, thanks for sharing!\nCan you tell me why do you want to stop using this method?\nFP = Family planning method\nOptions(Choose one)",
      {
        widget: "stopReasonOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, reasonQuestion],
      currentStep: "stopReason",
    }));
  };

  // Handler for stop reason
  handleStopReason = (reason: string): void => {
    const userMessage: ChatMessage = {
      message: reason,
      type: "user",
      id: uuidv4(),
    };

    const counselingResponse = this.createChatBotMessage(
      "Okay, I understand and I am sorry you are experiencing these issues.\n\nPlease call 7790 and request to speak to a nurse counsellor to direct and counsel you on better options for you.",
      { delay: 500 }
    );

    const nextActions = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "fpmNextActionOptions",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        counselingResponse,
        nextActions,
      ],
      currentStep: "fpmNextAction",
    }));
  };

  // Handler for side effect selection
  handleFPMSideEffectSelection = (sideEffect: string): void => {
    const userMessage: ChatMessage = {
      message: sideEffect,
      type: "user",
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
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, nextActions],
      currentStep: "fpmNextAction",
    }));
  };

  // Handler for final feedback
  handleFinalFeedback = (feedback: string): void => {
    const userMessage: ChatMessage = {
      message: feedback,
      type: "user",
      id: uuidv4(),
    };

    if (feedback === "Yes") {
      const thankYou = this.createChatBotMessage(
        "Thank you for your feedback! I am happy that I was of great service to you. Your input helps us improve our service. If you need any additional information on family planning and contraception, I'm available 24/7!. I look forward to chatting with you again soon. 👍",
        { delay: 500 }
      );

      const callInfo = this.createChatBotMessage(
        'If you want to speak to an agent for further enquiries and discussion, please call 7790.\n\nIf you want to be connected to a medical professional agent here in chat, just type the word "human".',
        { delay: 1000 }
      );

      const moreHelp = this.createChatBotMessage(
        "Can I help you with anything else?",
        {
          widget: "moreHelpOptions",
          delay: 1500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, thankYou, callInfo, moreHelp],
        currentStep: "moreHelp",
      }));
    } else if (feedback === "No") {
      const sorryMessage = this.createChatBotMessage(
        "I'm sorry I couldn't fully address your concerns. For more personalized assistance, please call 7790 to speak with a healthcare professional.",
        { delay: 500 }
      );

      const moreHelp = this.createChatBotMessage(
        "Can I help you with anything else?",
        {
          widget: "moreHelpOptions",
          delay: 1000,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, sorryMessage, moreHelp],
        currentStep: "moreHelp",
      }));
    } else {
      const goodbye = this.createChatBotMessage(
        "Thanks for your time. I look forward to chatting with you again soon. If you need any additional information on family planning and contraception, I'm available 24/7! 👍",
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, goodbye],
        currentStep: "default",
      }));
    }
  };

  // Handler for FPM next action
  handleFPMNextAction = (action: string): void => {
    const userMessage: ChatMessage = {
      message: action,
      type: "user",
      id: uuidv4(),
    };

    if (action === "End this chat") {
      const feedbackRequest = this.createChatBotMessage(
        "Did I answer your question?",
        {
          widget: "feedbackOptions",
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, feedbackRequest],
        currentStep: "feedback",
      }));
    } else if (action === "Ask more questions") {
      const response = this.createChatBotMessage("Okay!", { delay: 500 });
      const questionPrompt = this.createChatBotMessage(
        "Please note that I am a family planning bot and can only respond to questions relating to family planning. What is your question?",
        { delay: 1000 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, response, questionPrompt],
        currentStep: "userQuestion",
      }));
    } else if (action === "Talk to AI / Human") {
      const agentQuestion = this.createChatBotMessage(
        "Do you want to be connected to a human medical professional agent or AI chatbot?",
        {
          widget: "humanAIOptions",
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, agentQuestion],
        currentStep: "humanAISelection",
      }));
    } else if (action === "Find nearest clinic") {
      const clinicMessage = this.createChatBotMessage(
        "I can help you find the nearest clinic, please confirm your location or your city/area name.",
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, clinicMessage],
        currentStep: "locationInput",
      }));
    }
  };
}

export default FPMChangeProvider;
