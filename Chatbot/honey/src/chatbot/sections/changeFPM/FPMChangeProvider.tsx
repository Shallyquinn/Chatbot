// src/chatbot/FPMChangeProvider.tsx - FIXED VERSION
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatStep, ChatbotState } from "../../types";
import {
  FPMChangeProviderInterface,
  CreateChatBotMessage,
  SetStateFunc,
} from "./fpmTypes";
import { getSpecificConcernResponse } from "./fpmResponses";
import { ApiService } from "@/services/api";

/**
 * FPMChangeProvider handles the logic for changing or stopping family planning methods.
 * It manages user interactions related to concerns, current methods, and next actions.
 */

class FPMChangeProvider implements FPMChangeProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  api: ApiService;

  // REMOVED: Problematic getter/setter pattern
  // Store these locally instead of relying on state getters/setters
  private currentMethodLocal: string = "";
  // private userIntentionLocal: string = "";
  private currentConcernTypeLocal: string = "";

  private satisfaction: string = "";
  private switchReason: string = "";
  private kidsInFuture: string = "";
  private timing: string = "";

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
    apiClient: ApiService
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state; 
    this.api = apiClient

     const originalSetState = this.setState;
    this.setState = (updater) => {
      originalSetState((prev) => {
        const newState = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem("chat_state", JSON.stringify(newState));
        return newState;
      });
    };
    
  }

  // FIXED: Handler for selecting current FPM method
  handleCurrentFPMSelection = async(method: string): Promise<void> => {
    console.log("🔍 handleCurrentFPMSelection called with:", method);
    console.log("🔍 Current state before update:", this.state.currentFPMMethod);

    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };
    await this.api.createFpmInteraction({current_fpm_method:method})
    // Store method locally for immediate use AND in state for persistence
    // this.currentMethodLocal = method;
    // console.log("🔧 Stored method locally:", this.currentMethodLocal);

    const concernTypeQuestion = this.createChatBotMessage(
      "Ok, I can help you. What specific concern do you have with this method?\nPlease select a concern type",
      {
        widget: "fpmConcernTypeOptions",
        delay: 500,
      }
    );

    // Store method in state for persistence across instances
    this.setState((prev: ChatbotState) => {
      console.log("🔧 setState callback - storing method:", method);
      return {
        ...prev,
        messages: [...prev.messages, userMessage, concernTypeQuestion],
        currentFPMMethod: method, // This will persist across ActionProvider instances
        currentStep: "fpmConcernType" as ChatStep,
      };
      
    });

    console.log("🔍 State update initiated for method:", method);
  };

  // FIXED: Handler for FPM concern type selection
  handleFPMConcernTypeSelection = async(concernType: string): Promise<void>=> {
    console.log("🔍 handleFPMConcernTypeSelection called with:", concernType);
    console.log("🔍 currentMethodLocal:", this.currentMethodLocal);
    console.log("🔍 this.state.currentFPMMethod:", this.state.currentFPMMethod);
    console.log("🔍 Full state object:", this.state);

    const userMessage: ChatMessage = {
      message: concernType,
      type: "user",
      id: uuidv4(),
    };

    // Use local method first, fallback to state if needed
    const methodToUse =
      this.state.currentFPMMethod || this.currentMethodLocal || "";
      await this.api.createFpmInteraction({fpm_flow_type:concernType})
    console.log("🔍 Using method for response:", methodToUse);
    console.log("About to call getSpecificConcernResponse with:", {
      method: methodToUse,
      concernType: concernType,
    });

    // Store concern type locally
    // this.currentConcernTypeLocal = concernType;

    // Get specific response based on method and concern type
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
  };

  // FIXED: Handler for FPM concern selection
  handleFPMConcernSelection = async(option: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: option,
      type: "user",
      id: uuidv4(),
    };

    await this.api.updateUser({current_concern_type:option})
    // Store the user's intention locally
    let userIntention = "";
    if (option === "Concerned about FP") {
      userIntention = "concerned";
    } else if (option === "Want to switch FP") {
      userIntention = "switch";
    } else if (option === "Want to stop FP") {
      userIntention = "stop";
    }

    console.log("🔧 Set userIntention in state to:", userIntention);

    if (userIntention === "switch") {
      const responseMessage = this.createChatBotMessage(
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
        userIntention: userIntention,
        currentStep: "switchCurrentFPM",
      }));

      await this.api.createResponse({
      response_category: "FPMConcern",
      response_type: "user",
      question_asked: "What is your concern about family planning?",
      user_response: option,
      widget_used: "fpmConcernOptions",
      available_options: ["Concerned about FP", "Want to switch FP", "Want to stop FP"] as string[],
      step_in_flow: "fpmConcernSelection",
    });
    } else {
      // For concerned and stop - ask which method they're using
      const responseMessage = this.createChatBotMessage(
        "Ok, I can help you. Which method are you currently using?\noptions(choose)",
        {
          widget:
            userIntention === "stop" ? "stopFPMOptions" : "currentFPMOptions",
          delay: 500,
        }
      );

      const nextStep =
        userIntention === "stop" ? "stopCurrentFPM" : "currentFPM";

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        userIntention: userIntention, // store user intention in state
        currentStep: nextStep as ChatbotState["currentStep"],
      }));
    }
  };

  // FIXED: Handler for selecting current FPM in the "switch" flow
  handleSwitchCurrentFPMSelection = async(method: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    // Store the selected method locally
    console.log("🔧 Switch flow - stored method locally:", method);
    await this.api.createFpmInteraction({current_fpm_method:method})
    await this.api.updateUser({current_fpm_method:method})
    // Ask about satisfaction with the current method
    const satisfactionQuestion = this.createChatBotMessage(
      "How has the method been working for you? Would you say you are somewhat satisfied, or not at all satisfied with your method?",
      {
        widget: "satisfactionOptions",
        delay: 500,
      }
    );

    await this.api.createFpmInteraction({
      switch_reason:method
    })
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, satisfactionQuestion],
      currentFPMMethod: method, // store method in state for persistence
      currentStep: "satisfactionAssessment",
    }));
     await this.api.createResponse({
    response_category: "SwitchCurrentFPM",
    response_type: "user",
    question_asked: "Which method are you currently using?",
    user_response: method,
    widget_used: "switchFPMOptions",
    available_options: [
      "Pills",
      "IUD",
      "Implant",
      "Injectables",
      "Condoms",
      "Other",
    ] as string[],
    step_in_flow: "switchCurrentFPMSelection",
  });
  };

  // FIXED: Handler for stop FP flow
  handleStopFPMSelection = async(method: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };
    console.log("🔧 Stop flow - stored method in state:", method);
    await this.api.createFpmInteraction({stop_reason:method})
    const reasonQuestion = this.createChatBotMessage(
      "Okay, thanks for sharing!\nCan you tell me why do you want to stop using this method?\n\nFP = Family planning method\nOptions(Choose one)",
      {
        widget: "stopReasonOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, reasonQuestion],
      currentFPMMethod: method, // store method in state for persistence
      currentStep: "stopReason",
    }));
    await this.api.createResponse({
      response_category:'StopFPMSelection',
      response_type:'user',
      question_asked:'Can you tell me why do you want to stop using this method?',
      user_response:method,
      widget_used:'stopReasonOptions',
      available_options:[],
      step_in_flow:'StopFPMSelection'  
    })

  };

  // Handler for FPM change selection (first step after selecting "Change/stop current FPM")
  handleFPMChangeSelection = async(option: string): Promise<void> => {
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
    await this.api.createResponse({
       response_category: "FPMChangeSelection",
      response_type: "user",
      question_asked:
        "How has the method been working for you? Would you say you are somewhat satisfied, or not at all satisfied with your method?",
      user_response: option,
      widget_used: "satisfactionOptions",
      available_options: ["Somewhat satisfied", "Not at all satisfied"],
      step_in_flow: "FPMChangeSelection",
    })
  };

  // Handler for satisfaction assessment (switch flow)
  handleSatisfactionAssessment = async(satisfaction: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: satisfaction,
      type: "user",
      id: uuidv4(),
    };

    this.satisfaction = satisfaction;
    await this.api.createFpmInteraction({satisfaction_level:satisfaction})

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
  handleSwitchReason = async(reason: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: reason,
      type: "user",
      id: uuidv4(),
    };

    this.switchReason = reason;
    await this.api.createFpmInteraction({switch_reason:reason})
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
  handleKidsInFuture = async(response: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: response,
      type: "user",
      id: uuidv4(),
    };

    this.kidsInFuture = response;
    // await this.api.createFpmInteraction({kids_in_future: response})
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
  handleTimingSelection = async(timing: string):Promise<void> => {
    const userMessage: ChatMessage = {
      message: timing,
      type: "user",
      id: uuidv4(),
    };

    this.timing = timing;
    this.proceedToImportantFactors(userMessage);
    await this.api.createFpmInteraction({timing_preference:timing})
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
  handleImportantFactors =async(factor: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: factor,
      type: "user",
      id: uuidv4(),
    };

    const response = this.getFactorBasedRecommendation(factor);
    await this.api.createFpmInteraction({important_factors:factor})
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
      "Efficiency in prevention":
        "The most effective methods are implants and IUDs.\nOther effective methods to consider are injectables, daily pills, and diaphragms.",
      "Should be safe to use":
        "Absolutely.\n\nAll methods we recommend are chosen to keep you safe and healthy.",
      "Be easy and convenient":
        "Of all methods that are easy to use, the most effective method is the Implants.\n\nOther simple methods to adopt are the Injectables and the Pills.\n\nThe least effective (but still 99%) method you can use is Condoms.",
      "Easy to use":
        "Of all methods that are easy to use, the most effective method is the Implants.\n\nOther simple methods to adopt are the Injectables and the Pills.\n\nThe least effective (but still 99%) method you can use is Condoms.",
      "Long lasting":
        "If you want a long-lasting contraceptive method, the most effective options are Implants (3-5 years) or IUDs (5-10 years). These require minimal maintenance once inserted.",
      "Discreet from others":
        "If you're looking for a discreet method, the Implant is the most effective option. Other effective hidden methods includes Injectables and Diaphragm.",
      Discreet:
        "If you're looking for a discreet method, the Implant is the most effective option. Other effective hidden methods includes Injectables and Diaphragm.",
      "No pain/cramp/vomit":
        "The methods that are completely painless are the condoms and diaphrams but they are not as effective as the injectibles, implants and the IUDs. With the injectibles and implants, most people do not experience side effects but some people experience mild headaches. With the IUDs most people do not experience any discomfort after insertion but some people report mild abdominal pain.",
      "No weight gain":
        "Ok, if you do not want to gain weight, the most effective method to adopt is the IUD.\n\nOther method to adopt is the Diaphragm and the least effective methods you can use are the condoms, abstinence from sex on fertile days, and the withdrawal method.",
      "No effect on sex life":
        "The effects of contraceptive methods on sex life can vary depending on individual experiences and preferences.\n\nSome methods, like hormonal contraceptives (such as birth control pills, patches, or IUDs), may have side effects like changes in libido, mood swings, or dryness.\n\nHowever, these effects are not universal, and many individuals use contraceptives without experiencing negative impacts on their sex lives.\n\nOther non-hormonal methods like condoms or copper IUDs typically don't affect libido.\nUltimately, it's essential to discuss any concerns or potential side effects with a healthcare provider to find the best option that suits your needs and lifestyle.",
      "No hormones":
        "If you prefer a non-hormonal method, the Copper IUD is the most effective option. Condoms and diaphragms are also hormone-free but require consistent use.",
      "Be able have kids after":
        "Okay, I see.\n\nThe most effective methods for quick return to fertility are Implants and IUD.\n\nOther effective methods are Daily Pills and Diaphragm and the least effective methods you can use are the condoms, abstinence from sex on fertile days, and the withdrawal method.",
      "Stop without clinic":
        "Okay, I see.\n\nSome of the effective methods you can stop easily without going to the clinic are the injectables, the piils and the diaphragm.\n\nOther least effective methods that can easily stop using are the condoms, abstinence from sex on fertile days, and the withdrawal method.",
      "Can stop anytime":
        "If you want immediate control, condoms and daily pills can be stopped anytime. Diaphragms also offer this flexibility. For longer-term methods, injectables wear off naturally in 3 months.",
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
  handleMenstrualFlowPreference = async(preference: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: preference,
      type: "user",
      id: uuidv4(),
    };

    const response = this.getMenstrualFlowResponse(preference);
    const responseMessage = this.createChatBotMessage(response, { delay: 500 });
    await this.api.createFpmInteraction({menstrual_flow_preference:preference})
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
      "No INcrease of🩸flow":
        "If you want to avoid increasing menstrual flow, the most effective methods are Implants.\n\nOther methods to adopt includes the Injectables and Pills.",
      "No DEcrease of🩸flow":
        "If you want to avoid decrease/stop of menstrual flow, The most effective methods is IUD.\n\nOther method to adopt is the pills.",
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

  // Handler for stop reason
  handleStopReason = async(reason: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: reason,
      type: "user",
      id: uuidv4(),
    };

    const counselingResponse = this.createChatBotMessage(
      "Okay, I understand and I am sorry you are experiencing these issues.\n\nPlease call 7790 and request to speak to a nurse counsellor to direct and counsel you on better options for you.",
      { delay: 500 }
    );
    await this.api.createFpmInteraction({stop_reason:reason})
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
  handleFPMSideEffectSelection = async(sideEffect: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: sideEffect,
      type: "user",
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      "Okay, I understand and I am sorry you are experiencing these issues.\nPlease call 7790 and ask to speak to a nurse counselor who will direct and counsel you on what to do.",
      { delay: 500 }
    );

    await this.api.createFpmInteraction({})
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
export type { FPMChangeProviderInterface};
