import { v4 as uuidv4 } from 'uuid';
import type {
  ChatMessage,
  ChatbotState,
  CreateChatBotMessage,
  SetStateFunc,
} from '../../types';
import { ApiService } from '../../../services/apiService';

/**
 * SexEnhancementActionProvider
 * Handles the "How to improve sex life" conversation flow
 * 
 * Flow:
 * 1. Initial introduction about lubricants and hard erection
 * 2. User chooses: Gels and Lubricants OR Hard Erection
 * 3. If Gels: Show lubricant info → Products (Fiesta/KY Jelly) → Details
 * 4. If Hard Erection: Show erectile dysfunction info → Penegra details
 * 5. Next actions: Chat with AI/Human, Learn other methods, Back to main menu
 */
export class SexEnhancementActionProvider {
  private createChatBotMessage: CreateChatBotMessage;
  private setState: SetStateFunc;
  private state: ChatbotState;
  private api: ApiService;
  private userSessionId: string;
  private sequenceNumber: number = 0;
  private handleGeneralQuestionCallback?: () => void;

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
    apiClient: ApiService,
    userSessionId?: string,
    handleGeneralQuestionCallback?: () => void,
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
    this.handleGeneralQuestionCallback = handleGeneralQuestionCallback;

    // Enhanced constructor with server-side persistence
    this.setState = (
      newState: ChatbotState | ((prev: ChatbotState) => ChatbotState),
    ) => {
      const updatedState =
        typeof newState === 'function' ? newState(this.state) : newState;

      // Primary: Save to server for cross-device sync
      this.saveStateToServer(updatedState).catch((error) => {
        console.warn(
          'Failed to save sex enhancement state to server, using localStorage fallback:',
          error,
        );
      });

      // Secondary: Always save to localStorage as backup
      localStorage.setItem('chat_state', JSON.stringify(updatedState));

      // Update component state
      setStateFunc(updatedState);
      this.state = updatedState;
    };
  }

  // Helper method to save state to server
  private async saveStateToServer(state: ChatbotState): Promise<void> {
    try {
      const sessionId = this.api['sessionId'] || this.userSessionId;
      if (!sessionId) {
        console.warn('No session ID available, skipping server save');
        return;
      }

      await this.api.saveChatState(state, sessionId);
    } catch (error) {
      console.error('Failed to save sex enhancement chat state to server:', error);
      throw error;
    }
  }

  // Helper method to create user messages with timestamps
  private createUserMessage(message: string): ChatMessage {
    return {
      message,
      type: 'user',
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
  }

  // Ensure chat session is initialized before API calls
  private async ensureChatSession(): Promise<void> {
    try {
      if (!this.api['sessionId']) {
        console.warn('No user session ID available for sex enhancement flow');
        return;
      }

      await this.api.initializeChatSession();
    } catch (error) {
      console.error('Failed to initialize sex enhancement session:', error);
    }
  }

  private getNextSequenceNumber(): number {
    return ++this.sequenceNumber;
  }

  private resetSequenceNumber(): void {
    this.sequenceNumber = 0;
  }

  /**
   * Initial handler when user selects "How to improve sex life"
   * Shows introduction about lubricants and hard erection with two options
   */
  handleSexEnhancementInitiation = async (): Promise<void> => {
    this.resetSequenceNumber();
    await this.ensureChatSession();

    // First message: Introduction
    const introMessage = this.createChatBotMessage(
      'Sex can be enjoyed more with lubricants and gels.\nHard erection can also be induced for more pleasured sex.',
      { delay: 500 }
    );

    // Second message: Options
    const optionsMessage = this.createChatBotMessage(
      'What do you want to learn more about?',
      {
        widget: 'sexEnhancementOptions',
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, introMessage, optionsMessage],
      currentStep: 'sexEnhancementChoice',
    }));

    // Save conversations to server
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: introMessage.message,
        chat_step: 'sexEnhancementIntro',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save intro message:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: optionsMessage.message,
        chat_step: 'sexEnhancementChoice',
        widget_name: 'sexEnhancementOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save options message:', err));
  };

  /**
   * Handles user selection between "Gels and Lubricants" and "Hard Erection"
   */
  handleSexEnhancementChoice = async (choice: string): Promise<void> => {
    await this.ensureChatSession();

    const userMessage = this.createUserMessage(choice);

    // Save user selection
    await this.api
      .createConversation({
        message_text: choice,
        message_type: 'user',
        chat_step: 'sexEnhancementChoice',
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: 'sexEnhancementOptions',
      })
      .catch((err) => console.error('Failed to save user choice:', err));

    if (choice === 'Gels and Lubricants') {
      await this.handleLubricantIntroduction(userMessage);
    } else if (choice === 'Hard Erection') {
      await this.handleHardErectionIntroduction(userMessage);
    }
  };

  /**
   * Shows lubricant introduction and product options
   */
  private handleLubricantIntroduction = async (userMessage: ChatMessage): Promise<void> => {
    // Lubricant introduction message
    const lubricantIntro = this.createChatBotMessage(
      'Lubricants, also called gels or lubes, are special fluids used during sex. They help reduce friction, discomfort, and dryness, making sex more pleasurable and preventing condoms from breaking. Lubricants come in water-based, silicone-based, or oil-based types. Water-based lubes are safe with all condoms, they don\'t change the vagina\'s pH, don\'t stain clothes, and wash off easily with water. Silicone and oil-based lubes should only be used with specific condom materials.\n\nClick to listen to a short introduction of Lubricant in Pidgin, if you want.',
      { delay: 500 }
    );

    // Audio message (placeholder)
    const audioMessage = this.createChatBotMessage(
      '<Media omitted>',
      { delay: 1000 }
    );

    // Product options message
    const productOptions = this.createChatBotMessage(
      'Here are some of the effective and available lubricants and gels.\n1. Fiesta Intim Gel\n2. KY Jelly \n\nClick on any of them to get their full details.',
      {
        widget: 'lubricantOptions',
        delay: 1500,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, lubricantIntro, audioMessage, productOptions],
      currentStep: 'lubricantSelection',
    }));

    // Save to server
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: lubricantIntro.message,
        chat_step: 'lubricantIntro',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save lubricant intro:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: audioMessage.message,
        chat_step: 'lubricantAudio',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save audio message:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: productOptions.message,
        chat_step: 'lubricantSelection',
        widget_name: 'lubricantOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1500,
      })
      .catch((err) => console.error('Failed to save product options:', err));
  };

  /**
   * Shows hard erection information (Penegra)
   */
  private handleHardErectionIntroduction = async (userMessage: ChatMessage): Promise<void> => {
    // Erectile dysfunction intro
    const edIntro = this.createChatBotMessage(
      'Erectile dysfunction is when a man is having difficulty getting a firm erection or when a man lose an erection before or during sexual activity. There are medicines that are used for treatment of erectile dysfuction and helps induce erection.\nLet me tell you one of the common and most effective product for inducing hard erection called Penegra.',
      { delay: 500 }
    );

    // Penegra details
    const penegrаDetails = this.createChatBotMessage(
      'Penegra is a product like Viagra that used to treat erectile dysfunction. Erectile Dysfunction refers to the consistent/inability of a man to obtain an erection sufficient for satisfactory sex.\n\nPenegra helps to induce a hard erection which can last for an extended duration thereby enhancing confidence, well-being, and satisfaction. Penegra only induces a hard erection when the penis is stimulated.',
      { delay: 1000 }
    );

    // Audio intro
    const audioIntro = this.createChatBotMessage(
      'You can click on the audio below to listen to a short introduction of Penegra in Pidgin, if you want to.',
      { delay: 1500 }
    );

    // Audio placeholder
    const audioMessage = this.createChatBotMessage(
      '<Media omitted>',
      { delay: 2000 }
    );

    // Purchase info
    const purchaseInfo = this.createChatBotMessage(
      'You can buy it at any pharmacy or health store around you.',
      { delay: 2500 }
    );

    // Next actions
    const nextActions = this.createChatBotMessage(
      'What would you like to do next?\nCall 7790 for free to speak to a counsellor.',
      {
        widget: 'sexEnhancementNextActions',
        delay: 3000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        edIntro,
        penegrаDetails,
        audioIntro,
        audioMessage,
        purchaseInfo,
        nextActions,
      ],
      currentStep: 'sexEnhancementNextAction',
    }));

    // Save all messages to server
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: edIntro.message,
        chat_step: 'erectileDysfunctionIntro',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save ED intro:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: penegrаDetails.message,
        chat_step: 'penegrаDetails',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save Penegra details:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: audioIntro.message,
        chat_step: 'audioIntro',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1500,
      })
      .catch((err) => console.error('Failed to save audio intro:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: audioMessage.message,
        chat_step: 'audio',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 2000,
      })
      .catch((err) => console.error('Failed to save audio:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: purchaseInfo.message,
        chat_step: 'purchaseInfo',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 2500,
      })
      .catch((err) => console.error('Failed to save purchase info:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: nextActions.message,
        chat_step: 'sexEnhancementNextAction',
        widget_name: 'sexEnhancementNextActions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 3000,
      })
      .catch((err) => console.error('Failed to save next actions:', err));
  };

  /**
   * Handles lubricant product selection (Fiesta Intim Gel or KY Jelly)
   */
  handleLubricantSelection = async (product: string): Promise<void> => {
    await this.ensureChatSession();

    const userMessage = this.createUserMessage(product);

    // Save user selection
    await this.api
      .createConversation({
        message_text: product,
        message_type: 'user',
        chat_step: 'lubricantSelection',
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: 'lubricantOptions',
      })
      .catch((err) => console.error('Failed to save lubricant selection:', err));

    if (product === 'Fiesta Intim Gel') {
      await this.handleFiestaIntimGelDetails(userMessage);
    } else if (product === 'KY Jelly') {
      await this.handleKYJellyDetails(userMessage);
    }
  };

  /**
   * Shows Fiesta Intim Gel details
   */
  private handleFiestaIntimGelDetails = async (userMessage: ChatMessage): Promise<void> => {
    // Product details
    const details = this.createChatBotMessage(
      'Fiesta Gels are classy and smooth, with a wet sensation for heightened sexual pleasure.\n\nHow to Use\nPour a small amount of Fiesta Intim natural gel on your palm and apply directly on your erect penis. For extra pleasure, you can also apply on the woman\'s intimate area.',
      { delay: 500 }
    );

    // Image placeholder
    const imageMessage = this.createChatBotMessage(
      '<Media omitted>',
      { delay: 1000 }
    );

    // Video intro
    const videoIntro = this.createChatBotMessage(
      'You can click to watch a video on how to use this lubricant in Pidgin.',
      { delay: 1500 }
    );

    // Video link
    const videoLink = this.createChatBotMessage(
      'https://www.youtube.com/watch?v=VtrXlRVaP-c&list=PL0mGkrTWmp4sWe4izabrqUhEVSuQAb-Hd&index=7&pp=iAQB',
      { delay: 2000 }
    );

    // Purchase info
    const purchaseInfo = this.createChatBotMessage(
      'You can purchase it at your nearest pharmacy or health shop.',
      { delay: 2500 }
    );

    // Next actions
    const nextActions = this.createChatBotMessage(
      'What would you like to do next?\nCall 7790 for free to speak to a counsellor.',
      {
        widget: 'sexEnhancementNextActions',
        delay: 3000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        details,
        imageMessage,
        videoIntro,
        videoLink,
        purchaseInfo,
        nextActions,
      ],
      currentStep: 'sexEnhancementNextAction',
    }));

    // Save all messages
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: details.message,
        chat_step: 'fiestaDetails',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save details:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: imageMessage.message,
        chat_step: 'fiestaImage',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save image:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: videoIntro.message,
        chat_step: 'videoIntro',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1500,
      })
      .catch((err) => console.error('Failed to save video intro:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: videoLink.message,
        chat_step: 'videoLink',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 2000,
      })
      .catch((err) => console.error('Failed to save video link:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: purchaseInfo.message,
        chat_step: 'purchaseInfo',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 2500,
      })
      .catch((err) => console.error('Failed to save purchase info:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: nextActions.message,
        chat_step: 'sexEnhancementNextAction',
        widget_name: 'sexEnhancementNextActions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 3000,
      })
      .catch((err) => console.error('Failed to save next actions:', err));
  };

  /**
   * Shows KY Jelly details
   */
  private handleKYJellyDetails = async (userMessage: ChatMessage): Promise<void> => {
    // Product details
    const details = this.createChatBotMessage(
      'KY Jelly is a water-based, fragrance-free, non-greasy formula that quickly prepares you for sexual intimacy & eases the discomfort of personal dryness.',
      { delay: 500 }
    );

    // Image placeholder
    const imageMessage = this.createChatBotMessage(
      '<Media omitted>',
      { delay: 1000 }
    );

    // Purchase info
    const purchaseInfo = this.createChatBotMessage(
      'You can visit your nearest chemist/pharmacy to buy.',
      { delay: 1500 }
    );

    // Next actions
    const nextActions = this.createChatBotMessage(
      'What would you like to do next?\nCall 7790 for free to speak to a counsellor.',
      {
        widget: 'sexEnhancementNextActions',
        delay: 2000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        details,
        imageMessage,
        purchaseInfo,
        nextActions,
      ],
      currentStep: 'sexEnhancementNextAction',
    }));

    // Save all messages
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: details.message,
        chat_step: 'kyJellyDetails',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save details:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: imageMessage.message,
        chat_step: 'kyJellyImage',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save image:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: purchaseInfo.message,
        chat_step: 'purchaseInfo',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1500,
      })
      .catch((err) => console.error('Failed to save purchase info:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: nextActions.message,
        chat_step: 'sexEnhancementNextAction',
        widget_name: 'sexEnhancementNextActions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 2000,
      })
      .catch((err) => console.error('Failed to save next actions:', err));
  };

  /**
   * Handles next action selection
   * Options: Chat with AI /Human, Learn other methods, Back to main menu
   */
  handleSexEnhancementNextAction = async (action: string): Promise<void> => {
    await this.ensureChatSession();

    const userMessage = this.createUserMessage(action);

    // Save user selection
    await this.api
      .createConversation({
        message_text: action,
        message_type: 'user',
        chat_step: 'sexEnhancementNextAction',
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: 'sexEnhancementNextActions',
      })
      .catch((err) => console.error('Failed to save next action:', err));

    if (action === 'Learn other methods') {
      // Loop back to sex enhancement options
      const optionsMessage = this.createChatBotMessage(
        'What do you want to learn more about?',
        {
          widget: 'sexEnhancementOptions',
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, optionsMessage],
        currentStep: 'sexEnhancementChoice',
      }));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: optionsMessage.message,
          chat_step: 'sexEnhancementChoice',
          widget_name: 'sexEnhancementOptions',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save loop message:', err));
    } else if (action === 'Back to main menu') {
      // Return to main menu
      const mainMenuMessage = this.createChatBotMessage(
        'I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. \n\nIf you want to be connected to a human agent, just type the word "human" at any time.\n\nTo see all the family planning clinics available, type in «clinic».\n\nWhat do you want to know? FPM = Family Planning Method',
        {
          widget: 'fpmOptions',
          delay: 500,
        }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, mainMenuMessage],
        currentStep: 'fpm',
      }));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: mainMenuMessage.message,
          chat_step: 'fpm',
          widget_name: 'fpmOptions',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save main menu:', err));
    } else if (action === 'Chat with AI /Human') {
      // Delegate to main ActionProvider's general question handler
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));
      
      if (this.handleGeneralQuestionCallback) {
        this.handleGeneralQuestionCallback();
      }
    }
  };
}
