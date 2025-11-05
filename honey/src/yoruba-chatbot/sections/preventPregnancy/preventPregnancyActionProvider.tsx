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
  api: ApiService

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
    const userMessage: ChatMessage = {
      message: "Báwo ni a ṣe lè dena oyun",
      type: "user",
      id: uuidv4(),
    };
    const responseMessage = this.createChatBotMessage(
      "Mo rí i! 👍\n\nO wà níbi tó tọ́, mo lè ràn ẹ lọ́wọ́ pẹ̀lú èyí",
      { delay: 500 }
    );

    const followUpMessage = this.createChatBotMessage(
      "Ìru ọ̀nà ìdena oyun wo ni o fẹ́ mọ̀ nípa rẹ̀?",
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
    await this.api.createConversation({
      message_text: userMessage.message,
      message_type:'user',
      chat_step:"contraceptionTypeOptions",
      message_sequence_number:1,
      widget_name:"contraceptionTypeOptions"
    })
  };

  // =============================================================================
  // CONTRACEPTION TYPE SELECTION
  // =============================================================================

  handleContraceptionTypeSelection = async(type: string): Promise<void> => {
    //Type safety conversion
    const contraceptionType = type as ContraceptionType;
    const userMessage: ChatMessage = {
      message: type,
      type: "user",
      id: uuidv4(),
    };

    

    // Using type-safe constants instead of magic strings
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
      question_asked:'Ìru ọ̀nà ìdena oyun wo ni o fẹ́ mọ̀ nípa rẹ̀?',
      user_response:contraceptionType,
      widget_used:'contraceptiontypeoptions',
      available_options:['Emergency', 'Prevent in future'],
      step_in_flow:'contraceptionTypeOptions',
    })
    
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
    const responseMessage = this.createChatBotMessage(
      "Láti dènà nini oyún lẹ́yìn ìbálòpọ̀ tí kò ní ìdáàbòbò, o lè lo òògùn adena oyún onípàjáwìrì.\n\nÒògùn onípàjáwìrì yìí máa n ṣiṣẹ́ dáadáa tí a bá lo o láàrín wákàtí mẹrinlelogun sí wákàtí mejìlélàádọ́rin lẹ́yìn ìbálòpọ̀ tí kò ní ìdáàbòbò. A gba yín láàmòràn kí ẹ má ṣe lo o ju ẹ́ẹ̀mẹ́ta lọ ninu osù kan.Ilana ìdáàbòbòbò míìrán (Kọndọmu) ni kí ẹ lo bí ẹ bá n pa ẹyin lọwọ.",
      { delay: 500 }
    );

    //use type-safe products list
    const availableProducts: EmergencyProduct[] = ["Postpill", "Postinor-2"];
    const productList = availableProducts.map((product, index) => `${index + 1}. ${product}`).join("\n");

    const productMessage = this.createChatBotMessage(
      ` Jẹ ki n sọ diẹ fun ọ ninu àwọn oogun pajawiri adèna oyún ti o munadoko ti o wa:\n${productList}`,
      { delay: 1000 }
    );

    const selectionMessage = this.createChatBotMessage(
      "Ewo nínú àwọn Òògùn yìí  ni o fẹ mọ nipa rẹ?",
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
   await this.api.createConversation({
      message_text: responseMessage.message,
      message_type:'bot',
      chat_step:"EmergencyPath",
      message_sequence_number:1,
      widget_name:"emergencyProductOptions"
    })
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
      "Postpill": "Òògùn tàà pé ni "postpill" yìí jẹ́ òògùn oní lílò lẹ́kan ṣoṣo latọ́wọ́ ilé-ìṣẹ́ DKT.Ó ní ìwọ̀n mílígírámù kan àti ààbò èròjà kan tí a n pé ní Levongestrel. Ó gbọdọ̀ jẹ́ lílò ní kíákíà láàrín wákàtí mẹ́rinlelogun, ṣùgbọ́n ó sí tún lè lòó láàrín ọjọ́ márùn (ọgọ́fà wákàtí) lẹ́yìn tí ìbálòpọ̀ láìní ìdáàbòbò bá wáyé.\n\nBí o bá ṣe tete lo òògùn yìí sí ni yóò ṣe tete ṣiṣẹ́ sí. Kò lè ṣiṣẹ́ tí ó bá ti loyún tẹlẹ, bẹ́ẹ̀ ni kò lè pà oyún tí ó ti dúró lára rárá.\n\nÓ lè rí òògùn yìí rà ní ilé ìtajà òògùn tó súnmọ́ ọ. Ó munadoko ní àádọ́rún [95%] nínú ọgọ́rùn-ún bí a bá mu un láàárín wákàtí méjìlélọ́gọ́rin [24] lẹ́yìn ìbálòpò tí a kò lo ìdena oyun.\n\nTi o ba ti ju bíi ọgọfa wakati(ọjọ márùn) lọ lẹhin ibalopọ tí kò ní ìdáàbòbò, oogun yìí ko ní ṣiṣẹ rárá, o dara ki o yara pé oníṣègùn eto ìlera rẹ láti gba amọran mìíràn.",
      
      "Postinor-2": "Òògùn Postinor jẹ́ èyí tí ó maa n dènà oyún tí a ó fẹ́ láì ṣeùwù láàrín wákàtí méjìlélààdọ́rin lẹ́yìn ìbálòpọ̀ tí kò ní ìdáàbòbò.\n\nIt works by preventing or delaying ovulation. The sooner you take it after unprotected sex, the more effective it is.\n\nIt should not be used as a regular contraceptive method.",
    };

    const productInfo = productInfoMap[emergencyProduct];
    if (!productInfo) {
      // Handle unknown product case
      const errorMessage = this.createChatBotMessage(
        "Mi ò ní ìmọ̀ nípa ọjà yẹn. Jọ̀wọ́, yan Postpill tàbí Postinor-2.",
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

    await this.api.createResponse({
    response_category: "EmergencyProduct",
    response_type: "user",
    question_asked: "Ìru ọ̀nà ìdena oyun wo ni o fẹ́ mọ̀ nípa rẹ̀?",
    user_response: emergencyProduct,
    widget_used: "emergencyProductOptions",
    available_options: ["Postpill", "Postinor-2"],
    step_in_flow: "emergencyProductSelection",
  });
      return;
    }

    

    const responseMessage = this.createChatBotMessage(productInfo, { delay: 500 });
    const messages = [userMessage, responseMessage];
  //smart image display
    if (widgets.hasImage && widgets.imageWidget) {
      const imageMessage = this.createChatBotMessage(
        `Èyí ni bí ${emergencyProduct} ṣe rí:`,
        { widget: widgets.imageWidget, delay: 1000 }
      );
      messages.push(imageMessage);
    }

    //smart audio display
    if (widgets.hasAudio && widgets.audioWidget) {
      const audioMessage = this.createChatBotMessage(
        `Tẹ̀ lórí láti gbọ́ ìtẹ̀síwájú kéékèèké nípa ${emergencyProduct} ní Pidgin, bí o bá fẹ́.`,
        { delay: widgets.hasImage? 1500 : 1000, widget: widgets.audioWidget }
      );
      messages.push(audioMessage);
    }

    const followUpMessage = this.createChatBotMessage(
      "Ṣé o fẹ́ mọ̀ nípa àwọn ọ̀nà ìdílé míì tí a fi ń dena oyun",
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

  private handlePreventFuturePath = (userMessage: ChatMessage): void => {
    const responseMessage = this.createChatBotMessage(
      "O dára\n\nInu mi dùn láti sàlàyé síi fún ọ lórí àwọn ìlànà ifètò sọmọ bibi tí o n ṣiṣẹ dáadáa tí kò sì léwu.",
      { delay: 500 }
    );

    const durationMessage = this.createChatBotMessage(
      "Ọdún mélòó ni o fẹ fi dúró láì loyún?",
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
  // Optimization (Alternative Approach)
  handlePreventionDurationSelection = (duration: string): void => {
    const userMessage: ChatMessage = {
      message: duration,
      type: "user",
      id: uuidv4(),
    };

    const durationKey = duration as PreventionDuration;
    
    // Now using the getMethodOptionsForDuration function!
    const availableMethods = getMethodOptionsForDuration(durationKey);

    // Configuration object for cleaner code maintenance
    const durationConfig: Record<PreventionDuration, { message: string; widget: string }> = {
      "Titi di ọdun kan": {
        message: `Àwọn ìlànà ìfètò sọ́mọ bíbí aláàkókò kúkúrú ni:\n\n ${this.formatMethodList(availableMethods)} \n\n1. Òògùn adena oyún olojoojumo\n2. Àwọn adena oyún tí ó jẹ́ oní kíkì bọ oju ara, ìyẹn dayaframu àti kọ́ndọ̀mù`,
        widget: "shortTermMethods"
      },
      "Odun kan si meji": {
        message: "Tí o bá fẹ́ dena oyun láàárín ọdún kan sí méjì, o lè lo èyíkéyìí nínú àwọn ọ̀nà ìdílé tí kò pẹ́ tọ́ (short-acting) tàbí abẹrẹ ìdílé (injectables).",
        widget: "mediumTermMethods"
      },
      "Mẹta si mẹrin ọdun": {
        message: `Fún ìdábò bo tó máa pé ọdún mẹ́ta sí mẹ́rin, o lè lo ọ̀nà àárín-ìgbà bíi abẹrẹ ìdílé, IUD, IUS tàbí implanti.${this.formatInlineMethodList(availableMethods)} `,
        widget: "longTermMethods"
      },
      "ọdun marun si mẹwa": {
        message: `For long-term protection (5 - 10 years), the most effective methods are IUD, IUS, and implants.${this.formatInlineMethodList(availableMethods)} `,
        widget: "extendedLongTermMethods"
      },
      "Titilai": {
        message: "Fún ìdena oyun títí láéláé, o lè ronú nípa ọ̀nà sterilization. Àwọn ọ̀nà wọ̀nyí jẹ́ títí láéláé, a kò sì lè yí wọn padà",
        widget: "permanentMethods"
      }
    };

    const config = durationConfig[durationKey];

    if (!config) {
      // Handle invalid duration
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
      return;
    }

    const responseMessage = this.createChatBotMessage(config.message, { delay: 500 });

    const methodSelectionMessage = this.createChatBotMessage(
      `Click on any of the ${availableMethods.length} available methods to get more information:`,
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
  //     case "Titi di ọdun kan":
  //       responseMessage = this.createChatBotMessage(
  //         "“Awọn ọna igbero idile igba kukuru jẹ:\n\n1. Òògùn idena oyún olojoojumọ \n2. The barrier contraceptives (Aranmo )",
  //         { delay: 500 }
  //       );
  //       widget = "shortTermMethods";
  //       break;

  //     case "1 - 2 years":
  //       responseMessage = this.createChatBotMessage(
  //         "Ti o ba fẹ ṣe idiwọ oyun laarin ọdun kan si meji, o le lo eyikeyi awọn ọna ṣiṣe eto ẹbi kukuru tabi awọn abẹrẹ.",
  //         { delay: 500 }
  //       );
  //       widget = "mediumTermMethods";
  //       break;

  //     case "Mẹta si mẹrin ọdun":
  //       responseMessage = this.createChatBotMessage(
  //         "Fún ìdábò bo tó máa pé ọdún mẹ́ta sí mẹ́rin, o lè lo ọ̀nà àárín-ìgbà bíi abẹrẹ ìdílé, IUD, IUS tàbí implanti.",
  //         { delay: 500 }
  //       );
  //       widget = "longTermMethods";
  //       break;

  //     case "ọdun marun si mẹwa":
  //       responseMessage = this.createChatBotMessage(
  //         "Fún ìdábò bo pípẹ́ (ọdún márùn-ún sí mẹ́wàá), àwọn ọ̀nà tó munadoko jù lọ ni IUD, IUS àti implanti.",
  //         { delay: 500 }
  //       );
  //       widget = "extendedLongTermMethods";
  //       break;

  //     case "Titilai":
  //       responseMessage = this.createChatBotMessage(
  //         "Fún ìdena oyun títí láéláé, o lè ronú nípa ọ̀nà sterilization. Àwọn ọ̀nà wọ̀nyí jẹ́ títí láéláé, a kò sì lè yí wọn padà.",
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

  // =============================================================================
  // METHOD SELECTION HANDLING
  // =============================================================================

  handleMethodOptionsSelection = (method: string): void => {
    const contraceptiveMethod = method as ContraceptiveMethod;
    const userMessage: ChatMessage = {
      message: method,
      type: "user",
      id: uuidv4(),
    };

    const methodInfo = this.getMethodInformation(contraceptiveMethod);
    const widgets = this.getWidgetsByMethodType(method);

    if (!methodInfo) {
      // Handle unknown method
      const errorMessage = this.createChatBotMessage(
        "I don't have detailed information about that method. Please consult with a healthcare provider.",
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
        `Click to listen to a short introduction of ${method} in Pidgin, if you want to.`,
        { 
          delay: widgets.hasImage ? 1500 : 1000,
          widget: widgets.audioWidget
        }
      );
      messages.push(audioMessage);
    }

    const followUpMessage = this.createChatBotMessage(
      "Do you want to find out about other family planning methods?",
      { 
        delay: 2000,
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
