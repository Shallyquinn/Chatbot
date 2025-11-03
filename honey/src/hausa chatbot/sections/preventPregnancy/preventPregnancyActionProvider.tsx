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
    this.createChatBotMessage = createChatBotMessage;
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
    
    const userMessage: ChatMessage = {
      message: "Rigakafin daukar ciki",
      type: "user",
      id: uuidv4(),
    };
    const responseMessage = this.createChatBotMessage(
      "Na gane! 👍\n\nKina wurin da ya dace, zan iya taimaka miki a kan wannan.",
      { delay: 500 }
    );

    const followUpMessage = this.createChatBotMessage(
      "Wace irin hanyar hana haihuwa kike son sani?",
      { 
        delay: 1000,
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
    
    const userMessage: ChatMessage = {
      message: type,
      type: "user",
      id: uuidv4(),
    };

    // Track user selection
    await this.api.createConversation({
      message_text: type,
      message_type: 'user',
      chat_step: "contraceptionTypeSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "contraceptionTypeOptions"
    }).catch(err => console.error('Failed to save user selection:', err));

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
      question_asked:'Wace irin hanyar hana haihuwa kike son sani?',
      user_response:contraceptionType,
      widget_used:'contraceptiontypeoptions',
      available_options:['Ta  gaggawa', 'Don hana daukar ciki nan gaba'],
      step_in_flow:'contraceptionTypeOptions',
    }).catch(err => console.error('Failed to save response:', err));
  };
  
  // New method to handle invalid contraception types
  private handleInvalidContraceptionType = (userMessage: ChatMessage): void => {
    const responseMessage = this.createChatBotMessage(
      "Ban gane wannan zaɓin ba. Don Allah ki zaɓi ko 'Ta  gaggawa' ko 'Don hana daukar ciki nan gaba'",
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
    const responseMessage = this.createChatBotMessage(
      "Don guje wa samun ciki bayan yin jima’i ba tare da kariya ba, za ki iya shan kwayar gaggawar hana haihuwa (emergency contraceptive pill).\n\nWadannan kwayoyi suna da matuƙar tasiri idan an sha su cikin awa 24 zuwa 72 bayan yin jima’i ba tare da kariya ba. Ana ba da shawarar kar a sha kwayar fiye da sau uku a wata guda. Idan kina lokacin yin ƙwai (ovulation), yana da kyau ki yi amfani da wata hanya ta daban kamar kwandom (condom).",
      { delay: 500 }
    );

    //use type-safe products list
    const availableProducts: EmergencyProduct[] = ["postpill", "postinor2"];
    const productList = availableProducts.map((product, index) => `${index + 1}. ${product}`).join("\n");

    const productMessage = this.createChatBotMessage(
      `Bari in gaya miki wasu daga cikin ingantattun nau’ikan kwayar gaggawar hana haihuwa da ake samu:\n${productList}`,
      { delay: 1000 }
    );

    const selectionMessage = this.createChatBotMessage(
      "Wane samfurin kake so ka koya game da shi?",
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
    
    // Track all bot messages in emergency path
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "emergencyPath",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save response:', err));
    
    await this.api.createConversation({
      message_text: productMessage.message,
      message_type: 'bot',
      chat_step: "emergencyPath",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 1000
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
    const userMessage: ChatMessage = {
      message: product,
      type: "user", 
      id: uuidv4(),
    };



    const widgets = this.findMediaWidgets(emergencyProduct);
   

    // Using type-safe constants instead of magic strings
    const productInfoMap: Record<EmergencyProduct, string > = {
      "postpill": "Postpill kwayar gaggawar hana haihuwa ce da kamfanin DKT ke samarwa. Kwaya ce guda ɗaya, tana ɗauke da 1.5 mg Levonorgestrel. Ya kamata a sha ta cikin awa 72 (kwanaki 3) bayan yin jima’i ba tare da kariya ba.\n\nShan kwayar da wuri shi zai tai aka wurin yin aiki sosai. Ba ta aiki idan kina da ciki, kuma ba ta cutar da ciki da aka riga aka samu.\n\n Za ki iya samun Postpill a kowace pharmacy ko shagon lafiya da ke kusa da ke. Tana da tasiri har zuwa kashi 95% idan an sha ta cikin awa 24 bayan yin jima’i ba tare da kariya ba.\n\nIdan sama da awa 120 (kwanaki 5) sun wuce bayan yin jima’i, ba za ta yi aiki ba. A irin wannan yanayin, yana da kyau ki tuntuɓi ma’aikacin lafiya don karin shawara.",
      
      "postinor2": "Postinor-2 kwayar gaggawar hana haihuwa ce wadda ke ɗauke da levonorgestrel. Ya kamata a sha ta cikin awa 72 (kwanaki 3) bayan yin jima’i ba tare da kariya ba domin samun sakamako mai kyau.\n\nIt works by preventing or delaying ovulation. The sooner you take it after unprotected sex, the more effective it is.\n\nBa za a yi amfani da ita a matsayin hanyar hana haihuwa ta kullum ba.",
    };
    await this.api.createResponse({
    response_category: "EmergencyProduct",
    response_type: "user",
    question_asked: "Wane irin kwayar gaggawar hana haihuwa kike son jin bayani akai?",
    user_response: emergencyProduct,
    widget_used: "emergencyProductOptions",
    available_options: ["Postpill", "Postinor-2"],
    step_in_flow: "emergencyProductSelection",
  });
    const productInfo = productInfoMap[emergencyProduct];
    if (!productInfo) {
    
      // Handle unknown product case
      const errorMessage = this.createChatBotMessage(
        "Ba ni da bayani game da wannan samfurin. Don Allah ki zaɓi Postpill ko Postinor-2.",
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

    

    const responseMessage = this.createChatBotMessage(productInfo, { delay: 500 });
    const messages = [userMessage, responseMessage];
  //smart image display
    if (widgets.hasImage && widgets.imageWidget) {
      const imageMessage = this.createChatBotMessage(
        `Ga yanda ${emergencyProduct} yake:`,
        { widget: widgets.imageWidget, delay: 1000 }
      );
      messages.push(imageMessage);
    }

    //smart audio display
    if (widgets.hasAudio && widgets.audioWidget) {
      const audioMessage = this.createChatBotMessage(
        `Danna nan don sauraron taƙaitaccen bayani game da ${emergencyProduct} a cikin harshen Pidgin, idan kina so.`,
        { delay: widgets.hasImage? 1500 : 1000, widget: widgets.audioWidget }
      );
      messages.push(audioMessage);
    }

    const followUpMessage = this.createChatBotMessage(
      "Kina son jin bayani game da sauran hanyoyin tsara iyali?",
      { 
        delay: 1500,
        widget: "learnMoreMethods"
      }
    );
    messages.push(followUpMessage);

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
    const responseMessage = this.createChatBotMessage(
      "Toh, madalla! 😄\n\nIna farin cikin ba ki ƙarin bayanai game da hanyoyin tsara iyali da suke da matukar tasiri wajen hana samun ciki.",
      { delay: 500 }
    );

    const durationMessage = this.createChatBotMessage(
      "Na tsawon wane lokaci kike son hana samun ciki?",
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
    
    // Track bot messages
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "preventFuturePath",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save response:', err));
    
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
  // Optimization (Alternative Approach)
  handlePreventionDurationSelection = async(duration: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: duration,
      type: "user",
      id: uuidv4(),
    };

    // Track user duration selection
    await this.api.createConversation({
      message_text: duration,
      message_type: 'user',
      chat_step: "preventionDurationSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "preventionDurationOptions"
    }).catch(err => console.error('Failed to save user selection:', err));

    const durationKey = duration as PreventionDuration;
    
    // Now using the getMethodOptionsForDuration function!
    const availableMethods = getMethodOptionsForDuration(durationKey);

    // Configuration object for cleaner code maintenance
    const durationConfig: Record<PreventionDuration, { message: string; widget: string }> = {
      "short_term": {
        message: `Hanyoyin tsara iyali na ɗan gajeren lokaci sun haɗa da:\n\n ${this.formatMethodList(availableMethods)} \n\n1. Kwayoyin hana daukar ciki da ake sha kullum\n2. Hanyoyin kariya (diaphragm, kwaroron roba na mata, kwaroron roba na maza)`,
        widget: "shortTermMethods"
      },
      "medium_term": {
        message: "Idan kina son hana samun ciki na tsawon shekara 1 zuwa 2, za ki iya amfani da hanyoyi na ɗan lokaci kamar kwaya (pills) ko allurar hana haihuwa (injectables).",
        widget: "mediumTermMethods"
      },
      "long_term": {
        message: `Idan kuma kina son kariya na tsawon shekaru 3 zuwa 4, za ki iya amfani da hanyoyin matsakaici (medium-term) kamar allura, IUD (na’urar da ake saka a mahaifa), IUS, ko implants (na’urar da ake dasawa a hannu).${this.formatInlineMethodList(availableMethods)} `,
        widget: "longTermMethods"
      },
      "extended_term": {
        message: `Don kariya na tsawon lokaci (shekaru 5 zuwa 10), hanyoyin da suka fi tasiri sune IUD, IUS, da implants (na’urar da ake dasawa a hannu).${this.formatInlineMethodList(availableMethods)} `,
        widget: "extendedLongTermMethods"
      },
      "Permanently": {
        message: "Don hana samun ciki har abada, za ki iya la’akari da hanyoyin dashen dindindin (sterilisation). Waɗannan hanyoyi na dindindin ne kuma ba sa dawowa bayan an yi su.",
        widget: "permanentMethods"
      }
    };

    const config = durationConfig[durationKey];
    
    if (!config) {
      // Handle invalid duration
      const errorMessage = this.createChatBotMessage(
        "Ban gane wannan zaɓin tsawon lokacin ba. Bari in sake nuna miki zaɓuɓɓukan tsawon lokacin kariya da ake da su.",
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
       await this.api.createResponse({
      response_category:'ContraceptionDuration',
      response_type:'user',
      question_asked:'Na tsawon wane lokaci kike son hana samun ciki?',
      user_response:duration,
      widget_used:config,
      available_options:Object.keys(durationConfig),
      step_in_flow:"preventionDurationSelection",
    })

      return;
    
    }

    const responseMessage = this.createChatBotMessage(config.message, { delay: 500 });

    const methodSelectionMessage = this.createChatBotMessage(
      `Danna ɗaya daga cikin hanyoyi ${availableMethods.length} da ake da su domin samun ƙarin bayani:`,
      { 
        delay: 1000,
        widget: config.widget
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, methodSelectionMessage],
      currentStep: "methodDetails",
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "preventionDurationResponse",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save response:', err));
    
    await this.api.createConversation({
      message_text: methodSelectionMessage.message,
      message_type: 'bot',
      chat_step: "methodSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: config.widget,
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save selection message:', err));
    
    // Track response data
    await this.api.createResponse({
      response_category: 'ContraceptionDuration',
      response_type: 'user',
      question_asked: 'Na tsawon wane lokaci kike son hana samun ciki?',
      user_response: duration,
      widget_used: 'preventionDurationOptions',
      available_options: Object.keys(durationConfig),
      step_in_flow: "preventionDurationSelection",
    }).catch(err => console.error('Failed to save response data:', err));
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

  handleMethodOptionsSelection = async(method: string): Promise<void> => {
    await this.ensureChatSession();
    
    const contraceptiveMethod = method as ContraceptiveMethod;
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    // Track user method selection
    await this.api.createConversation({
      message_text: method,
      message_type: 'user',
      chat_step: "methodSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "methodOptions"
    }).catch(err => console.error('Failed to save user selection:', err));

    const methodInfo = this.getMethodInformation(contraceptiveMethod);
    const widgets = this.getWidgetsByMethodType(method);

    if (!methodInfo) {
      // Handle unknown method
      const errorMessage = this.createChatBotMessage(
        "Ba ni da cikakken bayani game da wannan hanya. Don Allah ki tuntubi ma’aikacin lafiya don karin shawara.",
        { delay: 500 }
      );
      
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
        currentStep: "methodDetails",
      }));
      return;
    }

    const responseMessage = this.createChatBotMessage(methodInfo.description, { delay: 500 });

    const messages = [userMessage, responseMessage];
    
    // Track main method information
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "methodDetails",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save method details:', err));


    // let audioMessage: ChatMessage | null = null;
    // if (methodInfo.audioWidget) {
    //   audioMessage = this.createChatBotMessage(
    //     methodInfo.audioPrompt,
    //     { 
    //       delay: 1000,
    //       widget: methodInfo.audioWidget
    //     }
    //   );
    // }

    // const messages = audioMessage 
    //   ? [userMessage, responseMessage, audioMessage]
    //   : [userMessage, responseMessage];

    // ✅ SMART AUDIO DISPLAY
    if (widgets.hasAudio && widgets.audioWidget) {
      const audioMessage = this.createChatBotMessage(
        `Danna nan don sauraron taƙaitaccen bayani game da ${method} a cikin harshen Pidgin, idan kina so.`,
        { 
          delay: widgets.hasImage ? 1500 : 1000,
          widget: widgets.audioWidget
        }
      );
      messages.push(audioMessage);
      
      // Track audio message
      await this.api.createConversation({
        message_text: audioMessage.message,
        message_type: 'bot',
        chat_step: "methodDetails",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: widgets.audioWidget,
        message_delay_ms: widgets.hasImage ? 1500 : 1000
      }).catch(err => console.error('Failed to save audio message:', err));
    }

    const followUpMessage = this.createChatBotMessage(
      "Kina son jin bayani game da sauran hanyoyin tsara iyali?",
      { 
        delay: 2000,
        widget: "learnMoreMethods"
      }
      
    );
    messages.push(followUpMessage);
    
    // Track follow-up message
    await this.api.createConversation({
      message_text: followUpMessage.message,
      message_type: 'bot',
      chat_step: "learnMoreMethods",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "learnMoreMethods",
      message_delay_ms: 2000
    }).catch(err => console.error('Failed to save follow-up:', err));
    

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: "methodDetails",
    }));
    
    await this.api.createResponse({
      response_category: "ContraceptionMethod",
      response_type: "user",
      question_asked: "Wace hanya ta tsara iyali kike son jin bayani akai?",
      user_response: method,
      widget_used:"learnMoreMethods",
      available_options: Object.keys(this.getAllMethodOptions?.() ?? {}),
      step_in_flow: "methodOptionsSelection",

    })
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
    const methodData: Partial<Record<ContraceptiveMethod, {
      description: string;
      imageWidget?: string;
      imagePrompt?: string;
      audioWidget?: string;
      audioPrompt?: string;
    }>>= {
      "Kwayan sha na kullum": {
        description: "Kwayar sha na kullum kwaya ce ta hana haihuwa da ake sha kowace rana don kare mace daga samun ciki, kuma tana da amfani ga fata da lafiyar mahaifa (gynecological benefits). Kwayar tana aiki ne ta hanyar hana maniyyi shiga mahaifa.\n\nAna samun ta a pack na kwanaki 21 (kamar Dianofem da Desofem) ko kuma kwanaki 28 (kamar Levofem). Ana shan kwaya ɗaya a kowace rana a lokaci guda na tsawon kwanaki 21. Idan kina amfani da pack na kwanaki 21, kina yin hutun kwanaki 7 kafin ki fara sabon pack.\n\nIdan kuma kina amfani da pack na kwanaki 28, kwayar kwanaki 7 na ƙarshe tana ƙunshe da iron (ba ta hana haihuwa, amma tana taimakawa lafiyar jini). Kwayoyin suna da inganci har zuwa kashi 99% idan ana amfani da su yadda ya kamata. Dole ne a sha su kowace rana a lokaci guda. Hakanan suna taimakawa wajen daidaita haila da rage ciwon mara yayin al’ada.",
        imageWidget: "dailyPillsAudio",
        imagePrompt: "Ga abin da ake nufi da daily pills.",
        audioWidget: "dailyPillsAudio",
        audioPrompt: "Danna ka saurari taƙaitaccen bayani game da kwayoyin sha na kullum a Pidgin, idan kana so."
      },
      "Diaphragm": {
        description: "Diaphragm ko cap wata hanya ce ta hana haihuwa (barrier method) da ake saka a cikin farji kafin jima’i domin ta rufe bakin mahaifa, ta yadda maniyyi ba zai iya shiga mahaifa ba. Dole ne a yi amfani da maganin kashe maniyyi (spermicide) tare da ita, domin wannan magani yana kashe maniyyi kafin su isa mahaifa. \n\nAna buƙatar barin diaphragm a cikin farji na aƙalla awanni 6 bayan jima’i kafin a cire ta. Wannan hanya ce (vaginal barrier contraceptive) da mace ke sarrafawa da kanta, ba ta ɗauke da sinadarai na hormone, kuma tana da kyau ga mata da ba sa son ko ba za su iya amfani da hanyoyin da ke ɗauke da hormones ba, ko kuma na’urorin mahaifa (IUDs) ko kwandom (condoms).",
        audioWidget: "diaphragmAudio", 
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da diaphragm."
      },
      "Kwandom na mata": {
        description: "Kwando na mata (female condom) ana saka shi cikin farji kafin jima'i. Yana kare mace daga ɗaukar ciki da kuma cututtukan da ake ɗauka ta jima'i (STIs)\n\nzuwa kashi 95% idan an yi amfani da shi yadda ya kamata, kuma ana iya saka shi har zuwa awanni 8 kafin jima'i.",
        audioWidget: "femaleCondomAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da kwandom na mata (female condom)."
      },
      "Kwandom na maza": {
        description: "Kwandom na maza (male condom) ana sanya shi a kan azzakari yayin jima'i. Yana da tasiri har zuwa kashi 98% idan an yi amfani da shi yadda ya kamata, kuma yana kariya daga cututtukan da ake ɗauka ta jima'i.\n\nAna samun su ko’ina kuma babu wani illa da suke haifarwa.",
        audioWidget: "maleCondomAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da kwandom na maza."
      },
      "Allurai": {
        description: "Allurar hana daukar ciki hanya ce ta maganin hormone mai ɗorewa wadda ake yi da allura. Tana bada kariya na tsawon watanni 3 (Sayana Press) ko watanni 3-4 (Depo-Provera).\n\nYana da tasiri fiye da kashi 99% kuma baya buƙatar kulawa kullum.",
        audioWidget: "injectablesAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da allurar hana daukar ciki (injectables)."
      },
      "Na'urar IUD": {
        description: "Na’urar Intrauterine (IUD) wata ƙaramar na’ura ce mai siffar T da ake sakawa cikin mahaifa. Tana iya hana daukar ciki na tsawon shekaru 5 zuwa 10 gwargwadon irin ta.\n\nYana da tasiri fiye da kashi 99% kuma ana iya cire shi a duk lokacin da kike son daukar ciki.",
        audioWidget: "iudAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da na'urar IUD."
      },
      "Na'urar IUS": {
        description: "Na’urar Intrauterine System (IUS) tana kama da IUD amma ita tana sakin hormone kadan. Tana iya hana daukar ciki na tsawon shekaru 3 zuwa 5.\n\nYana da tasiri fiye da kashi 99% kuma yana iya rage yawan jinin haila.",
        audioWidget: "hormonalIUSAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da na'urar IUS."
      },
      "Imflants": {
        description: "Imflant wasu ƙananan sanduna ne masu laushi da ake sakawa ƙarƙashin fatar hannu. Suna sakin sinadarin hormone (yawanci progestin) don hana daukar ciki. \n\nWannan hanya ce ta hana daukar ciki na dogon lokaci, ana kiranta 'long-acting reversible contraception' (LARC). Tana iya hana daukar ciki har na tsawon shekaru 3 zuwa 5, amma ana iya cireta duk lokacin da ake so. \n\nYana aiki ta hanyar hana kwai fita daga mahaifa da kuma kaurin ruwan farji domin ya zama mai wuya ga maniyyi yahadu da kwai.",
        audioWidget: "implantsAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da imflants."
      },
      "Cire mahaifa na mata": {
        description: "Toshe bututun mahaifa (female sterilization) hanya ce ta dindindin da ake yanke ko toshe bututun da ke kai kwai daga mahaifa.\n\nYana da tasiri fiye da kashi 99%, amma hanya ce ta dindindin wadda ba za a iya juyawa ba. Ana bukatar tiyata don yin ta.",
        audioWidget: "sterilizationAudio",
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da Toshe bututun mahaifa (female sterilization)."
      },
      "Cire marainai na maza": {
        description: "Toshe hanyar maniyyi ko cire marainai na maza (male sterilization ko vasectomy) hanya ce ta dindindin da ake yanke ko toshe bututun da ke ɗaukar maniyyi daga marainai.\n\nYana da tasiri fiye da kashi 99%, amma hanya ce ta dindindin wadda ba za a iya juyawa ba. Hanyar tana da sauƙi fiye da ta mata (female sterilization).",
        audioWidget: "vasectomyAudio", 
        audioPrompt: "Danna nan don sauraron ƙarin bayani game da cire marainai na maza"
      }
    };

    return methodData[method] || {
      description: "Don Allah ka tuntubi ma’aikacin lafiya don samun cikakken bayani game da wannan hanyar hana haihuwa."
    } || null;
  };
}

export default PreventPregnancyActionProvider;
export type { PreventPregnancyProviderInterface };