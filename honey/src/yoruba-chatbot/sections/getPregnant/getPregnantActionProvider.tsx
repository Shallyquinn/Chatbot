// src/chatbot/sections/getPregnant/getPregnantActionProvider.tsx
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatbotState, ChatStep } from "../../types";
import { ApiService } from "@/services/api";


// Define the types for our get pregnant provider
type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>
) => ChatMessage;
type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

export interface GetPregnantActionProviderInterface {
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

class GetPregnantActionProvider implements GetPregnantActionProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  api: ApiService;

  // Store user's current selection context
  private currentFPMMethod: string = "";
  private tryingDuration: string = "";
  private userFlow: string = ""; // tracks which flow path user is on

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

  // Initiate the get pregnant flow
  handleGetPregnantInitiation =async (): Promise<void> => {
    const userMessage: ChatMessage = {
      message: "How to get pregnant",
      type: "user",
      id: uuidv4(),
    };
    try{
      await this.api.createConversation({
    message_type: "user",
    message_text: userMessage.message,
    message_source: "typed",
    chat_step: "getPregnantFPMSelection",
    widget_name: "getPregnantFPMSelection",
    message_sequence_number:1,
    message_delay_ms: 500,
  })
    } catch(error){
      console.log('Failed')
    }
    
   
    // Use the original messages from getPregnantConfig
    const introMessage = this.createChatBotMessage(
      "Eleyi jẹ nla! Inu mi dun lati fun ọ ni imọran lori eto idile.",
      { delay: 500 }
    );

    const questionMessage = this.createChatBotMessage(
      "Are you currently using a family planning method (FPM) or did you recently use one?\n\nPlease select from the options your current or recently used method. Scroll to see all options",
      {
        widget: "getPregnantFPMSelection",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: userMessage
        ? [...prev.messages, userMessage, introMessage, questionMessage]
        : [...prev.messages, introMessage, questionMessage],
      currentStep: "getPregnantFPMSelection",
      
    }));
   await this.api.createConversation({
    message_type: "user",
    message_text: userMessage.message,
    chat_step: "getPregnantFPMSelection",
    widget_name: "getPregnantFPMSelection",
    message_sequence_number:1,
    message_delay_ms: 500,
  }).catch(err => console.error("Failed to save conversation:", err));
  };

  // Handle FPM selection for get pregnant flow
  handleGetPregnantFPMSelection = (selection: string): void => {
    const userMessage: ChatMessage = {
      message: selection,
      type: "user",
      id: uuidv4(),
    };

    // Store the current method
    this.currentFPMMethod = selection;
    console.log("FPM Method stored:", this.currentFPMMethod); // debug log

    // Get specific response based on the method
    const response = this.getFPMSpecificResponse(selection);
    const responseMessage = this.createChatBotMessage(response.message, {
      delay: 500,
    });

    let followUpMessage = null;
    if (response.followUpWidget && response.followUpQuestion) {
      followUpMessage = this.createChatBotMessage(response.followUpQuestion, {
        widget: response.followUpWidget,
        delay: 1000,
      });
    }

    const messages = [userMessage, responseMessage];
    if (followUpMessage) messages.push(followUpMessage);

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: response.nextStep,
    }));
  };

  // Get specific response based on FPM method
  private getFPMSpecificResponse(method: string): {
    message: string;
    followUpQuestion?: string;
    followUpWidget?: string;
    nextStep: ChatStep;
  } {
    console.log("getFPMSpecificResponse called with:", { method }); // debug log

    const responses: Record<
      string,
      {
        message: string;
        followUpQuestion?: string;
        followUpWidget?: string;
        nextStep: ChatStep;
      }
    > = {
      "No FPM now or recently": {
        message:
          "That's good to know. Since you're not using any contraceptive method, your body should be ready for pregnancy. Let me ask you about your journey so far.",
        followUpQuestion: "How long have you been trying to conceive?",
        followUpWidget: "getPregnantTryingDuration",
        nextStep: "getPregnantTryingDuration",
      },
      IUD: {
        message:
          "I understand you currently have an IUD. To get pregnant, you'll need to have it removed by a healthcare provider. The IUD prevents pregnancy very effectively, so removal is necessary.",
        followUpQuestion: "Have you had your IUD removed?",
        followUpWidget: "getPregnantIUDRemoval",
        nextStep: "getPregnantIUDRemoval",
      },
      Implants: {
        message:
          "I see you have an implant. To get pregnant, you'll need to have the implant removed by a healthcare provider. The implant prevents pregnancy very effectively.",
        followUpQuestion: "Have you had your implant removed?",
        followUpWidget: "getPregnantImplantRemoval",
        nextStep: "getPregnantImplantRemoval",
      },
      "Injections /Depo-provera / Sayana Press": {
        message:
          "I understand you're using injections. To get pregnant, you'll need to stop getting the injections. However, it may take some time for your fertility to return after stopping.",
        followUpQuestion: "Have you stopped getting the injections?",
        followUpWidget: "getPregnantInjectionStop",
        nextStep: "getPregnantInjectionStop",
      },
      "Sayana Press": {
        message:
          "I understand you're using Sayana Press. To get pregnant, you'll need to stop getting the injections. However, it may take some time for your fertility to return after stopping.",
        followUpQuestion:
          "Have you stopped getting the Sayana Press injections?",
        followUpWidget: "getPregnantInjectionStop",
        nextStep: "getPregnantInjectionStop",
      },
      "Daily Pills": {
        message:
          "I see you're taking daily contraceptive pills. To get pregnant, you'll need to stop taking the pills. Your fertility should return relatively quickly after stopping.",
        followUpQuestion: "Have you stopped taking the daily pills?",
        followUpWidget: "getPregnantPillsStop",
        nextStep: "getPregnantPillsStop",
      },
      Condoms: {
        message:
          "Since you're using condoms, you can start trying to conceive immediately by simply not using them during intercourse. Condoms don't affect your fertility.",
        followUpQuestion: "What would you like to do next?",
        followUpWidget: "getPregnantNextAction",
        nextStep: "getPregnantNextAction",
      },
      "Emergency pills": {
        message:
          "Emergency contraceptive pills are only meant for occasional use and don't affect your long-term fertility. You can start trying to conceive whenever you're ready.",
        followUpQuestion: "Kí ni o fẹ́ ṣe ní tẹ̀síwájú?",
        followUpWidget: "getPregnantNextAction",
        nextStep: "getPregnantNextAction",
      },
      "Female sterilisation": {
        message:
          "Sometimes female sterilisation is reversible. It can be immediately after or even several years later.Kindly visit your health provider for counselling.",
        followUpQuestion: Kí ni o fẹ́ ṣe ní tẹ̀síwájú?",
        followUpWidget: "getPregnantNextAction",
        nextStep: "getPregnantNextAction",
      },
      "Male sterilisation": {
        message:
          "Nigba miiran ìlànà adena ọmọ bíbí ti  okunrin se e yipada.O le jẹ lẹsẹkẹsẹ lẹhin tabi paapaa ọpọlọpọ ọdun nigba mii.Jọwọ ṣe abẹwo si olupese ilera rẹ fun imọran.",
        followUpQuestion: "Kí ni o fẹ́ ṣe ní tẹ̀síwájú?",
        followUpWidget: "getPregnantNextAction",
        nextStep: "getPregnantNextAction",
      },
    };

    const foundResponse = responses[method];
    console.log("Found response:", foundResponse ? "Yes" : "No", { method }); // Debug log

    return (
      foundResponse || {
        message: `I understand you're using ${method}. For specific guidance about conception while using this method, I recommend consulting with a healthcare provider. Please call 7790 for personalized assistance.`,
        followUpQuestion: "Kí ni o fẹ́ ṣe ní tẹ̀síwájú?",
        followUpWidget: "getPregnantNextAction",
        nextStep: "getPregnantNextAction",
      }
    );
  }

  // Handle trying duration selection (No FPM branch)
  handleGetPregnantTryingDuration = (duration: string): void => {
    const userMessage: ChatMessage = {
      message: duration,
      type: "user",
      id: uuidv4(),
    };

    // Store the trying duration
    this.tryingDuration = duration;
    console.log("Trying duration stored:", this.tryingDuration); // debug log

    // Get specific advice based on duration
    const adviceMessage = this.createChatBotMessage(
      this.getTryingDurationAdvice(duration),
      { delay: 500 }
    );

    const nextActionMessage = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "getPregnantNextAction",
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        adviceMessage,
        nextActionMessage,
      ],
      currentStep: "getPregnantNextAction",
    }));
  };

  // Get advice based on trying duration
  private getTryingDurationAdvice(duration: string): string {
    const adviceMap: Record<string, string> = {
      "Less than 6 months":
        "It's still early in your conception journey. For most couples, it can take up to 6-12 months to conceive naturally. Continue with regular unprotected intercourse and maintain a healthy lifestyle with proper nutrition, exercise, and prenatal vitamins.",
      "6-12 months":
        "You've been trying for a while, which is normal for many couples. Consider tracking your ovulation cycle to optimize timing. Maintain healthy habits and consider consulting a healthcare provider if you have concerns.",
      " than 1 year":
        "After trying for over a year, it may be helpful to consult with a fertility specialist or healthcare provider. They can assess both partners and provide guidance on next steps. Don't lose hope - many couples conceive with proper medical guidance.",
    };

    return (
      adviceMap[duration] ||
      "Thank you for sharing that information. For personalized advice about your conception journey, I recommend consulting with a healthcare provider who can assess your specific situation."
    );
  }

  // Handle IUD removal status
  handleGetPregnantIUDRemoval = (status: string): void => {
    const userMessage: ChatMessage = {
      message: status,
      type: "user",
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getIUDRemovalResponse(status),
      { delay: 500 }
    );

    const nextActionMessage = this.createChatBotMessage(
      "Kí ni o fẹ́ ṣe ní tẹ̀síwájú?",
      {
        widget: "getPregnantNextAction",
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
      currentStep: "getPregnantNextAction",
    }));
  };

  // Get IUD removal specific response
  private getIUDRemovalResponse(status: string): string {
    const responses: Record<string, string> = {
      "Yes, more than 1 year":
        "Great! Since you had your IUD removed more than a year ago, your fertility should have fully returned. You can continue trying to conceive naturally. If you haven't conceived yet, consider consulting with a healthcare provider for fertility assessment.",
      "Yes, less than 1 year":
        "Good! Your IUD has been removed. Most women's fertility returns immediately after IUD removal, so you can start trying to conceive right away. It may take a few months for your cycle to regulate completely.",
      "No, I didn't remove":
        "To get pregnant, you'll need to have your IUD removed by a healthcare provider. This is a simple procedure that can be done at a clinic. Please call 7790 to schedule an appointment for IUD removal.",
    };

    return (
      responses[status] ||
      "Jọwọ kan si alagbawo pẹlu olupese ilera nipa IUD rẹ ati awọn ero inu. Pe 7790 fun iranlọwọ ti ara ẹni."
    );
  }

  // Handle Implant removal status
  handleGetPregnantImplantRemoval = (status: string): void => {
    const userMessage: ChatMessage = {
      message: status,
      type: "user",
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getImplantRemovalResponse(status),
      { delay: 500 }
    );

    const nextActionMessage = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "getPregnantNextAction",
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
      currentStep: "getPregnantNextAction",
    }));
  };

  // Get implant removal specific response
  private getImplantRemovalResponse(status: string): string {
    const responses: Record<string, string> = {
      "Longer than 3 months":
        "Excellent! Since you had your implant removed more than 3 months ago, your fertility should have fully returned. You can continue trying to conceive naturally. Most women conceive within a year of implant removal.",
      "Less than 3 months":
        "Good! Your implant has been removed recently. Most women's fertility returns immediately after implant removal, so you can start trying to conceive right away. It may take a few cycles for your body to fully adjust.",
      "No, I didn't remove":
        "Lati loyun, iwọ yoo nilo lati yọ ifinu rẹ kuro nipasẹ olupese ilera kan. Eyi jẹ ilana ti o rọrun ti o le ṣee ṣe ni ile-iwosan kan. Jọwọ pe 7790 lati ṣeto ipinnu lati pade fun yiyọkuro ifinu."
  };

    return (
      responses[status] ||
      "Please consult with a healthcare provider about your implant and conception plans. Call 7790 for personalized assistance."
    );
  }

  // Handle injection stopping status
  handleGetPregnantInjectionStop = (status: string): void => {
    const userMessage: ChatMessage = {
      message: status,
      type: "user",
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getInjectionStopResponse(status),
      { delay: 500 }
    );

    const nextActionMessage = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "getPregnantNextAction",
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
      currentStep: "getPregnantNextAction",
    }));
  };

  // Get injection stop specific response
  private getInjectionStopResponse(status: string): string {
    const responses: Record<string, string> = {
      Yes: "Good! You've stopped the injections. Please note that it may take 6-12 months or sometimes longer for your fertility to return after stopping injections like Depo-Provera or Sayana Press. This is normal, so be patient with your body as it readjusts.",
      No: "To get pregnant, you'll need to stop getting the injections. Simply don't go for your next scheduled injection. Remember that it may take several months for your fertility to return after your last injection, so don't be discouraged if conception doesn't happen immediately.",
    };

    return (
      responses[status] ||
      "Jọwọ kan si alagbawo pẹlu olupese ilera kan nipa didaduro awọn abẹrẹ ati awọn ero ero inu rẹ. Pe 7790 fun iranlọwọ ti ara ẹni."
    );
  }

  // Handle pills stopping status
  handleGetPregnantPillsStop = (status: string): void => {
    const userMessage: ChatMessage = {
      message: status,
      type: "user",
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getPillsStopResponse(status),
      { delay: 500 }
    );

    const nextActionMessage = this.createChatBotMessage(
      "Kí ni o fẹ́ ṣe ní tẹ̀síwájú?",
      {
        widget: "getPregnantNextAction",
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
      currentStep: "getPregnantNextAction",
    }));
  };

  // Get pills stop specific response
  private getPillsStopResponse(status: string): string {
    const responses: Record<string, string> = {
      Yes: "Great! You've stopped taking the pills. Your fertility should return relatively quickly - most women can conceive within 1-3 months after stopping birth control pills. Start taking prenatal vitamins if you haven't already.",
      No: "To get pregnant, you'll need to stop taking the daily contraceptive pills. Simply don't take any more pills. Your fertility should return quickly, often within the first month after stopping.",
    };

    return (
      responses[status] ||
      "Jọwọ kan si alagbawo pẹlu olupese ilera kan nipa didaduro awọn oogun ati awọn ero ero inu rẹ. Pe 7790 fun iranlọwọ ti ara ẹni."
    );
  }

  // Handle next action selection
  handleGetPregnantNextAction = (action: string): void => {
    const userMessage: ChatMessage = {
      message: action,
      type: "user",
      id: uuidv4(),
    };

    if (action === "Ask more questions") {
      const moreQuestionsMessage = this.createChatBotMessage(
        "Mo wà níbí láti ràn ẹ́ lọ́wọ́ nípa gbogbo ìbéèrè tó ní ṣe pẹ̀lú bí a ṣe lè lóyún. Kí ni o fẹ́ mọ̀?",
        { delay: 500 }
      );

      const promptMessage = this.createChatBotMessage(
        "Please type your question below:",
        { delay: 1000 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          moreQuestionsMessage,
          promptMessage,
        ],
        currentStep: "getPregnantUserQuestion",
      }));
    } else if (action === "Find nearest clinic") {
      const clinicMessage = this.createChatBotMessage(
        "Láti rí ilé ìwòsàn tó súnmọ́ ọ, jọ̀wọ́ pín ipò rẹ tàbí kọ orúkọ ìlú/àgbègbè rẹ.",
        { delay: 500 }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, clinicMessage],
        currentStep: "locationInput",
      }));
    } else if (action === "Back to main menu") {
      const mainMenuMessage = this.createChatBotMessage(
        "Kini iwọ yoo fẹ ki n ran ọ lọwọ?",
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
    }
  };

  // Handle user questions in get pregnant flow
  handleGetPregnantUserQuestion = (question: string): void => {
    const userMessage: ChatMessage = {
      message: question,
      type: "user",
      id: uuidv4(),
    };

    // Get response based on question content
    const responseMessage = this.createChatBotMessage(
      this.getQuestionResponse(question),
      { delay: 500 }
    );

    const nextActionMessage = this.createChatBotMessage(
      "What would you like to do next?",
      {
        widget: "getPregnantNextAction",
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
      currentStep: "getPregnantNextAction",
    }));
  };

  // Get response for user questions
  private getQuestionResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes("ovulation") ||
      lowerQuestion.includes("fertile")
    ) {
      return "Ovulation typically occurs around day 14 of a 28-day cycle. You're most fertile in the days leading up to and during ovulation. Consider tracking your cycle and using ovulation predictor kits to optimize timing.";
    } else if (
      lowerQuestion.includes("nutrition") ||
      lowerQuestion.includes("diet")
    ) {
      return "A healthy diet rich in folic acid, iron, and prenatal vitamins is important when trying to conceive. Avoid alcohol, limit caffeine, and maintain a balanced diet with plenty of fruits and vegetables.";
    } else if (
      lowerQuestion.includes("exercise") ||
      lowerQuestion.includes("activity")
    ) {
      return "Moderate exercise is beneficial when trying to conceive. Avoid excessive high-intensity workouts that might affect your cycle. Walking, swimming, and yoga are excellent options.";
    } else if (
      lowerQuestion.includes("age") ||
      lowerQuestion.includes("older")
    ) {
      return "Age can affect fertility, but many women conceive naturally at various ages. If you're over 35 and have been trying for 6 months, or over 40, consider consulting a fertility specialist sooner.";
    } else {
      return "Thank you for your question. For specific medical advice about conception, I recommend consulting with a healthcare provider who can address your individual situation. You can call 7790 to speak with a medical professional.";
    }
  }
}

export default GetPregnantActionProvider;
