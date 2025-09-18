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
    
  }

  // FIXED: Handler for selecting current FPM method
  handleCurrentFPMSelection = (method: string): void => {
    console.log("🔍 handleCurrentFPMSelection called with:", method);
    console.log("🔍 Current state before update:", this.state.currentFPMMethod);

    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

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
  handleFPMConcernTypeSelection = (concernType: string): void => {
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
  handleFPMConcernSelection = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: "user",
      id: uuidv4(),
    };

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
        " O dára bẹẹ .\n\n Jẹ ki n bèèrè àwọn ìbéèrè diẹ lati ni oye daradara lọwọ rẹ, kini iru ilana ti yoo dara julọ fun ọ.",
        { delay: 500 }
      );

      const methodQuestion = this.createChatBotMessage(
        "Ọna wo ni o nlo lọwọlọwọ??\nMethod you use now",
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
    } else {
      // For concerned and stop - ask which method they're using
      const responseMessage = this.createChatBotMessage(
        "Ó dáa bẹ́ẹ̀.Jẹ́ kí n bèèrè àwọn ìbéèrè diẹ̀ lọwọ rẹ láti lè mọ̀ irú ìlànà tí yóò dára jùlọ fún ọ."




\noptions(choose)",
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
  handleSwitchCurrentFPMSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    // Store the selected method locally
    console.log("🔧 Switch flow - stored method locally:", method);

    // Ask about satisfaction with the current method
    const satisfactionQuestion = this.createChatBotMessage(
      "Báwo ni ìlànà náà ṣe ti n ṣiṣẹ fún ọ? Ṣé o lè sọ pé o tẹ ọ lọ́run díẹ̀ tàbí kò tẹ ọ lọ́run rárá?",
      {
        widget: "satisfactionOptions",
        delay: 500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, satisfactionQuestion],
      currentFPMMethod: method, // store method in state for persistence
      currentStep: "satisfactionAssessment",
    }));
  };

  // FIXED: Handler for stop FP flow
  handleStopFPMSelection = (method: string): void => {
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };
    console.log("🔧 Stop flow - stored method in state:", method);

    const reasonQuestion = this.createChatBotMessage(
      "O seun fún ìdáhùn yìí.!\nṢé o lè sọ fún mi ìdí tí o fi fẹ́ dá ìlànà yìí dúró?\n\nFP = Family planning method\nOptions(Choose one)",
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
  };

  // Handler for FPM change selection (first step after selecting "Change/stop current FPM")
  handleFPMChangeSelection = (option: string): void => {
    const userMessage: ChatMessage = {
      message: option,
      type: "user",
      id: uuidv4(),
    };

    const concernMessage = this.createChatBotMessage(
      "Èmi yààtọ̀ pé kí o jẹ́ pé o kò ní itẹlọ́run pẹ̀lú ìlànà ìfètòsọ́mọbíbí tó wà lọ́wọ́.\n Ṣé o lè sọ fún mi díẹ̀ síi nípa ipò náà? kini aniyan rẹ \n\n FP = Family Planning method (contraceptive)",
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

  // Handler for satisfaction assessment (switch flow)
  handleSatisfactionAssessment = (satisfaction: string): void => {
    const userMessage: ChatMessage = {
      message: satisfaction,
      type: "user",
      id: uuidv4(),
    };

    this.satisfaction = satisfaction;

    const reasonQuestion = this.createChatBotMessage(
      Ṣe mo lè mọ ìdí tí o fi fẹ́ yípadà sí omìrán?\nYan idi kan",
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
      "Ṣé o fẹ́ mọ àwọn ìlànà mìíràn tí o lè nífẹ̀ẹ́ sí ju ti tẹ́lẹ̀ lọ?",
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
        "Ó dára, jẹ́ kí n béèrè àwọn ìbéèrè diẹ̀ lọwọ rẹ láti ni òye irú ìlànà tí yóò dára fún ọ.",
        { delay: 500 }
      );

      const kidsQuestion = this.createChatBotMessage(
        "Ṣé o fẹ́ bímọ síi tàbí ṣé o fẹ́ bímọ ọmọ kankan mọ?",
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
        " Kin ni ohun ti o tún fẹ se báyìí?",
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
        "Ọdún mélòó ni o fẹ́ fi dúró kí o tó bímọ mìíràn?\nMenu",
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
      "O dára, bi o ba fe yàn ìlànà idèna oyún, kín ni awọn ohun to ṣe pàtàkì sì ọ?\nPick one factor",
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
        "O dára, bi o ba fe yàn ìlànà idèna oyún, kín ni awọn ohun to ṣe pàtàkì sì ọ?",
        {
          widget: "menstrualFlowOptions",
          delay: 500,
        }
      );
      nextStep = "menstrualFlow";
    } else {
      responseMessage = this.createChatBotMessage(response, { delay: 500 });

      const nextActions = this.createChatBotMessage(
        "Kí ni o fẹ́ ṣe ní atẹ̀lẹ̀yìn?",
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
      `Thank you for sharing your preference. For your specific needs regarding ${factor.toLowerCase()},Tí o bá fẹ́ gba àlàyé lórí rẹ̀ síi, jọwọ bá akọṣẹmọṣẹ oníṣègùn sọ̀rọ̀ lórí nomba 7790.`
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
      "Kí ni o fẹ́ ṣe ní atẹ̀lẹ̀yìn?",
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
      "O ṣeun fun pinpin ayanfẹ rẹ. Fun alaye diẹ sii lori bii awọn ọna idena oyun ti o yatọ ṣe ni ipa lori sisan oṣu, jọwọ pe 7790 lati ba alamọja ilera kan sọrọ."
    );
  }

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
      "Kí ni o fẹ́ ṣe ní atẹ̀lẹ̀yìn?",
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
      "Kí ni o fẹ́ ṣe ní atẹ̀lẹ̀yìn?",
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
        'Ti o ba fẹ ba asoju sọrọ siwaju sí lati mọ nipa ilana Ifeto ṣọmọ bíbí, jọwọ pe nọmba yìí 7790.\n\nTi o ba fẹ sopọ mọ aṣoju ọjọgbọn iṣoogun kan nibi ni iwiregbe, kan tẹ ọrọ naa “human”.',
        { delay: 1000 }
      );

      const moreHelp = this.createChatBotMessage(
        "Ṣe Mo le ran ọ lọwọ pẹlu ohunkohun miiran?",
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
        "Ṣe Mo le ran ọ lọwọ pẹlu ohunkohun miiran?",
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
        "O dara, kin ni ìbéèrè rẹ? Jọwọ mọ wipe mo je Oludamọran Ifeto ṣọmọ bíbí àti pé ibeere ti o jẹ mọ Ifeto ṣọmọ bíbí nikan ni mo le dá",
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
