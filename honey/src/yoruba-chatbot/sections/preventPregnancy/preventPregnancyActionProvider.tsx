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
  getMethodOptionsForDuration,
  normalizeDurationInput,
  PREVENTION_DURATION_OPTIONS
} from "./preventPregnancyTypes";
import { PRODUCT_DATA, getProductInfo } from "./productData"; // Task 5: Product information
import { 
  getMediaWidgetByName, 
  getMediaWidgetsByCategory,
  searchMediaWidgets,
  contraceptivePillsMedia,
  condomsMedia,
  implantsMedia,
  injectablesMedia,
  emergencyContraceptionMedia,
  barrierMethodsMedia,
  sexualHealthMedia
} from '../../../components/mediaWidgetsConfig';
import { imageWidgets } from "@/components/mediaWidgetsConfig";
import { ApiService } from "@/services/api";
import { botMessage } from "react-chatbot-kit/build/src/components/Chat/chatUtils";
import { use } from "react";
import { ConfusionDetector } from '../../utils/ConfusionDetector';
import { MessageFormatter } from '../../utils/MessageFormatter';
import { SmartMessageTimer } from '../../utils/SmartMessageTimer';


class PreventPregnancyActionProvider implements PreventPregnancyProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  api: ApiService;
  private chatSessionInitialized: boolean = false;
  private messageSequenceNumber: number = 1;
  private userSessionId: string;

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
    apiClient: ApiService,
    userSessionId?: string
  ) {
    // Wrap createChatBotMessage to automatically add timestamps
    const originalCreateChatBotMessage = createChatBotMessage;
    this.createChatBotMessage = (message: string, options?: Record<string, unknown>) => {
      const msg = originalCreateChatBotMessage(message, options);
      return {
        ...msg,
        timestamp: new Date().toISOString(),
      };
    };
    
    this.setState = setStateFunc;
    this.state = state;
    this.api = apiClient;
    this.userSessionId = userSessionId || localStorage.getItem('userSessionId') || '';
    
    // Enhanced setState with server-side persistence
    const originalSetState = this.setState;
    this.setState = (updater) => {
      originalSetState((prev) => {
        const newState = typeof updater === 'function' ? updater(prev) : updater;
        // Save to localStorage as fallback
        localStorage.setItem("chat_state", JSON.stringify(newState));
        // Save to server for cross-device sync
        this.saveStateToServer(newState).catch((error) => {
          console.error('Failed to save state to server:', error);
        });
        return newState;
      });
    };
  }

  // Save complete chat state to server for WhatsApp-style cross-device sync
  private async saveStateToServer(state: ChatbotState): Promise<void> {
    try {
      await this.ensureChatSession();
      await this.api.saveUserSession({
        user_session_id: this.userSessionId,
        chat_state: JSON.stringify(state),
        last_activity: new Date().toISOString()
      });
    } catch (error) {
      console.error('PreventPregnancy: Failed to save state to server:', error);
      // Don't throw - state is already saved to localStorage
    }
  }

  // Ensure chat session is initialized before API calls
  private async ensureChatSession(): Promise<void> {
    if (!this.chatSessionInitialized) {
      try {
        await this.api.initializeChatSession();
        this.chatSessionInitialized = true;
      } catch (error) {
        console.error('PreventPregnancy: Failed to initialize chat session:', error);
      }
    }
  }

  // Get next message sequence number
  private getNextSequenceNumber(): number {
    return this.messageSequenceNumber++;
  }

  // Reset message sequence for new conversation
  private resetSequenceNumber(): void {
    this.messageSequenceNumber = 1;
  }

  // Helper method to create user messages with automatic timestamp
  private createUserMessage = (message: string): ChatMessage => {
    return {
      message,
      type: 'user',
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
  };

  

  // =============================================================================
  // SMART WIDGET DISCOVERY METHODS
  // =============================================================================

  /**
   * Intelligently finds image and audio widgets for any method or product
   */
  private findMediaWidgets = (searchTerm: string, options?: {
    preferredImageBrand?: string;
    preferredAudioType?: string;
  }): {
    imageWidget?: string;
    audioWidget?: string;
    hasImage: boolean;
    hasAudio: boolean;
  } => {
    const normalizedSearch = searchTerm.toLowerCase().replace(/[-\s]/g, '');
    
    // Find image widgets
    const imageResults = searchMediaWidgets(normalizedSearch).filter(w => 
      w.widgetName.includes('Image')
    );
    
    // Find audio widgets  
    const audioResults = searchMediaWidgets(normalizedSearch).filter(w => 
      w.widgetName.includes('Audio')
    );

    // Prefer specific brands if specified
    let selectedImage = imageResults[0]?.widgetName;
    let selectedAudio = audioResults[0]?.widgetName;

    if (options?.preferredImageBrand && imageResults.length > 1) {
      const preferredImage = imageResults.find(w => 
        w.widgetName.toLowerCase().includes(options.preferredImageBrand!.toLowerCase())
      );
      if (preferredImage) selectedImage = preferredImage.widgetName;
    }

    if (options?.preferredAudioType && audioResults.length > 1) {
      const preferredAudio = audioResults.find(w => 
        w.widgetName.toLowerCase().includes(options.preferredAudioType!.toLowerCase())
      );
      if (preferredAudio) selectedAudio = preferredAudio.widgetName;
    }

    return {
      imageWidget: selectedImage,
      audioWidget: selectedAudio,
      hasImage: !!selectedImage,
      hasAudio: !!selectedAudio
    };
  };

  

  /**
   * Gets widgets by method category for more reliable results
   */
  private getWidgetsByMethodType = (method: string): {
    imageWidget?: string;
    audioWidget?: string;
    hasImage: boolean;
    hasAudio: boolean;
  } => {
    const methodLower = method.toLowerCase();
    
    // Map methods to categories
    const categoryMapping: Record<string, { 
      category: string;
      searchTerms: string[];
      preferredBrand?: string;
    }> = {
      "Daily pills": { 
        category: "contraceptivePills", 
        searchTerms: ["daily", "pills"],
        preferredBrand: "desofem" 
      },
      "Emergency pills": { 
        category: "emergencyContraception", 
        searchTerms: ["postpill", "emergency"],
        preferredBrand: "postpill"
      },
      "Male condom": { 
        category: "condoms", 
        searchTerms: ["condom", "durex", "use"],
        preferredBrand: "durex"
      },
      "Female condom": { 
        category: "condoms", 
        searchTerms: ["female", "condom"],
        preferredBrand: "female"
      },
      "Diaphragm": { 
        category: "barrierMethods", 
        searchTerms: ["diaphragm"],
        preferredBrand: "diaphragm"
      },
      "Implants": { 
        category: "implants", 
        searchTerms: ["implants", "jadelle"],
        preferredBrand: "jadelle"
      },
      "Injectables": { 
        category: "injectables", 
        searchTerms: ["sayana", "injectable"],
        preferredBrand: "sayana"
      },
      "IUD": { 
        category: "other", 
        searchTerms: ["iud", "lydia"],
        preferredBrand: "lydia"
      },
      "IUS": { 
        category: "other", 
        searchTerms: ["hormonal", "ius", "lydia"],
        preferredBrand: "lydia"
      }
    };

    const mapping = categoryMapping[methodLower];
    if (!mapping) {
      // Fallback to direct search
      return this.findMediaWidgets(method);
    }

    // Try category-based search first
    if (mapping.category !== "other") {
      const categoryWidgets = getMediaWidgetsByCategory(mapping.category);
      const imageWidgets = categoryWidgets.filter(w => w.widgetName.includes('Image'));
      const audioWidgets = categoryWidgets.filter(w => w.widgetName.includes('Audio'));

      let selectedImage = imageWidgets[0]?.widgetName;
      let selectedAudio = audioWidgets[0]?.widgetName;

      // Prefer specific brands
      if (mapping.preferredBrand) {
        const preferredImage = imageWidgets.find(w => 
          w.widgetName.toLowerCase().includes(mapping.preferredBrand!)
        );
        const preferredAudio = audioWidgets.find(w => 
          w.widgetName.toLowerCase().includes(mapping.preferredBrand!)
        );

        if (preferredImage) selectedImage = preferredImage.widgetName;
        if (preferredAudio) selectedAudio = preferredAudio.widgetName;
      }

      if (selectedImage || selectedAudio) {
        return {
          imageWidget: selectedImage,
          audioWidget: selectedAudio,
          hasImage: !!selectedImage,
          hasAudio: !!selectedAudio
        };
      }
    }

    // Fallback to search terms
    for (const term of mapping.searchTerms) {
      const result = this.findMediaWidgets(term, {
        preferredImageBrand: mapping.preferredBrand
      });
      if (result.hasImage || result.hasAudio) {
        return result;
      }
    }

    return { hasImage: false, hasAudio: false };
  };
  
  // =============================================================================
  // PREVENT PREGNANCY INITIATION
  // =============================================================================

  handlePreventPregnancyInitiation = async(): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage("How to prevent pregnancy");
    
    // Phase 2: Use MessageFormatter for professional greeting
    const greetingText = MessageFormatter.formatSuccess("I see! 👍\n\nYou are at the right place, I can assist you with this.");
    const greetingTiming = SmartMessageTimer.createTimingConfig(greetingText, 'confirmation', 'medium');
    const responseMessage = this.createChatBotMessage(greetingText, { delay: greetingTiming.delay });

    // Phase 2: Add button guidance for clarity
    const questionText = MessageFormatter.addButtonGuidance("What kind of contraception do you want to know about?\n\nEmergency = you had sex recently and want to avoid pregnancy");
    const questionTiming = SmartMessageTimer.createTimingConfig(questionText, 'question', 'medium');
    const followUpMessage = this.createChatBotMessage(
      questionText,
      { 
        delay: questionTiming.delay,
        widget: "contraceptionTypeOptions"
      }
    );

   
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, followUpMessage],
      currentStep: "contraception" as any,
    }));
    
    // Track all messages with proper sequencing
    await this.api.createConversation({
      message_text: userMessage.message,
      message_type: 'user',
      chat_step: "preventPregnancyInitiation",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "contraceptionTypeOptions"
    }).catch(err => console.error('Failed to save user message:', err));
    
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "preventPregnancyInitiation",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save bot response:', err));
    
    await this.api.createConversation({
      message_text: followUpMessage.message,
      message_type: 'bot',
      chat_step: "contraceptionTypeOptions",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "contraceptionTypeOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save follow-up message:', err));
  };

  // =============================================================================
  // CONTRACEPTION TYPE SELECTION
  // =============================================================================

  handleContraceptionTypeSelection = async(type: string): Promise<void> => {
    await this.ensureChatSession();
    
    // Type safety conversion - type should match exactly: "Emergency" or "Prevent in future"
    const contraceptionType = type as ContraceptionType;
    
    const userMessage = this.createUserMessage(type);

    // Track user selection in Conversation and FpmInteraction
    await Promise.all([
      this.api.createConversation({
        message_text: type,
        message_type: 'user',
        chat_step: "contraceptionTypeSelection",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "contraceptionTypeOptions"
      }),
      this.api.createFpmInteraction({
        contraception_type: type,
        main_menu_option: "How to prevent pregnancy",
        fpm_concern_type: type === "Emergency" ? "emergency_contraception" : "future_prevention"
      } as any)
    ]).catch(err => console.error('Failed to save user selection:', err));

    // Using type-safe constants that match the button text exactly
    const EMERGENCY: ContraceptionType = "Emergency";
    const PREVENT_FUTURE: ContraceptionType = "Prevent in future";

    switch (contraceptionType) {
      case EMERGENCY:
        this.handleEmergencyPath(userMessage);
        break;
      case PREVENT_FUTURE:
        this.handlePreventFuturePath(userMessage);
        break;
      default:
        // Handle unexpected values
        this.handleInvalidContraceptionType(userMessage);
        break;
    }
    await this.api.createResponse({
      response_category:'ContraceptionType',
      response_type:'user',
      question_asked:'What kind of contraception do you want to know about?',
      user_response:contraceptionType,
      widget_used:'contraceptiontypeoptions',
      available_options:['Emergency', 'Prevent in future'],
      step_in_flow:'contraceptionTypeOptions',
    }).catch(err => console.error('Failed to save response:', err));
  };
  
  // New method to handle invalid contraception types
  private handleInvalidContraceptionType = (userMessage: ChatMessage): void => {
    const responseMessage = this.createChatBotMessage(
      "I didn't recognize that option. Please choose either 'Emergency' or 'Prevent in future'.",
      { 
        delay: 500,
        widget: "contraceptionTypeOptions"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: "contraception",
      // currentStep: nextStep
    }));
  };

  // =============================================================================
  // EMERGENCY CONTRACEPTION PATH
  // =============================================================================

  private handleEmergencyPath = async(userMessage: ChatMessage): Promise<void> => {
    // Phase 2: Format emergency contraception info with warning
    const emergencyInfoText = MessageFormatter.formatWarning(
      "To avoid pregnancy after unprotected sex, you can take emergency contraceptive pills.\n\n" +
      "Emergency pills are very effective when taken within 24 to 72 hours after unprotected sex. " +
      "You are advised to not take it more than 3 times in a month. " +
      "If you are ovulating, you should use an alternative contraceptive plan (condoms).\n\n" +
      "Please note that they are not effective if you are already pregnant."
    );
    const emergencyTiming = SmartMessageTimer.createTimingConfig(emergencyInfoText, 'warning', 'high');
    const responseMessage = this.createChatBotMessage(emergencyInfoText, { delay: emergencyTiming.delay });

    //use type-safe products list
    const availableProducts: EmergencyProduct[] = ["postpill", "postinor2"];
    
    // Phase 2: Format product list with info icon
    const productListText = MessageFormatter.formatInfo(
      "Let me tell you some of the effective and available emergency contraceptive pills:\n\n" +
      "• Postpill can be taken within 5 days after sex\n" +
      "• Postinor-2 is effective within 3 days after sex\n\n" +
      "Which product do you want to learn about?"
    );
    const productTiming = SmartMessageTimer.createTimingConfig(productListText, 'info', 'medium');
    const productMessage = this.createChatBotMessage(productListText, { delay: productTiming.delay });

    // Phase 2: Add button guidance
    const selectionText = MessageFormatter.addButtonGuidance("Select one to learn more:");
    const selectionTiming = SmartMessageTimer.createTimingConfig(selectionText, 'question', 'medium');
    const selectionMessage = this.createChatBotMessage(
      selectionText,
      { 
        delay: selectionTiming.delay,
        widget: "emergencyProductOptions"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, productMessage, selectionMessage],
      currentStep: "emergencyProduct",
    }));
    
    // Track all bot messages in emergency path
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "emergencyPath",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: emergencyTiming.delay
    }).catch(err => console.error('Failed to save response:', err));
    
    await this.api.createConversation({
      message_text: productMessage.message,
      message_type: 'bot',
      chat_step: "emergencyPath",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: productTiming.delay
    }).catch(err => console.error('Failed to save product message:', err));
    
    await this.api.createConversation({
      message_text: selectionMessage.message,
      message_type: 'bot',
      chat_step: "emergencyProductOptions",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "emergencyProductOptions",
      message_delay_ms: 1500
    }).catch(err => console.error('Failed to save selection message:', err));
  };

  // =============================================================================
  // EMERGENCY PRODUCT SELECTION
  // =============================================================================

  handleEmergencyProductSelection = async(product: string): Promise<void> => {
    // Type safety conversion
    const emergencyProduct = product as EmergencyProduct;
    const userMessage = this.createUserMessage(product);

    const widgets = this.findMediaWidgets(emergencyProduct);
   

    // Using type-safe constants instead of magic strings
    const productInfoMap: Record<EmergencyProduct, string > = {
      "postpill": "Postpill is a one-dose emergency contraceptive pill by DKT. It contains 1.5 mg Levongestrel. It should be taken orally as soon as possible but can still be taken within 5 days (120 hours) of unprotected sex. It doesn’t work if you are already pregnant and will not harm an already established pregnancy.\n\n You can buy Postpill at any pharmacy or health store around you. It is 95% effective when taken within 24 hours of unprotected sex.\n\nIf more than 120 hours (5 days) have passed since unprotected sex, it won't be effective. In such a situation, kindly call 7790 and ask to speak to a nurse counsellor for further guidance.",
      
      "postinor2": "Postinor-2 is an emergency contraceptive containing levonorgestrel. Take it within 72 hours of unprotected sex for best results.\n\nIt works by preventing or delaying ovulation. The sooner you take it after unprotected sex, the more effective it is.\n\nIt should not be used as a regular contraceptive method.",
    };
    await this.api.createResponse({
    response_category: "EmergencyProduct",
    response_type: "user",
    question_asked: "Which emergency contraception product do you want to know about?",
    user_response: emergencyProduct,
    widget_used: "emergencyProductOptions",
    available_options: ["Postpill", "Postinor-2"],
    step_in_flow: "emergencyProductSelection",
  });
    const productInfo = productInfoMap[emergencyProduct];
    if (!productInfo) {
    
      // Handle unknown product case
      const errorMessage = this.createChatBotMessage(
        "I don't have information about that product. Please choose Postpill or Postinor-2.",
        { 
          delay: 500,
          widget: "emergencyProductOptions"
        }
        
      );
   
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
        currentStep: "emergencyProduct",
      }));
      return;
    
    }

    
    // Phase 2: Apply smart timing for medical content (high urgency)
    const timing = SmartMessageTimer.createTimingConfig(productInfo, 'info', 'high');
    const responseMessage = this.createChatBotMessage(productInfo, { delay: timing.delay });
    const messages = [userMessage, responseMessage];
  
    // Smart image display with formatted intro
    if (widgets.hasImage && widgets.imageWidget) {
      const imageIntro = MessageFormatter.formatInfo(
        `Here's what ${emergencyProduct} looks like:`
      );
      const imageMessage = this.createChatBotMessage(
        imageIntro,
        { widget: widgets.imageWidget, delay: timing.delay + 800 }
      );
      messages.push(imageMessage);
    }

    // Smart audio display with formatted intro  
    if (widgets.hasAudio && widgets.audioWidget) {
      const audioIntro = MessageFormatter.formatTip(
        `Click to listen to a short introduction of ${emergencyProduct} in Pidgin, if you want to.`
      );
      const audioDelay = widgets.hasImage ? timing.delay + 1500 : timing.delay + 800;
      const audioMessage = this.createChatBotMessage(
        audioIntro,
        { delay: audioDelay, widget: widgets.audioWidget }
      );
      messages.push(audioMessage);
    }

    // Track product info message with smart timing (calculated based on medical content)
    await this.api.createConversation({
      message_text: productInfo,
      message_type: 'bot',
      chat_step: "emergencyProductDetails",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: timing.delay
    });

    // Add follow-up with button guidance
    const followUpText = MessageFormatter.addButtonGuidance(
      "Do you want to find out about other family planning methods?"
    );
    const followUpDelay = timing.delay + 1500;
    const followUpMessage = this.createChatBotMessage(
      followUpText,
      { 
        delay: followUpDelay,
        widget: "learnMoreMethods"
      }
    );
    messages.push(followUpMessage);
    
    // Phase 3: Add flow end navigation options after follow-up
    const flowEndText = MessageFormatter.formatInfo(
      "Or you can choose another action below:"
    );
    const flowEndDelay = followUpDelay + 800;
    const flowEndMessage = this.createChatBotMessage(
      flowEndText,
      { 
        delay: flowEndDelay,
        widget: "flowEndOptions"
      }
    );
    messages.push(flowEndMessage);
    
    // Track flow end options message
    await this.api.createConversation({
      message_text: flowEndMessage.message,
      message_type: 'bot',
      chat_step: "flowEndOptions",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "flowEndOptions",
      message_delay_ms: flowEndDelay
    }).catch(err => console.error('Failed to save flow end options:', err));

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: "methodDetails",
    }));
  };

  // =============================================================================
  // PREVENT FUTURE PATH
  // =============================================================================

  private handlePreventFuturePath = async(userMessage: ChatMessage): Promise<void> => {
    // Format intro message to match WhatsApp transcript exactly
    const introText = "Allright 👌\nI am happy to provide you with more information about family planning methods that are effective and safe for you.";
    const introTiming = SmartMessageTimer.createTimingConfig(introText, 'info', 'medium');
    const responseMessage = this.createChatBotMessage(introText, { delay: introTiming.delay });

    // Phase 2: Question exactly as in WhatsApp
    const questionText = "For how long do you want to prevent pregnancy?";
    const durationMessage = this.createChatBotMessage(
      questionText,
      { 
        delay: introTiming.delay + 800,
        widget: "preventionDurationOptions"
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, durationMessage],
      currentStep: "duration",
    }));
    
    // Track bot messages with smart timing and record FpmInteraction
    await Promise.all([
      this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: "preventFuturePath",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: introTiming.delay
      }),
      this.api.createFpmInteraction({
        prevention_choice: "Prevent in future",
        contraception_type: "Future prevention"
      } as any)
    ]).catch(err => console.error('Failed to save response:', err));
    
    await this.api.createConversation({
      message_text: durationMessage.message,
      message_type: 'bot',
      chat_step: "preventionDurationOptions",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "preventionDurationOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save duration message:', err));
  };

  // =============================================================================
  // PREVENTION DURATION SELECTION
  // =============================================================================
  // PREVENTION DURATION SELECTION
  // Handles both button clicks and typed natural language inputs
  handlePreventionDurationSelection = async(duration: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(duration);

    // Normalize the input (handles "Up to 1 year", "short term", "1 year", etc.)
    const durationKey = normalizeDurationInput(duration);

    if (!durationKey) {
      // User typed something we don't recognize
      const errorMessage = this.createChatBotMessage(
        "I didn't recognize that duration option. Please select from the options below:",
        { widget: "preventionDurationOptions", delay: 400 }
      );
      
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
      }));
      return;
    }

    // Track user duration selection
    await this.api.createConversation({
      message_text: duration,
      message_type: 'user',
      chat_step: "preventionDurationSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "preventionDurationOptions"
    }).catch(err => console.error('Failed to save user selection:', err));
    
    // Now using the getMethodOptionsForDuration function!
    const availableMethods = getMethodOptionsForDuration(durationKey);

    // Phase 2: Enhanced duration config with proper formatting (using display labels as keys)
    const durationConfig: Record<PreventionDuration, { message: string; widget: string }> = {
      "Up to 1 year": {
        message: "The short-term family planning methods are:\n\n" +
          "1. Daily contraceptive pills\n" +
          "2. The barrier contraceptives which are Diaphragms and Condoms\n" +
          "3. Injectables.",
        widget: "shortTermMethods"
      },
      "1 - 2 years": {
        message: "If you want to prevent pregnancy within 1-2 years, you can use any of the short-acting family planning methods, the Injectables or the Implants.",
        widget: "mediumTermMethods"
      },
      "3 - 4 years": {
        message: "For 3-4 years, you can use:\n\n" +
          "1. Injectables\n" +
          "2. IUD (Intrauterine Device)\n" +
          "3. IUS (Intrauterine System)\n" +
          "4. Implants",
        widget: "longTermMethods"
      },
      "5 - 10 years": {
        message: "For 5-10 years, the most effective long-lasting methods are:\n\n" +
          "1. IUD (up to 10 years)\n" +
          "2. IUS (up to 5 years)\n" +
          "3. Implants (up to 5 years)",
        widget: "extendedLongTermMethods"
      },
      "Permanently": {
        message: "For permanent prevention of pregnancy, these methods are available:\n\n" +
          "1. Tubal ligation (for women)\n" +
          "2. Vasectomy (for men)\n\n" +
          "⚠️ Please note: These procedures are permanent and irreversible.",
        widget: "permanentMethods"
      },
      "Not sure": {
        message: "It is okay to be unsure. These are options to consider based on your needs and preferences:\n" +
          "1) Devices that healthcare providers insert, lasting 3-10 years.\n" +
          "2) Injectables that last 3 months.\n" +
          "3) Methods you can start and stop on your own at flexible times.\n" +
          "4) Permanent methods.\n" +
          "Take the time to evaluate these options before making your decision.\n\n" +
          "If you want to be connected to a medical professional agent, just type the word \"human\" at any time.",
        widget: "notSureCategoryOptions"
      }
    };

    const config = durationConfig[durationKey];
    
    if (!config) {
      // Handle invalid duration - user typed unrecognized input
      const errorMessage = this.createChatBotMessage(
        "I didn't recognize that duration option. Let me show you the available prevention durations again.",
        { 
          delay: 500,
          widget: "preventionDurationOptions"
        }
      );
      
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
        currentStep: "duration",
      }));
      
      // Track unrecognized duration input
      await this.api.createResponse({
        response_category: 'ContraceptionDuration',
        response_type: 'user',
        question_asked: 'How long do you want to prevent pregnancy?',
        user_response: duration,
        widget_used: 'preventionDurationOptions',
        available_options: PREVENTION_DURATION_OPTIONS,
        step_in_flow: "preventionDurationSelection",
      }).catch(err => console.error('Failed to track unrecognized duration:', err));

      return;
    }

    // Phase 2: Apply smart timing based on message content
    const responseTiming = SmartMessageTimer.createTimingConfig(config.message, 'info', 'medium');
    const responseMessage = this.createChatBotMessage(config.message, { delay: responseTiming.delay });

    // Method selection prompt - match WhatsApp exactly
    const selectionText = "Click on any of the methods to get more information about it.";
    const methodSelectionMessage = this.createChatBotMessage(
      selectionText,
      { 
        delay: responseTiming.delay + 1000,
        widget: config.widget
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, methodSelectionMessage],
      currentStep: "methodDetails",
    }));
    // Track bot messages with smart timing (save to server)
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "preventionDurationResponse",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: responseTiming.delay
    }).catch(err => console.error('Failed to save response:', err));
    
    await this.api.createConversation({
      message_text: methodSelectionMessage.message,
      message_type: 'bot',
      chat_step: "methodSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: config.widget,
      message_delay_ms: responseTiming.delay + 1000
    }).catch(err => console.error('Failed to save selection message:', err));
    // Track successful duration selection in FpmInteraction
    try {
      await Promise.all([
        this.api.createFpmInteraction({
          prevention_duration: duration,
          prevention_choice: 'Prevent in future'
        }),
        this.api.createResponse({
          response_category: 'PreventionDuration',
          response_type: 'user',
          question_asked: 'How long do you want to prevent pregnancy?',
          user_response: duration,
          widget_used: config.widget,
          available_options: Object.keys(durationConfig),
          step_in_flow: 'preventionDurationSelection',
        })
      ]);
    } catch (error) {
      console.error('API call failed:', error);
    }

    // After showing method details, prompt medical conditions screening for user safety
    const screeningIntro = this.createChatBotMessage(
      "Before we continue, please check these medical conditions — some methods may not be safe for people with certain conditions.",
      { delay: 800 }
    );

    const screeningQuestion = this.createChatBotMessage(
      "Do you have any of the medical conditions listed?",
      { delay: 1200, widget: 'medicalConditionsCheck' }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, screeningIntro, screeningQuestion],
      // reuse existing step
      currentStep: 'methodDetails',
    }));

    // Record that medical screening was shown
    try {
      await this.api.createFpmInteraction({
        medical_screening_shown: 'yes'
      } as any);
    } catch (error) {
      console.error('Failed to record medical screening shown:', error);
    }

  };

  // =============================================================================
  // "NOT SURE" CATEGORY SELECTION HANDLER
  // =============================================================================
  handleNotSureCategorySelection = async(category: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(category);

    // Map "Not sure" category to methods
    let widget = "";
    let message = "";
    
    switch (category) {
      case "3-10 years":
        message = "For devices that last 3-10 years, you have these options:\n\n" +
          "• IUD (Intrauterine Device) - Up to 10 years\n" +
          "• IUS (Intrauterine System) - Up to 5 years\n" +
          "• Implants - Up to 3-5 years\n\n" +
          "These are inserted by healthcare providers and work continuously.";
        widget = "extendedLongTermMethods";
        break;
      
      case "3 months":
        message = "For injectables that last 3 months:\n\n" +
          "• Depo-Provera (The shot)\n" +
          "• One injection every 3 months\n" +
          "• Very effective and convenient\n\n" +
          "You just need to remember to get your shot every 3 months.";
        widget = "mediumTermMethods";
        break;
      
      case "Flexible methods":
        message = "For methods you can start and stop on your own:\n\n" +
          "• Daily pills - Take one every day\n" +
          "• Diaphragm - Use when needed\n" +
          "• Female condom - Use when needed\n" +
          "• Male condom - Use when needed\n\n" +
          "These give you complete control and flexibility.";
        widget = "shortTermMethods";
        break;
      
      case "Permanent methods":
        message = "For permanent prevention:\n\n" +
          "• Tubal ligation (for women)\n" +
          "• Vasectomy (for men)\n\n" +
          "⚠️ Important: These are permanent and irreversible. Please speak with a healthcare provider before deciding.";
        widget = "permanentMethods";
        break;
      
      default:
        message = "I didn't recognize that option. Please select from the categories shown.";
        widget = "notSureCategoryOptions";
    }

    const responseMessage = this.createChatBotMessage(message, { delay: 500 });
    const methodSelectionMessage = this.createChatBotMessage(
      "Which method do you want to learn about?",
      { delay: 1000, widget: widget }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, methodSelectionMessage],
      currentStep: "methodDetails",
    }));

    // Track the selection
    await this.api.createConversation({
      message_text: category,
      message_type: 'user',
      chat_step: "notSureCategorySelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "notSureCategoryOptions"
    }).catch(err => console.error('Failed to save user selection:', err));

    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "notSureCategoryResponse",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save response:', err));
  };
  //old handlePreventionDurationSelection
  // =============================================================================
  // handlePreventionDurationSelection = (duration: string): void => {
  //   const userMessage: ChatMessage = {
  //     message: duration,
  //     type: "user",
  //     id: uuidv4(),
  //   };

  //   let responseMessage: ChatMessage;
  //   let widget = "";

  //   const durationKey = duration as PreventionDuration;
  //   // const availableMethods = getMethodOptionsForDuration(durationKey);

  //   switch (durationKey) {
  //     case "Up to 1 year":
  //       responseMessage = this.createChatBotMessage(
  //         "The short-term family planning methods are:\n\n1. Daily contraceptive pills\n2. The barrier contraceptives (diaphragm, female condom, male condom)",
  //         { delay: 500 }
  //       );
  //       widget = "shortTermMethods";
  //       break;

  //     case "1 - 2 years":
  //       responseMessage = this.createChatBotMessage(
  //         "If you want to prevent pregnancy within 1-2 years, you can use any of the short-acting family planning methods or injectables.",
  //         { delay: 500 }
  //       );
  //       widget = "mediumTermMethods";
  //       break;

  //     case "3-4 years":
  //       responseMessage = this.createChatBotMessage(
  //         "For 3-4 years of protection, you can use medium-term methods like injectables, IUD, IUS, or implants.",
  //         { delay: 500 }
  //       );
  //       widget = "longTermMethods";
  //       break;

  //     case "5-10 years":
  //       responseMessage = this.createChatBotMessage(
  //         "For long-term protection (5-10 years), the most effective methods are IUD, IUS, and implants.",
  //         { delay: 500 }
  //       );
  //       widget = "extendedLongTermMethods";
  //       break;

  //     case "Permanently":
  //       responseMessage = this.createChatBotMessage(
  //         "For permanent prevention of pregnancy, you can consider sterilization methods. These are permanent and irreversible procedures.",
  //         { delay: 500 }
  //       );
  //       widget = "permanentMethods";
  //       break;

  //     default:
  //       responseMessage = this.createChatBotMessage(
  //         "I didn't recognize that duration option. Let me show you the available prevention durations again.",
  //         { 
  //           delay: 500,
  //           widget: "preventionDurationOptions"
  //         }
  //       );
  //       widget = "preventionDurationOptions";
  //       break;
  //   }

  //   const methodSelectionMessage = this.createChatBotMessage(
  //     "Click on any of the methods to get more information about it:",
  //     { 
  //       delay: 1000,
  //       widget: widget
  //     }
  //   );

  //   this.setState((prev: ChatbotState) => ({
  //     ...prev,
  //     messages: [...prev.messages, userMessage, responseMessage, methodSelectionMessage],
  //     currentStep: "methodDetails",
  //   }));
  // };

  // Helper methods for formatting method lists
  private formatMethodList = (methods: ContraceptiveMethod[]): string => {
    return methods.map((method, index) => `${index + 1}. ${method}`).join("\n");
  };

  private formatInlineMethodList = (methods: ContraceptiveMethod[]): string => {
    if (methods.length === 0) return "";
    if (methods.length === 1) return methods[0];
    if (methods.length === 2) return methods.join(" and ");
    return methods.slice(0, -1).join(", ") + ", and " + methods[methods.length - 1];
  };

  private getAllMethodOptions(): Record<string, string> {
  return {
    "Condom": "Barrier method",
    "Pill": "Oral contraceptives",
    "Injection": "Injectable contraceptives",
    "Implant": "Hormonal implant",
    "IUD": "Intrauterine device",
    "Natural": "Fertility awareness methods",
    "Other": "Other methods"
  };
}

  // =============================================================================
  // METHOD SELECTION HANDLING
  // =============================================================================
  // METHOD SELECTION HANDLER (Task 5: Product Information Flow)
  // =============================================================================

  handleMethodOptionsSelection = async(method: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(method);

    // Track user method selection
    await this.api.createConversation({
      message_text: method,
      message_type: 'user',
      chat_step: "methodSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "methodOptions"
    }).catch(err => console.error('Failed to save user selection:', err));

    // Task 5: Get product information from productData
    const productInfo = getProductInfo(method);

    if (!productInfo) {
      const errorText = MessageFormatter.formatWarning(
        "I don't have detailed information about that method. Please consult with a healthcare provider."
      );
      const errorMessage = this.createChatBotMessage(errorText, { delay: 500 });
      
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
        currentStep: "methodDetails",
        preventPregnancy: {
          ...prev.preventPregnancy,
          selectedProduct: method
        }
      }));
      return;
    }

    // Task 5: Store selected product in state for later handlers
    this.setState((prev: ChatbotState) => ({
      ...prev,
      preventPregnancy: {
        ...prev.preventPregnancy,
        selectedProduct: method
      }
    }));

    const messages: ChatMessage[] = [userMessage];

    // Task 5.1: Display full product description
    let productDescription = `*${productInfo.name.toUpperCase()}*\n\n${productInfo.description}`;
    
    if (productInfo.howItWorks) {
      productDescription += `\n\n${productInfo.howItWorks}`;
    }
    
    if (productInfo.usage) {
      productDescription += `\n\n${productInfo.usage}`;
    }

    const descriptionTiming = SmartMessageTimer.createTimingConfig(productDescription, 'info', 'medium');
    const descriptionMessage = this.createChatBotMessage(productDescription, { delay: descriptionTiming.delay });
    messages.push(descriptionMessage);

    // Track product description
    await this.api.createConversation({
      message_text: descriptionMessage.message,
      message_type: 'bot',
      chat_step: "productDescription",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: descriptionTiming.delay
    }).catch(err => console.error('Failed to save product description:', err));

    // Task 5.2: Display audio prompt (matching WhatsApp script exactly)
    const audioDelay = descriptionTiming.delay + 1200;
    const audioMessage = this.createChatBotMessage(
      productInfo.audioPrompt,
      { delay: audioDelay }
    );
    messages.push(audioMessage);

    await this.api.createConversation({
      message_text: audioMessage.message,
      message_type: 'bot',
      chat_step: "audioPrompt",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: audioDelay
    }).catch(err => console.error('Failed to save audio prompt:', err));

    // Task 5.3: Ask "What do you want to learn about?" with buttons
    const choiceDelay = audioDelay + 800;
    const choiceMessage = this.createChatBotMessage(
      "What do you want to learn about?",
      { 
        delay: choiceDelay,
        widget: 'productDetailOptions'
      }
    );
    messages.push(choiceMessage);

    await this.api.createConversation({
      message_text: choiceMessage.message,
      message_type: 'bot',
      chat_step: "productDetailChoice",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: 'productDetailOptions',
      message_delay_ms: choiceDelay
    }).catch(err => console.error('Failed to save choice prompt:', err));

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: "productDetailChoice",
    }));
    
    await this.api.createResponse({
      response_category: "ContraceptionMethod",
      response_type: "user",
      question_asked: "Which family planning method do you want to know about",
      user_response: method,
      widget_used:"methodOptions",
      available_options: Object.keys(PRODUCT_DATA),
      step_in_flow: "methodOptionsSelection",
    })
  };

  // =============================================================================
  // PRODUCT DETAIL SELECTION HANDLER (Task 5: Advantages/Disadvantages OR Who Can Use)
  // =============================================================================

  handleProductDetailSelection = async(choice: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(choice);
    
    // Track user choice
    await this.api.createConversation({
      message_text: choice,
      message_type: 'user',
      chat_step: "productDetailSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "productDetailOptions"
    }).catch(err => console.error('Failed to save detail choice:', err));

    // Get the selected product from state
    const selectedProduct = this.state.preventPregnancy?.selectedProduct;
    if (!selectedProduct) {
      const errorMessage = this.createChatBotMessage(
        "Sorry, I couldn't find the product information. Please select a method again.",
        { delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage]
      }));
      return;
    }

    const productInfo = getProductInfo(selectedProduct);
    if (!productInfo) {
      const errorMessage = this.createChatBotMessage(
        "Sorry, I couldn't find the product information. Please select a method again.",
        { delay: 500 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage]
      }));
      return;
    }

    const messages: ChatMessage[] = [userMessage];

    if (choice === 'Advantages and dis-') {
      // Task 5.4: Display advantages
      const advantagesText = `*ADVANTAGES*\n\n${productInfo.advantages.map((adv, idx) => `${idx + 1}. ${adv}`).join('\n')}`;
      const advantagesDelay = 600;
      const advantagesMessage = this.createChatBotMessage(advantagesText, { delay: advantagesDelay });
      messages.push(advantagesMessage);

      await this.api.createConversation({
        message_text: advantagesMessage.message,
        message_type: 'bot',
        chat_step: "advantages",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: advantagesDelay
      }).catch(err => console.error('Failed to save advantages:', err));

      // Task 5.5: Display disadvantages
      const disadvantagesText = `*DISADVANTAGES*\n\n${productInfo.disadvantages.map((dis, idx) => `${idx + 1}. ${dis}`).join('\n')}`;
      const disadvantagesDelay = advantagesDelay + 1000;
      const disadvantagesMessage = this.createChatBotMessage(disadvantagesText, { delay: disadvantagesDelay });
      messages.push(disadvantagesMessage);

      await this.api.createConversation({
        message_text: disadvantagesMessage.message,
        message_type: 'bot',
        chat_step: "disadvantages",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: disadvantagesDelay
      }).catch(err => console.error('Failed to save disadvantages:', err));

    } else if (choice === 'Who can(not) use it') {
      // Task 5.6: Display who can use
      if (productInfo.whoCanUse && productInfo.whoCanUse.length > 0) {
        const whoCanUseText = `*WHO CAN USE ${productInfo.name.toUpperCase()}*\n\n${productInfo.whoCanUse.map((who, idx) => `${idx + 1}. ${who}`).join('\n')}`;
        const whoCanUseDelay = 600;
        const whoCanUseMessage = this.createChatBotMessage(whoCanUseText, { delay: whoCanUseDelay });
        messages.push(whoCanUseMessage);

        await this.api.createConversation({
          message_text: whoCanUseMessage.message,
          message_type: 'bot',
          chat_step: "whoCanUse",
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: whoCanUseDelay
        }).catch(err => console.error('Failed to save who can use:', err));
      }

      // Task 5.7: Display who cannot use
      if (productInfo.whoCannotUse && productInfo.whoCannotUse.length > 0) {
        const whoCannotUseText = `*WHO CANNOT USE ${productInfo.name.toUpperCase()}*\n\n${productInfo.whoCannotUse.map((who, idx) => `${idx + 1}. ${who}`).join('\n')}`;
        const whoCannotUseDelay = (productInfo.whoCanUse && productInfo.whoCanUse.length > 0) ? 1600 : 600;
        const whoCannotUseMessage = this.createChatBotMessage(whoCannotUseText, { delay: whoCannotUseDelay });
        messages.push(whoCannotUseMessage);

        await this.api.createConversation({
          message_text: whoCannotUseMessage.message,
          message_type: 'bot',
          chat_step: "whoCannotUse",
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: whoCannotUseDelay
        }).catch(err => console.error('Failed to save who cannot use:', err));
      }
    }

    // Task 5.8: Display additional info if present
    if (productInfo.additionalInfo) {
      const additionalDelay = 2000;
      const additionalMessage = this.createChatBotMessage(productInfo.additionalInfo, { delay: additionalDelay });
      messages.push(additionalMessage);

      await this.api.createConversation({
        message_text: additionalMessage.message,
        message_type: 'bot',
        chat_step: "additionalInfo",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: additionalDelay
      }).catch(err => console.error('Failed to save additional info:', err));
    }

    // Task 5.9: Display videos if available
    if (productInfo.videos && productInfo.videos.length > 0) {
      const videosText = `Here are some helpful videos:\n\n${productInfo.videos.map((video, idx) => `${idx + 1}. ${video}`).join('\n')}`;
      const videosDelay = 2500;
      const videosMessage = this.createChatBotMessage(videosText, { delay: videosDelay });
      messages.push(videosMessage);

      await this.api.createConversation({
        message_text: videosMessage.message,
        message_type: 'bot',
        chat_step: "videos",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: videosDelay
      }).catch(err => console.error('Failed to save videos:', err));
    }

    // Task 5.10: Display purchase info if available
    if (productInfo.purchaseInfo) {
      const purchaseDelay = 3000;
      const purchaseMessage = this.createChatBotMessage(productInfo.purchaseInfo, { delay: purchaseDelay });
      messages.push(purchaseMessage);

      await this.api.createConversation({
        message_text: purchaseMessage.message,
        message_type: 'bot',
        chat_step: "purchaseInfo",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: purchaseDelay
      }).catch(err => console.error('Failed to save purchase info:', err));
    }

    // Task 5.11: Ask "Do you want to learn about other family planning methods?"
    const learnMoreDelay = 3500;
    const learnMoreMessage = this.createChatBotMessage(
      "Do you want to learn about other family planning methods?",
      { 
        delay: learnMoreDelay,
        widget: 'learnOtherMethods'
      }
    );
    messages.push(learnMoreMessage);

    await this.api.createConversation({
      message_text: learnMoreMessage.message,
      message_type: 'bot',
      chat_step: "learnOtherMethods",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: 'learnOtherMethods',
      message_delay_ms: learnMoreDelay
    }).catch(err => console.error('Failed to save learn more prompt:', err));

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: "learnOtherMethods",
    }));
  };

  // =============================================================================
  // LEARN OTHER METHODS HANDLER (Task 5: Navigation after product details)
  // =============================================================================

  handleLearnOtherMethods = async(answer: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(answer);
    
    // Track user answer
    await this.api.createConversation({
      message_text: answer,
      message_type: 'user',
      chat_step: "learnOtherMethodsResponse",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "learnOtherMethods"
    }).catch(err => console.error('Failed to save response:', err));

    if (answer.toLowerCase() === 'yes') {
      // Return to duration selection to explore more methods
      const returnMessage = this.createChatBotMessage(
        "Great! For how long do you want to prevent pregnancy?",
        { 
          delay: 500,
          widget: 'preventionDurationOptions'
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, returnMessage],
        currentStep: "preventionDuration",
        preventPregnancy: {
          ...prev.preventPregnancy,
          selectedProduct: undefined // Clear selected product
        }
      }));

      await this.api.createConversation({
        message_text: returnMessage.message,
        message_type: 'bot',
        chat_step: "preventionDuration",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: 'preventionDurationOptions',
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save return message:', err));

    } else {
      // End of product flow, show flow end options
      const endMessage = this.createChatBotMessage(
        "Allright 👌 What would you like to do next?",
        { 
          delay: 500,
          widget: 'flowEndOptions'
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, endMessage],
        currentStep: "flowEnd",
        preventPregnancy: {
          ...prev.preventPregnancy,
          selectedProduct: undefined // Clear selected product
        }
      }));

      await this.api.createConversation({
        message_text: endMessage.message,
        message_type: 'bot',
        chat_step: "flowEnd",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: 'flowEndOptions',
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save end message:', err));
    }
  };

  // =============================================================================
  // MEDICAL CONDITIONS SCREENING RESPONSE
  // =============================================================================
  handleMedicalConditionsResponse = async(answer: string): Promise<void> => {
    const normalized = answer.trim().toLowerCase();
    const userMessage = this.createUserMessage(answer);

    // Record user response in FpmInteraction
    try {
      await this.api.createFpmInteraction({
        has_medical_conditions: normalized === 'yes' ? 'yes' : (normalized === 'no' ? 'no' : 'unknown'),
        requires_clinic_referral: normalized === 'yes' || normalized === "i don't know"
      } as any);
    } catch (error) {
      console.error('Failed to record medical conditions response:', error);
    }

    if (normalized === 'yes' || normalized === "i don't know") {
      const referralMsg = this.createChatBotMessage(
        "⚠️ It looks like you might need to consult a healthcare professional before using this method. Would you like me to find a clinic near you or connect you with a clinician?",
        { delay: 600, widget: 'flowEndOptions' }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, referralMsg],
        currentStep: 'clinicReferral',
      }));
    } else {
      const proceedMsg = this.createChatBotMessage(
        "Great — this method is likely safe for you. Would you like to learn how to use it, or explore other methods?",
        { delay: 600, widget: 'flowEndOptions' }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, proceedMsg],
        // reuse existing step to avoid type mismatch
        currentStep: 'methodDetails',
      }));
    }
  };

  // =============================================================================
  // METHOD INFORMATION DATABASE
  // =============================================================================

  private getMethodInformation = (method: ContraceptiveMethod): {
    description: string;
    imageWidget?: string;
    imagePrompt?: string;
    audioWidget?: string;
    audioPrompt?: string;
  } | null => {
    // Using a record to store method information for better maintainability
    const methodData: Record<string, {
      description: string;
      imageWidget?: string;
      imagePrompt?: string;
      audioWidget?: string;
      audioPrompt?: string;
    }> = {
      "Daily pills": {
        description: "Daily pills are combined oral contraceptive pills for pregnancy prevention, dermatological and gynecological benefits. They work by making the sperm difficult to enter the womb.\n\nDaily pills are either a 21-day pack (Dianofem and Desofem) or a 28-day pack (Levofem). One pill is taken each day at about the same time for 21 days. Depending on your pack, you will either have a 7-day break (as in the 21-day pack) or you will take the pill that contains Iron for 7 days (the 28-day pack).\n\nThey are very effective (99%) when used correctly. They must be taken daily at the same time. They can help regulate menstrual cycles and reduce menstrual cramps.",
        imageWidget: "dailyPillsAudio",
        imagePrompt: "Here is what daily pills in Pidgin, if you want to.",
        audioWidget: "dailyPillsAudio",
        audioPrompt: "Click to listen to a short introduction of daily pills in Pidgin, if you want to."
      },
      "Diaphragm": {
        description: "A diaphragm or cap is a barrier contraceptive device inserted into the vagina before sex to cover the cervix so that sperm can't get into the womb (uterus). You need to use spermicide with it (spermicides kill sperm). \n\nThe diaphragm must be left in place for at least 6 hours after sex.  The diaphragm is a vaginal barrier contraceptive that is woman-controlled, nonhormonal, and appropriate for women who cannot or do not want to use hormonal contraceptive methods, intrauterine devices, or condoms.\n\nThe path has no partner clinic referral.",
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
        description: "Contraceptive implants are small, flexible rods inserted under the skin, typically in the arm. They release hormones (usually progestin) to prevent pregnancy. \n\nThey are long-term birth control methods also called long-acting reversible contraception, or LARC. They provide contraception, lasting up to 3 - 5 years but can be removed at any time. \n\nThey work by preventing the release of egg and thickening the cervical mucus making it difficult for sperm to reach the egg.",
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
    } || null;
  };
}

export default PreventPregnancyActionProvider;
export type { PreventPregnancyProviderInterface };