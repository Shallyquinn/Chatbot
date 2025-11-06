// src/chatbot/ActionProvider.tsx - Updated Interface Section
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ChatMessage,
  ChatStep,
  ChatbotState,
  AgentMessageData,
  QueueUpdateData,
  EscalationResult,
} from './types';

import FPMChangeProvider from './sections/changeFPM/FPMChangeProvider';
import GetPregnantActionProvider from './sections/getPregnant/getPregnantActionProvider';
import PreventPregnancyActionProvider from './sections/preventPregnancy/preventPregnancyActionProvider';
import { SexEnhancementActionProvider } from './sections/sexEnhancement/sexEnhancementActionProvider';
import { apiService, ApiService } from '@/services/api';

// ACTION PROVIDER INTERFACE - Complete interface matching all widgets

export interface ActionProviderInterface {
  // NAVIGATION HANDLERS
  handleKeywordNavigation: (keyword: string) => void;
  handleMedicalConditionsResponse(option: string): void;

  // GREETING FLOW HANDLERS
  handleInitialWelcome: () => void;
  handleInitialDemographics: () => void;
  handleSetupComplete: () => void;

  // DEMOGRAPHIC HANDLERS
  handleLanguageSelection: (language: string) => void;
  handleGenderSelection: (gender: string) => void;
  handleStateSelection: (state: string) => void;
  handleLGASelection: (lga: string) => void;
  handleLocationInput: (location: string) => void;
  handleLocationConfirmation: (location: string) => void;
  handleAgeSelection: (age: string) => void;
  handleMaritalStatusSelection: (status: string) => void;

  // DEMOGRAPHICS UPDATE HANDLER
  handleDemographicsUpdate: () => void;

  // FAMILY PLANNING CORE HANDLERS

  handlePlanningMethodSelection: (method: string) => void;

  // PREVENT PREGNANCY HANDLERS - Delegated to PreventPregnancyActionProvider

  handleContraceptionTypeSelection: (type: string) => void;
  handleEmergencyProductSelection: (product: string) => void;
  handlePreventionDurationSelection: (duration: string) => void;
  handleMethodOptionsSelection: (method: string) => void;
  handleProductDetailSelection: (choice: string) => void; // Task 5: Product detail choice
  handleLearnOtherMethods: (answer: string) => void; // Task 5: Continue learning flow

  // SEX LIFE IMPROVEMENT HANDLERS

  handleSexLifeImprovement: () => void;
  handleSexEnhancementOptions: (option: string) => void;
  handleLubricantOptions: (lubricant: string) => void;
  handleNextAction: (action: string) => void;
  handleErectileDysfunctionOptions: (option: string) => void;
  handleSexEnhancementNextAction: (option: string) => void;

  // GENERAL QUESTION HANDLERS

  handleGeneralQuestion: () => void;
  handleAgentTypeSelection: (type: string) => void;
  handleMoreHelp: (answer: string) => void;
  handleMoreHelpOptions: (option: string) => void;
  handleUserQuestion: (question: string) => void;

  // Phase 3: CONFUSION DETECTION & HELP
  showHelpMessage: (message: string) => void;

  // Phase 3: ENHANCED NAVIGATION
  handleFlowEndOption: (option: string) => void;

  // Phase 3: COMPARE METHODS
  handleAddToComparison: (method: string) => void;
  handleCompareNow: () => void;
  handleClearComparison: () => void;

  // Phase 3: SESSION CONTINUATION
  handleResumeSession: (resume: boolean) => void;

  // FPM CHANGE/STOP HANDLERS - Delegated to FPMChangeProvider

  handleFPMChangeSelection: (option: string) => void;
  handleFPMConcernSelection: (option: string) => void;
  handleCurrentFPMSelection: (method: string) => void;
  handleFPMConcernTypeSelection: (concernType: string) => void;
  handleFPMSideEffectSelection: (sideEffect: string) => void;
  handleFPMNextAction: (action: string) => void;
  handleFinalFeedback: (feedback: string) => void;

  // FPM Change/Stop - Switch Flow
  handleSwitchCurrentFPMSelection: (method: string) => void;
  handleSatisfactionAssessment: (satisfaction: string) => void;
  handleSwitchReason: (reason: string) => void;
  handleMethodRecommendationInquiry: (response: string) => void;
  handleKidsInFuture: (response: string) => void;
  handleTimingSelection: (timing: string) => void;
  handleImportantFactors: (factor: string) => void;
  handleMenstrualFlowPreference: (preference: string) => void;

  // FPM Change/Stop - Stop Flow
  handleStopFPMSelection: (method: string) => void;
  handleStopReason: (reason: string) => void;

  // GET PREGNANT HANDLERS - Delegated to GetPregnantActionProvider

  handleGetPregnantInitiation: () => void;
  handleGetPregnantFPMSelection: (selection: string) => void;
  handleGetPregnantTryingDuration: (duration: string) => void;
  handleGetPregnantIUDRemoval: (status: string) => void;
  handleGetPregnantImplantRemoval: (status: string) => void;
  handleGetPregnantInjectionStop: (status: string) => void;
  handleGetPregnantPillsStop: (status: string) => void;
  handleGetPregnantNextAction: (action: string) => void;
  handleGetPregnantUserQuestion: (question: string) => void;

  // DELEGATE PROVIDERS - Exposed for config access
  sexEnhancementActionProvider: SexEnhancementActionProvider;
}

// HELPER TYPES
type CreateChatBotMessage = (
  message: string,
  options?: {
    delay?: number;
    widget?: string;
    loading?: boolean;
    payload?: unknown;
    terminateLoading?: boolean;
    withAvatar?: boolean;
    tag?: string;
  },
) => ChatMessage;

type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

// ACTION PROVIDER CLASS IMPLEMENTATION

class ActionProvider implements ActionProviderInterface {
  // Static flag to prevent multiple simultaneous initializations across all instances
  private static globalChatSessionInitialized: boolean = false;
  private static initializationPromise: Promise<void> | null = null;
  private static constructionCount: number = 0; // Track total constructions for debugging

  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;

  // Initialize providers
  private fpmChangeProvider: FPMChangeProvider;
  private getPregnantActionProvider: GetPregnantActionProvider;
  private preventPregnancyActionProvider: PreventPregnancyActionProvider;
  public sexEnhancementActionProvider: SexEnhancementActionProvider;

  // Store user's location data
  private userState: string = '';
  public api: ApiService;
  private chatSessionInitialized: boolean = false;

  private userSessionId: string;
  private messageSequenceNumber: number = 0;

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
  ) {
    // Increment construction counter for debugging
    ActionProvider.constructionCount++;
    console.log(`🏗️ ActionProvider constructed (#${ActionProvider.constructionCount})`);
    
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
    this.api = apiService;
    this.userSessionId = localStorage.getItem('userSessionId') || uuidv4();

    // Initialize keyword navigation handlers
    this.handleKeywordNavigation = this.handleKeywordNavigation.bind(this);
    this.handleInitialWelcome = this.handleInitialWelcome.bind(this);
    this.handleInitialDemographics = this.handleInitialDemographics.bind(this);
    this.handleSetupComplete = this.handleSetupComplete.bind(this);
    this.addMessageToState = this.addMessageToState.bind(this);

    // Initialize the FPMChangeProvider with the same parameters
    this.fpmChangeProvider = new FPMChangeProvider(
      createChatBotMessage,
      setStateFunc,
      state,
      this.api,
      this.userSessionId
    );

    this.getPregnantActionProvider = new GetPregnantActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state,
      this.api,
      this.userSessionId
    );

    this.preventPregnancyActionProvider = new PreventPregnancyActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state,
      this.api,
      this.userSessionId
    );

    this.sexEnhancementActionProvider = new SexEnhancementActionProvider(
      this.createChatBotMessage,
      setStateFunc,
      state,
      this.api,
      this.userSessionId,
      this.handleGeneralQuestion.bind(this)
    );

    // Set up server-based state persistence with localStorage fallback
    const originalSetState = this.setState;
    this.setState = (updater) => {
      originalSetState((prev) => {
        const newState =
          typeof updater === 'function' ? updater(prev) : updater;

        // Primary: Save to server
        this.saveStateToServer(newState).catch((error) => {
          console.warn(
            'Failed to save state to server, using localStorage fallback:',
            error,
          );
        });

        // Secondary: Always save to localStorage as backup
        localStorage.setItem('chat_state', JSON.stringify(newState));

        return newState;
      });
    };

    // DON'T load state in constructor - it causes infinite re-renders
    // State is already loaded by config.tsx from localStorage
    // Server sync will happen on first user interaction via ensureChatSession
  }

  // Session management for proper database storage

  // Ensure chat session is initialized before API calls
  public async ensureChatSession() {
    // Check global flag first to prevent multiple simultaneous calls
    if (ActionProvider.globalChatSessionInitialized) {
      return;
    }

    // If another instance is already initializing, wait for it
    if (ActionProvider.initializationPromise) {
      await ActionProvider.initializationPromise;
      return;
    }

    // This instance will handle initialization
    if (!this.chatSessionInitialized) {
      try {
        // Create a shared promise that other instances can wait on
        ActionProvider.initializationPromise = this.api.initializeChatSession();
        await ActionProvider.initializationPromise;
        
        // Mark as initialized globally
        this.chatSessionInitialized = true;
        ActionProvider.globalChatSessionInitialized = true;
        
        console.log('✅ Chat session initialization complete');
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
      } finally {
        // Clear the promise so future calls can retry if needed
        ActionProvider.initializationPromise = null;
      }
    }
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
      console.error('ActionProvider: Failed to save state to server:', error);
      // Don't throw - state is already saved to localStorage
    }
  }

  // Load chat state from server on initialization for cross-device sync
  private async loadStateFromServer(): Promise<void> {
    try {
      await this.ensureChatSession();
      
      const response = await this.api.getUserSession(this.userSessionId);
      
      if (response && response.chat_state) {
        const serverState = JSON.parse(response.chat_state);
        
        // Compare with localStorage to use most recent
        const localState = localStorage.getItem('chat_state');
        if (localState) {
          const localStateObj = JSON.parse(localState);
          const localTimestamp = new Date(localStateObj.lastUpdated || 0).getTime();
          const serverTimestamp = new Date(response.last_activity || 0).getTime();
          
          // Use server state if it's more recent
          if (serverTimestamp > localTimestamp) {
            this.setState(serverState);
            localStorage.setItem('chat_state', JSON.stringify(serverState));
            console.log('✅ Loaded more recent state from server');
          } else {
            console.log('✅ Local state is more recent, keeping it');
          }
        } else {
          // No local state, use server state
          this.setState(serverState);
          localStorage.setItem('chat_state', JSON.stringify(serverState));
          console.log('✅ Loaded state from server');
        }
      } else {
        console.log('ℹ️ No saved state found on server');
      }
    } catch (error) {
      console.error('ActionProvider: Failed to load state from server:', error);
      // Fall back to localStorage
      const localState = localStorage.getItem('chat_state');
      if (localState) {
        try {
          const state = JSON.parse(localState);
          this.setState(state);
          console.log('✅ Loaded state from localStorage fallback');
        } catch (parseError) {
          console.error('Failed to parse localStorage state:', parseError);
        }
      }
    }
  }

  // Get next message sequence number for tracking
  public getNextSequenceNumber(): number {
    return ++this.messageSequenceNumber;
  }

  // Check if user is returning based on localStorage state
  private checkForReturningUser = async (): Promise<boolean> => {
    const savedState = localStorage.getItem('chat_state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // If user has completed demographics, show returning user flow
        if (state.currentStep === 'fpm' || state.greetingStep === 'complete') {
          const welcomeBackMsg = this.createChatBotMessage(
            `Welcome back! 👋\n\nI'm here to help you with your family planning questions.\n\nWhat would you like me to help you with today?`,
            {
              delay: 1000,
              widget: 'fpmOptions',
            },
          );
          this.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, welcomeBackMsg],
            currentStep: 'fpm',
            greetingStep: 'complete',
          }));
          return true; // User is returning
        }
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
    return false; // New user
  };

  // GREETING FLOW HANDLERS
  handleInitialWelcome = async (): Promise<void> => {
    if (typeof this.createChatBotMessage !== 'function') {
      console.error('createChatBotMessage is not available');
      return;
    }

    const messages = [
      this.createChatBotMessage(
        'Hey! My name is Honey. I am a family planning and pregnancy prevention chatbot. I am here to help with information on family planning knowledge and sexual health.',
      ),
      this.createChatBotMessage(
        'Before we continue, I would like to ask you a few questions to assist you better.',
      ),
      this.createChatBotMessage(
        'I can answer your family planning questions, refer you to a medical professional to talk to, and also refer you to a family planning clinic.',
      ),
      this.createChatBotMessage(
        'Any communication happening in this chat is strictly confidential, so you can feel safe sharing personal information.',
      ),
    ];

    if (typeof this.addMessageToState === 'function') {
      messages.forEach((msg) => this.addMessageToState(msg));
    }

    if (typeof this.setDemographicsStep === 'function') {
      this.setDemographicsStep('gender');
    }

    const genderQuestion = this.createChatBotMessage('What is your gender?', {
      widget: 'genderOptions',
      payload: {
        options: ['Male', 'Female', 'Prefer not to say'],
      },
    });
    this.addMessageToState(genderQuestion);
  };

  handleInitialDemographics = async (): Promise<void> => {
    const currentStep = this.state.currentStep;
    switch (currentStep) {
      case 'gender': {
        this.setDemographicsStep('location');
        const locationQuestion = this.createChatBotMessage(
          'What Local Government Area (LGA) are you chatting from?',
          {
            widget: 'lgaInput',
          },
        );
        this.addMessageToState(locationQuestion);
        break;
      }

      case 'location': {
        this.setDemographicsStep('location_confirmation');
        const confirmationMsg = this.createChatBotMessage(
          'Please confirm your local government area.',
          {
            widget: 'lgaConfirmation',
          },
        );
        this.addMessageToState(confirmationMsg);
        break;
      }

      case 'location_retry': {
        this.setDemographicsStep('location');
        const retryMsg = this.createChatBotMessage(
          "Okay, I'm sorry, let's try again",
        );
        this.addMessageToState(retryMsg);
        break;
      }

      case 'age': {
        this.setDemographicsStep('marital_status');
        const ageQuestion = this.createChatBotMessage('How old are you', {
          widget: 'ageOptions',
          payload: {
            options: ['< 25', '25-34', '35-44', '45-54', '55 and older'],
          },
        });
        this.addMessageToState(ageQuestion);
        break;
      }

      case 'marital_status':
        {
          const maritalQuestion = this.createChatBotMessage(
            'What is your current marital status',
            {
              widget: 'maritalOptions',
              payload: {
                options: [
                  'Single',
                  'In a relationship',
                  'Married',
                  'Divorced',
                  'Widowed',
                  'Prefer not to say',
                ],
              },
            },
          );
          this.addMessageToState(maritalQuestion);
        }
        break;
    }
  };

  handleSetupComplete = async (): Promise<void> => {
    // Save user data
    try {
      await this.api.createOrUpdateUser({
        user_session_id: this.userSessionId,
        selected_gender: this.state.selectedGender,
        selected_lga: this.state.selectedLGA,
        selected_age_group: this.state.selectedAge,
        selected_marital_status: this.state.selectedMaritalStatus,
        current_step: 'main_navigation',
      });
    } catch (error) {
      console.error('Failed to save user data:', error);
    }

    const messages = [
      this.createChatBotMessage(
        'Thank you for sharing! Now I can assist you better.',
      ),
      this.createChatBotMessage(
        'I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. What do you want to know?',
        {
          widget: 'mainNavigationOptions',
          payload: {
            options: [
              'How to get pregnant',
              'How to prevent pregnancy',
              'Change/Stop current FPM',
              'How to improve sex life',
            ],
          },
        },
      ),
    ];

    messages.forEach((msg) => this.addMessageToState(msg));
    this.setDemographicsStep('main_navigation');
  };

  setDemographicsStep = (step: ChatStep): void => {
    this.setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  // NAVIGATION HANDLER IMPLEMENTATIONS

  handleKeywordNavigation = async (keyword: string): Promise<void> => {
    const lowercaseKeyword = keyword.toLowerCase().trim();

    switch (lowercaseKeyword) {
      case 'menu': {
        // Show main menu options - PRESERVE CONVERSATION BUT UPDATE STEP
        const menuMessage = this.createChatBotMessage(
          'Here are the main options available:\n\n' +
            '1. Get information about family planning methods\n' +
            '2. Find a clinic near you\n' +
            '3. Talk to a medical professional\n' +
            '4. Change or stop your current family planning method\n' +
            '5. Get help with getting pregnant\n' +
            '6. Improve your sex life\n' +
            '7. Ask general questions',
          {
            widget: 'planningMethodOptions',
          },
        );
        
        // Update state with both message AND currentStep to route correctly
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, menuMessage],
          currentStep: 'fpm', // Set to main menu step so selections work properly
        }));
        
        // Save to database
        this.api.createConversation({
          message_text: menuMessage.message,
          message_type: 'bot',
          chat_step: 'menu_navigation',
          message_sequence_number: this.getNextSequenceNumber(),
          widget_name: 'planningMethodOptions',
          message_delay_ms: 0
        }).catch(err => console.error('Failed to save menu navigation:', err));
        
        break;
      }

      case 'clinic': {
        // Use existing state info to show nearby clinics
        if (this.state.selectedState && this.state.selectedLGA) {
          const clinicMessage = this.createChatBotMessage(
            `I'll help you find clinics in ${this.state.selectedLGA}, ${this.state.selectedState}.`,
            { delay: 500 },
          );
          this.addMessageToState(clinicMessage);
          // TODO: Implement clinic search using API
          // this.api.findNearestClinics(this.state.selectedState, this.state.selectedLGA);
        } else {
          this.handleStateSelection(''); // Start location selection flow
        }
        break;
      }

      case 'honey': {
        const aiMessage = this.createChatBotMessage(
          "I'm Honey, your AI chatbot assistant. How can I help you today? You can:\n" +
            '1. Ask me questions about family planning\n' +
            '2. Get information about our services\n' +
            "3. Connect with a human agent by typing 'human'",
          { delay: 500 },
        );
        this.addMessageToState(aiMessage);
        break;
      }

      case 'human': {
        const humanMessage = this.createChatBotMessage(
          "I'll connect you with a medical professional right away. Please wait a moment while I transfer you.",
          { delay: 500 },
        );
        this.addMessageToState(humanMessage);
        this.handleAgentTypeSelection('human');
        break;
      }

      case 'language': {
        const languageMessage = this.createChatBotMessage(
          'Please select your preferred language:',
          {
            widget: 'languageOptions',
            delay: 500,
          },
        );
        this.addMessageToState(languageMessage);
        break;
      }

      case 'demographics': {
        this.handleDemographicsUpdate();
        break;
      }

      default: {
        const unknownMessage = this.createChatBotMessage(
          "I didn't recognize that keyword. Here are the available keywords:\n" +
            '- Menu: View main menu options\n' +
            '- Clinic: Find clinics near you\n' +
            '- Honey: Chat with AI assistant\n' +
            '- Human: Talk to a medical professional\n' +
            '- Language: Change chat language\n' +
            '- Demographics: Update your personal information',
          { delay: 500 },
        );
        this.addMessageToState(unknownMessage);
        break;
      }
    }
  };

  private addMessageToState = (message: ChatMessage): void => {
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  // Helper method to create user messages with automatic timestamp
  private createUserMessage = (message: string, tag?: string): ChatMessage => {
    return {
      message,
      type: 'user',
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      tag,
    };
  };

  // Phase 3: Helper method to show contextual help messages when confusion is detected
  showHelpMessage = (message: string): void => {
    const helpMessage = this.createChatBotMessage(message, { delay: 300 });
    this.addMessageToState(helpMessage);
    
    // Track help message to database
    this.api.createConversation({
      message_text: message,
      message_type: 'bot',
      chat_step: 'help_message',
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 300
    }).catch(err => console.error('Failed to save help message:', err));
  };

  // BASIC SETUP HANDLER IMPLEMENTATIONS

  handleLanguageSelection = async (language: string): Promise<void> => {
    const userMessage = this.createUserMessage(language, 'language_selection');

    // Initialize chat session first for proper data tracking
    await this.ensureChatSession();

    // Save to API but don't block on failure
    this.api
      .createOrUpdateUser({ selected_language: language })
      .catch((error) => {
        console.warn(
          'Could not save to server (working offline):',
          error.message,
        );
      });

    // Log this interaction to conversations table
    this.api
      .createConversation({
        message_text: language,
        message_type: 'user',
        chat_step: 'language',
        widget_name: 'languageOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    // Redirect to language-specific chatbot if Yoruba or Hausa is selected
    if (language === 'Yoruba') {
      const redirectMessage = this.createChatBotMessage(
        'E kaabo! (Welcome!) Redirecting you to Yoruba chatbot...',
        { delay: 500 },
      );
      this.addMessageToState(redirectMessage);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/chat/yoruba';
      }, 1500);
      return;
    }

    if (language === 'Hausa') {
      const redirectMessage = this.createChatBotMessage(
        'Sannu! (Welcome!) Redirecting you to Hausa chatbot...',
        { delay: 500 },
      );
      this.addMessageToState(redirectMessage);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/chat/hausa';
      }, 1500);
      return;
    }

    // For English, continue with normal onboarding
    // Check if this is a returning user first
    const isReturningUser = await this.checkForReturningUser();

    // Only proceed with onboarding if this is a new user
    if (!isReturningUser) {
      const greeting = this.createChatBotMessage(
      'Ẹ pẹlẹ ní bẹyẹn! Oruko mi ni Honey. Mo je Ẹrọ ibaraẹnisọrọ aládàáni fun ifetosi omobibi ati idena Oyun. Mo le fun o ni alate Lori ifetosi omobibi ati Ìlera Ibalopo.\n\n Mo lè dahun àwọn ìbéèrè rẹ lórí ìfètòsọ́mọbíbí, mo lè tọ́kà rẹ sí akọṣẹmọṣẹ oníṣègùn tí ó lè bá sọ̀rọ̀ bẹ̀ẹ̀, mo lè tọ́kà ilé ìwòsàn ìfètòsọ́mọbíbí fún ọ\n\n If you want to be connected to a medical professional agent, just type the word "human" at any time. \n\n Gbogbo ohun tí a bá sọ nínú ibaraẹnisọrọ yìí jẹ́ aṣiri patápátá, nítorína, fókan bàlẹ̀ láti bá mi sọ aṣiri rẹ.',
        { delay: 500 },
      );
      const followup1 = this.createChatBotMessage(
        'For easy navigation of my features, use the following keywords to access different features.\nMenu: To navigate to the main chatbot paths/menu.\nClinic: Get the address of the clinic in your town\nHoney: Connect with the AI chatbot or a human agent to ask your questions.\nHuman: Request to be connected to a medical professional agent\nLanguage: Choose the language to chat with the bot (English, Hausa, or Yoruba).',
        { delay: 1000 },
      );
      const followUp2 = this.createChatBotMessage(
        'Before we continue, I would like to ask you a few questions to assist you better.',
        { delay: 1000 },
      );
    const genderQuestion = this.createChatBotMessage(
      'Obìnrin ni yín tàbí ọkùnrin?',
      {
        widget: 'genderOptions',
        delay: 1500,
      });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          greeting,
          followup1,
          followUp2,
          genderQuestion,
        ],
        currentStep: 'gender',
        selectedLanguage: language,
      }));
    } else {
      // Just add the user message for returning users
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        selectedLanguage: language,
      }));
    }
  };

  handleGenderSelection = async (gender: string): Promise<void> => {
    const userMessage = this.createUserMessage(gender, 'gender_selection');

    await this.ensureChatSession();

    // Save to API but don't block on failure
    this.api.createOrUpdateUser({ selected_gender: gender }).catch((error) => {
      console.warn(
        'Could not save to server (working offline):',
        error.message,
      );
    });

    // Log conversation
    this.api
      .createConversation({
        message_text: gender,
        message_type: 'user',
        chat_step: 'gender',
        widget_name: 'genderOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });
    const stateQuestion = this.createChatBotMessage(
      'What state are you chatting from? Please search below and select your state.',
      {
        widget: 'stateOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, stateQuestion],
      currentStep: 'stateSelection',
      selectedGender: gender,
    }));
  };

  handleStateSelection = async (state: string): Promise<void> => {
    this.userState = state;
    const userMessage = this.createUserMessage(state, 'state_selection');
    await this.ensureChatSession();

    // Save to API but don't block on failure
    this.api.createOrUpdateUser({ selected_state: state }).catch((error) => {
      console.warn(
        'Could not save to server (working offline):',
        error.message,
      );
    });

    // Log conversation
    this.api
      .createConversation({
        message_text: state,
        message_type: 'user',
        chat_step: 'stateSelection',
        widget_name: 'stateOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const lgaQuestion = this.createChatBotMessage(
      `Great! E te Ijọba ìbílẹ̀ ti ẹ n  ti n bá wa sọ̀rọ̀  ninu ${state} state?`,
      {
        widget: 'lgaOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, lgaQuestion],
      currentStep: 'lgaSelection',
      selectedState: state,
    }));
  };

  handleLGASelection = async (lga: string): Promise<void> => {
    const userMessage = this.createUserMessage(lga, 'lga_selection');
    await this.ensureChatSession();

    // Save to API but don't block on failure
    this.api.createOrUpdateUser({ selected_lga: lga }).catch((error) => {
      console.warn(
        'Could not save to server (working offline):',
        error.message,
      );
    });

    // Log conversation
    this.api
      .createConversation({
        message_text: lga,
        message_type: 'user',
        chat_step: 'lgaSelection',
        widget_name: 'lgaOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const confirmMessage = this.createChatBotMessage(
      `Perfect! You're chatting from ${lga}, ${this.userState}.`,
      { delay: 500 },
    );

    const ageQuestion = this.createChatBotMessage(' Kin ni ọjọ orí rẹ?', {
      widget: 'ageOptions',
      delay: 500,
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, confirmMessage, ageQuestion],
      currentStep: 'age',
      selectedLGA: lga,
    }));
  };

  handleLocationInput = async (location: string): Promise<void> => {
    const userMessage = this.createUserMessage(location, 'location_input');

    const confirmLocation = this.createChatBotMessage(
      `Jọwọ, jẹrisi Ijọba Ibilẹ rẹ ${location}`,
      {
        widget: 'locationConfirmation',
        delay: 500,
      },
    );
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, confirmLocation],
      currentStep: 'locationConfirm',
    }));
  };

  handleLocationConfirmation = (locationOption: string): void => {
    const userMessage = this.createUserMessage(locationOption);

    if (locationOption === "Yes, that's correct") {
      const ageQuestion = this.createChatBotMessage('Kin ni ọjọ orí rẹ?', {
        widget: 'ageOptions',
        delay: 500,
      });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, ageQuestion],
        currentStep: 'age',
      }));
    } else if (locationOption === 'Change Location') {
      const stateQuestion = this.createChatBotMessage(
        "Let's start over. What state are you chatting from?",
        {
          widget: 'stateOptions',
          delay: 500,
        },
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, stateQuestion],
        currentStep: 'stateSelection',
      }));
    }
  };

  handleAgeSelection = async (age: string): Promise<void> => {
    const userMessage = this.createUserMessage(age, 'age_selection');

    await this.ensureChatSession();

    // Save to API but don't block on failure
    this.api.createOrUpdateUser({ selected_age_group: age }).catch((error) => {
      console.warn(
        'Could not save to server (working offline):',
        error.message,
      );
    });

    // Log conversation
    this.api
      .createConversation({
        message_text: age,
        message_type: 'user',
        chat_step: 'age',
        widget_name: 'ageOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const maritalQuestion = this.createChatBotMessage(
      'Ṣe wúndíá tàbí àpọn ni ọ báyìí àbí o ti ṣègbéyàwó?',
      {
        widget: 'maritalStatusOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, maritalQuestion],
      currentStep: 'maritalStatus',
      selectedAge: age,
    }));
  };

  handleMaritalStatusSelection = async (status: string): Promise<void> => {
    const userMessage = this.createUserMessage(status, 'marital_status_selection');
    await this.ensureChatSession();

    // Save to API but don't block on failure
    this.api
      .createOrUpdateUser({ selected_marital_status: status })
      .catch((error) => {
        console.warn(
          'Could not save to server (working offline):',
          error.message,
        );
      });

    // Log conversation
    this.api
      .createConversation({
        message_text: status,
        message_type: 'user',
        chat_step: 'maritalStatus',
        widget_name: 'maritalStatusOptions',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const thankYou = this.createChatBotMessage('O seun fún ìdáhùn yìí!', {
      delay: 500,
    });
    const assistMsg = this.createChatBotMessage(
      'Now I can assist you better.',
      { delay: 500 },
    );
    const fpmQuestion = this.createChatBotMessage(
      'Mo le fún ọ ní àlàyé lórí àwọn ìlànà Ifeto ṣọmọ bibi (FPM) tàbí àwọn ìbéère mìíràn tí o jẹ mọ ibalopọ. Kí ni nnkan tí o fẹ́ mọ? \n\nFPM = Family Planning Method',
      { widget: 'fpmOptions', delay: 500 },
    );
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        thankYou,
        assistMsg,
        fpmQuestion,
      ],
      currentStep: 'fpm',
    }));
  };

  // FAMILY PLANNING CORE HANDLER IMPLEMENTATIONS

  handlePlanningMethodSelection = async (method: string): Promise<void> => {
    const userMessage = this.createUserMessage(method, 'planning_method_selection');

    // Save to API but don't block on failure
    this.api.createOrUpdateUser({ main_menu_option: method }).catch((error) => {
      console.warn(
        'Could not save to server (working offline):',
        error.message,
      );
    });

    // Ensure chat session is initialized before creating conversation
    await this.ensureChatSession();
    this.api
      .createConversation({
        message_text: method,
        message_type: 'user',
        chat_step: 'planningMethodSelection',
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: 'planningMethodSelection',
        widget_options: [
          'How to get pregnant',
          'How to prevent pregnancy',
          'How to improve sex life',
          'Change/stop current FPM',
          'Ask a general question',
        ],
        selected_option: method,
        message_delay_ms: 500,
      })
      .catch((error) => {
        console.warn(
          'Could not save conversation to server (working offline):',
          error.message,
        );
      });

    let responseMessage: ChatMessage;

    switch (method) {
      case 'How to get pregnant':
        this.handleGetPregnantInitiation();
        return;

      case 'How to prevent pregnancy':
        this.preventPregnancyActionProvider.handlePreventPregnancyInitiation();
        return;

      case 'How to improve sex life':
        this.sexEnhancementActionProvider.handleSexEnhancementInitiation();
        return;

      case 'Change/stop current FPM':
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage],
        }));
        this.handleFPMChangeSelection(method);
        return;

      case 'Ask a general question':
        this.handleGeneralQuestion();
        return;

      default:
        responseMessage = this.createChatBotMessage(
          "I'm sorry, I didn't understand that option. Please select from the available choices.",
          { delay: 500 },
        );
        break;
    }
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep:
        method === 'How to prevent pregnancy'
          ? 'contraception'
          : 'sexEnhancement',
    }));
  };

  handleContraceptionTypeSelection = (type: string): void => {
    this.preventPregnancyActionProvider.handleContraceptionTypeSelection(type);
  };

  handleEmergencyProductSelection = (product: string): void => {
    this.preventPregnancyActionProvider.handleEmergencyProductSelection(
      product,
    );
  };

  handlePreventionDurationSelection = (duration: string): void => {
    this.preventPregnancyActionProvider.handlePreventionDurationSelection(
      duration,
    );
  };

  handleMethodOptionsSelection = (method: string): void => {
    // Call method if available (type checking workaround)
    if ('handleMethodOptionsSelection' in this.preventPregnancyActionProvider) {
      (
        this
          .preventPregnancyActionProvider as PreventPregnancyActionProvider & {
          handleMethodOptionsSelection: (method: string) => void;
        }
      ).handleMethodOptionsSelection(method);
    }
  };

  // Task 5: Product detail selection handler
  handleProductDetailSelection = (choice: string): void => {
    if ('handleProductDetailSelection' in this.preventPregnancyActionProvider) {
      (
        this
          .preventPregnancyActionProvider as PreventPregnancyActionProvider & {
          handleProductDetailSelection: (choice: string) => void;
        }
      ).handleProductDetailSelection(choice);
    }
  };

  // Task 5: Learn other methods handler
  handleLearnOtherMethods = (answer: string): void => {
    if ('handleLearnOtherMethods' in this.preventPregnancyActionProvider) {
      (
        this
          .preventPregnancyActionProvider as PreventPregnancyActionProvider & {
          handleLearnOtherMethods: (answer: string) => void;
        }
      ).handleLearnOtherMethods(answer);
    }
  };

  // SEX LIFE IMPROVEMENT HANDLER IMPLEMENTATIONS

  handleSexLifeImprovement = async (): Promise<void> => {
    const responseMessage = this.createChatBotMessage(
      'I can help improve your sexual experience. What would you like to focus on?',
      {
        widget: 'sexEnhancementOptions',
        delay: 500,
      },
    );
    await this.ensureChatSession();
    await this.api.createConversation({
      message_type: 'user',
      message_text: responseMessage.message,
      chat_step: 'sexEnhancement',
      widget_name: 'sexEnhancementOptions',
      message_delay_ms: responseMessage.delay,
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, responseMessage],
      currentStep: 'sexEnhancement',
    }));
  };

  handleSexEnhancementOptions = async (option: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(option, 'sex_enhancement_option');

    // Track user option selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: "sexEnhancement",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "sexEnhancementOptions"
    }).catch(err => console.error('Failed to save sex enhancement option:', err));

    let responseMessage: ChatMessage;

    if (option === 'Gels and Lubricants') {
      responseMessage = this.createChatBotMessage(
        'Here are some recommended lubricant options:',
        {
          widget: 'lubricantOptions',
          delay: 500,
        },
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        currentStep: 'lubricantSelection',
      }));
      
      // Track lubricant path
      await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: "lubricantSelection",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "lubricantOptions",
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save lubricant message:', err));
    } else {
      responseMessage = this.createChatBotMessage(
        'For erectile dysfunction concerns, I recommend consulting with a healthcare provider for proper evaluation and treatment options.',
        { delay: 500 },
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        currentStep: 'default',
      }));
      
      // Track erectile dysfunction path
      await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: "erectileDysfunction",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save ED message:', err));
      
      await this.api.createResponse({
        response_category: 'SexEnhancement',
        response_type: 'user',
        question_asked: 'What would you like to focus on?',
        user_response: option,
        widget_used: 'sexEnhancementOptions',
        available_options: ['Gels and Lubricants', 'Erectile Dysfunction'],
        step_in_flow: 'sexEnhancementOptions',
      }).catch(err => console.error('Failed to save response data:', err));
    }
  };

  handleLubricantOptions = async (lubricant: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(lubricant, 'lubricant_selection');

    // Track user lubricant selection
    await this.api.createConversation({
      message_text: lubricant,
      message_type: 'user',
      chat_step: "lubricantSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "lubricantOptions"
    }).catch(err => console.error('Failed to save lubricant selection:', err));

    const lubricantInfo = this.getLubricantInfo(lubricant);
    const responseMessage = this.createChatBotMessage(lubricantInfo, {
      delay: 500,
    });

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'nextActionOptions',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        responseMessage,
        nextActionMessage,
      ],
      currentStep: 'nextAction',
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "lubricantInfo",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save lubricant info:', err));
    
    await this.api.createConversation({
      message_text: nextActionMessage.message,
      message_type: 'bot',
      chat_step: "nextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "nextActionOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save next action:', err));
    
    await this.api.createResponse({
      response_category: 'LubricantType',
      response_type: 'user',
      question_asked: 'What kind of lubricant do you want to know about?',
      user_response: lubricant,
      widget_used: 'lubricantOptions',
      available_options: ['Water-based', 'Oil-based', 'Silicone-based'],
      step_in_flow: 'lubricantOptions',
    }).catch(err => console.error('Failed to save response data:', err));
  };

  // Phase 3: Enhanced Navigation - Flow End Options Handler
  handleFlowEndOption = async (option: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(option, 'flow_end_option');

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // Track user selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: 'flowEndOption',
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: 'flowEndOptions'
    }).catch(err => console.error('Failed to save flow end option:', err));

    const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;

    switch (option) {
      case 'Learn about other methods': {
        // Return to duration selection to explore methods
        const learnMoreText = MessageFormatter.formatInfo(
          "Great! Let's explore other family planning methods. For how long do you want to prevent pregnancy?"
        );
        const learnMoreMsg = this.createChatBotMessage(learnMoreText, {
          delay: 500,
          widget: 'preventionDurationOptions'
        });

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, learnMoreMsg],
          currentStep: 'duration',
        }));

        // Track bot response
        await this.api.createConversation({
          message_text: learnMoreText,
          message_type: 'bot',
          chat_step: 'duration',
          message_sequence_number: this.getNextSequenceNumber(),
          widget_name: 'preventionDurationOptions',
          message_delay_ms: 500
        }).catch(err => console.error('Failed to save learn more message:', err));
        break;
      }

      case 'Find nearest clinic': {
        // Navigate to clinic finder
        const clinicText = MessageFormatter.formatInfo(
          "I'll help you find the nearest clinic. 📍"
        );
        const clinicMsg = this.createChatBotMessage(clinicText, { delay: 300 });

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, clinicMsg],
        }));

        // Track bot response
        await this.api.createConversation({
          message_text: clinicText,
          message_type: 'bot',
          chat_step: 'clinic_navigation',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 300
        }).catch(err => console.error('Failed to save clinic message:', err));

        // Navigate to clinic finder
        await this.handleKeywordNavigation('clinic');
        break;
      }

      case 'Back to main menu': {
        // Return to main FPM selection
        const menuText = MessageFormatter.formatSuccess(
          "Welcome back to the main menu! 🏠 What would you like help with today?"
        );
        const menuMessage = this.createChatBotMessage(menuText, {
          delay: 500,
          widget: 'planningMethodOptions'
        });

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, menuMessage],
          currentStep: 'fpm',
        }));

        // Track bot response
        await this.api.createConversation({
          message_text: menuText,
          message_type: 'bot',
          chat_step: 'fpm',
          message_sequence_number: this.getNextSequenceNumber(),
          widget_name: 'planningMethodOptions',
          message_delay_ms: 500
        }).catch(err => console.error('Failed to save menu message:', err));
        break;
      }

      case 'End conversation': {
        // Phase 3.5: Show conversation summary before farewell
        await this.showConversationSummary();
        
        // Show farewell
        const farewellText = MessageFormatter.formatSuccess(
          "Thank you for chatting with me! 😊 Feel free to come back anytime you need help. Stay safe! 🛡️"
        );
        const farewellMsg = this.createChatBotMessage(farewellText, { delay: 1500 });

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, farewellMsg],
        }));

        // Track bot response
        await this.api.createConversation({
          message_text: farewellText,
          message_type: 'bot',
          chat_step: 'conversation_end',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 1500
        }).catch(err => console.error('Failed to save farewell message:', err));

        // Clear conversation state
        localStorage.removeItem('conversationState');
        localStorage.removeItem('conversationStateTimestamp');
        break;
      }

      default: {
        console.warn('Unknown flow end option:', option);
        const errorText = MessageFormatter.formatWarning(
          "I didn't understand that option. Please try again."
        );
        await this.showHelpMessage(errorText);
        return;
      }
    }

    // Track response data
    await this.api.createResponse({
      response_category: 'FlowEndNavigation',
      response_type: 'user',
      question_asked: 'What would you like to do next?',
      user_response: option,
      widget_used: 'flowEndOptions',
      available_options: ['Learn about other methods', 'Find nearest clinic', 'Back to main menu', 'End conversation'],
      step_in_flow: 'flowEndOption'
    }).catch(err => console.error('Failed to save response:', err));
  };

  // Phase 3.3: Compare Methods Feature
  private compareSelectedMethods: string[] = [];
  private readonly MAX_COMPARE_METHODS = 4;

  // Phase 3.4: Session Continuation
  private readonly SESSION_TIMEOUT_MINUTES = 30;
  
  private saveConversationState = (): void => {
    const state = {
      currentStep: this.state.currentStep,
      lastMethodViewed: this.state.lastMethodViewed || null,
      compareSelectedMethods: this.compareSelectedMethods,
      timestamp: Date.now(),
      messageCount: this.state.messages.length
    };
    localStorage.setItem('conversationState', JSON.stringify(state));
    localStorage.setItem('conversationStateTimestamp', Date.now().toString());
  };

  private restoreConversationState = async (): Promise<boolean> => {
    try {
      const savedState = localStorage.getItem('conversationState');
      const savedTimestamp = localStorage.getItem('conversationStateTimestamp');
      
      if (!savedState || !savedTimestamp) return false;

      const state = JSON.parse(savedState);
      const timestamp = parseInt(savedTimestamp);
      const ageMinutes = (Date.now() - timestamp) / (60 * 1000);

      // Only restore if less than SESSION_TIMEOUT_MINUTES old
      if (ageMinutes > this.SESSION_TIMEOUT_MINUTES) {
        localStorage.removeItem('conversationState');
        localStorage.removeItem('conversationStateTimestamp');
        return false;
      }

      const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;

      // Describe last activity
      let activityDescription = "exploring family planning options";
      if (state.currentStep === 'methodDetails' && state.lastMethodViewed) {
        activityDescription = `learning about ${state.lastMethodViewed}`;
      } else if (state.currentStep === 'duration') {
        activityDescription = "selecting prevention duration";
      } else if (state.currentStep === 'emergency') {
        activityDescription = "looking at emergency contraception";
      } else if (state.compareSelectedMethods && state.compareSelectedMethods.length > 0) {
        activityDescription = `comparing ${state.compareSelectedMethods.length} methods`;
      }

      const resumeText = MessageFormatter.formatInfo(
        `Welcome back! 👋\n\nI see you were ${activityDescription} about ${Math.round(ageMinutes)} minutes ago.\n\nWould you like to continue where you left off?`
      );

      const resumeMsg = this.createChatBotMessage(resumeText, {
        delay: 500,
        widget: 'resumeOptions'
      });

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, resumeMsg],
      }));

      // Restore comparison state if exists
      if (state.compareSelectedMethods && state.compareSelectedMethods.length > 0) {
        this.compareSelectedMethods = state.compareSelectedMethods;
      }

      return true;
    } catch (error) {
      console.error('Error restoring conversation state:', error);
      localStorage.removeItem('conversationState');
      localStorage.removeItem('conversationStateTimestamp');
      return false;
    }
  };

  handleAddToComparison = async (method: string): Promise<void> => {
    await this.ensureChatSession();

    // Check if already added
    if (this.compareSelectedMethods.includes(method)) {
      const alreadyAddedMsg = this.createChatBotMessage(
        `⚠️ *${method}* is already in your comparison list.`,
        { delay: 300 }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, alreadyAddedMsg],
      }));
      return;
    }

    // Check maximum limit
    if (this.compareSelectedMethods.length >= this.MAX_COMPARE_METHODS) {
      const maxLimitMsg = this.createChatBotMessage(
        `⚠️ You can compare up to ${this.MAX_COMPARE_METHODS} methods at a time. Please compare now or clear your selection.`,
        { delay: 300, widget: 'comparisonActions' }
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, maxLimitMsg],
      }));
      return;
    }

    // Add method to comparison
    this.compareSelectedMethods.push(method);

    const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;
    
    const confirmText = MessageFormatter.formatSuccess(
      `Added *${method}* to comparison!\n\n` +
      `📋 Methods selected (${this.compareSelectedMethods.length}):\n` +
      this.compareSelectedMethods.map((m, i) => `${i + 1}. ${m}`).join('\n') +
      `\n\nSelect ${this.compareSelectedMethods.length < 2 ? 'at least one more method' : 'another method'} or tap "Compare Now" below.`
    );

    const confirmMsg = this.createChatBotMessage(confirmText, {
      delay: 500,
      widget: 'comparisonActions'
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, confirmMsg],
    }));

    // Track addition
    await this.api.createConversation({
      message_text: `Added ${method} to comparison`,
      message_type: 'bot',
      chat_step: 'addToComparison',
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save comparison add:', err));
  };

  handleCompareNow = async (): Promise<void> => {
    await this.ensureChatSession();

    if (this.compareSelectedMethods.length < 2) {
      await this.showHelpMessage(
        "⚠️ Please select at least 2 methods to compare. Tap methods to add them to your comparison list."
      );
      return;
    }

    const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;

    // Generate comparison table
    const comparisonText = await this.generateMethodComparison(this.compareSelectedMethods);
    const comparisonMsg = this.createChatBotMessage(comparisonText, { delay: 1000 });

    // Add follow-up options
    const followUpText = MessageFormatter.formatInfo(
      "What would you like to do next?"
    );
    const followUpMsg = this.createChatBotMessage(followUpText, {
      delay: 2000,
      widget: 'flowEndOptions'
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, comparisonMsg, followUpMsg],
    }));

    // Track comparison
    await this.api.createResponse({
      response_category: 'MethodComparison',
      response_type: 'user',
      question_asked: 'Compare methods',
      user_response: this.compareSelectedMethods.join(', '),
      widget_used: 'comparisonActions',
      available_options: this.compareSelectedMethods,
      step_in_flow: 'compareNow'
    }).catch(err => console.error('Failed to save comparison:', err));

    // Clear comparison after showing
    this.compareSelectedMethods = [];
  };

  handleClearComparison = async (): Promise<void> => {
    this.compareSelectedMethods = [];

    const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;
    
    const clearMsg = this.createChatBotMessage(
      MessageFormatter.formatSuccess("✅ Comparison list cleared! Select methods to start a new comparison."),
      { delay: 300 }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, clearMsg],
    }));
  };

  // Phase 4.1: Intelligent Journey Summarization
  showConversationSummary = async (): Promise<void> => {
    const summary = this.extractConversationSummary();
    const journey = this.analyzeUserJourney();
    
    const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;
    
    // Phase 4: Enhanced summary with journey analysis
    const summaryText = this.generateIntelligentSummary(summary, journey, MessageFormatter);
    const summaryMsg = this.createChatBotMessage(summaryText, { delay: 1000 });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, summaryMsg],
    }));

    // Save summary to database with journey metadata
    await this.api.createConversation({
      message_text: summaryText,
      message_type: 'bot',
      chat_step: 'conversationSummary',
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save summary:', err));

    // Save journey analytics
    await this.api.createResponse({
      response_category: 'JourneyAnalytics',
      response_type: 'system',
      question_asked: 'User Journey Summary',
      user_response: JSON.stringify({
        primaryIntent: journey.primaryIntent,
        keyDecisions: journey.keyDecisions.length,
        methodsViewed: summary.methodsViewed.length,
        duration: summary.duration,
        completedGoal: journey.completedGoal
      }),
      widget_used: 'conversationSummary',
      step_in_flow: 'journeyComplete'
    }).catch(err => console.error('Failed to save journey analytics:', err));
  };

  // Phase 4.1: Analyze user journey to identify patterns and intent
  private analyzeUserJourney = (): {
    primaryIntent: 'emergency' | 'prevention' | 'exploration' | 'comparison' | 'clinic_search';
    urgency: 'high' | 'medium' | 'low';
    keyDecisions: Array<{ step: string; decision: string; timestamp?: string }>;
    completedGoal: boolean;
    dropOffPoint?: string;
  } => {
    const messages = this.state.messages || [];
    const journey = {
      primaryIntent: 'exploration' as 'emergency' | 'prevention' | 'exploration' | 'comparison' | 'clinic_search',
      urgency: 'medium' as 'high' | 'medium' | 'low',
      keyDecisions: [] as Array<{ step: string; decision: string; timestamp?: string }>,
      completedGoal: false,
      dropOffPoint: undefined as string | undefined
    };

    // Analyze message flow to determine primary intent
    const userMessages = messages.filter(m => m.type === 'user');
    const botMessages = messages.filter(m => m.type === 'bot');

    // Intent detection from early messages (first 5 user messages)
    const earlyMessages = userMessages.slice(0, 5).map(m => m.message.toLowerCase()).join(' ');
    
    if (earlyMessages.includes('emergency') || earlyMessages.includes('postpill') || 
        earlyMessages.includes('urgent') || earlyMessages.includes('yesterday')) {
      journey.primaryIntent = 'emergency';
      journey.urgency = 'high';
    } else if (earlyMessages.includes('compare') || this.compareSelectedMethods.length > 0) {
      journey.primaryIntent = 'comparison';
      journey.urgency = 'low';
    } else if (earlyMessages.includes('clinic') || earlyMessages.includes('location') || 
               earlyMessages.includes('near me')) {
      journey.primaryIntent = 'clinic_search';
      journey.urgency = 'medium';
    } else if (earlyMessages.includes('prevent') || earlyMessages.includes('future') ||
               earlyMessages.includes('1 year') || earlyMessages.includes('3 years')) {
      journey.primaryIntent = 'prevention';
      journey.urgency = 'low';
    }

    // Extract key decisions from user selections
    userMessages.forEach((msg, index) => {
      const decision = msg.message;
      const timestamp = msg.timestamp;
      
      // Identify decision points
      if (decision === 'Emergency' || decision === 'Prevent in future') {
        journey.keyDecisions.push({
          step: 'contraception_type',
          decision: decision,
          timestamp
        });
      } else if (['Up to 1 year', '1 - 2 years', '3 - 4 years', '5 - 10 years', 'Permanently'].includes(decision)) {
        journey.keyDecisions.push({
          step: 'prevention_duration',
          decision: decision,
          timestamp
        });
      } else if (['Daily pills', 'Male condom', 'Female condom', 'Implants', 'Injectables', 
                  'IUD', 'IUS', 'Emergency pills', 'Diaphragm'].includes(decision)) {
        journey.keyDecisions.push({
          step: 'method_selection',
          decision: decision,
          timestamp
        });
      } else if (decision.includes('clinic') || decision.includes('location')) {
        journey.keyDecisions.push({
          step: 'clinic_search',
          decision: 'Searched for clinic',
          timestamp
        });
      }
    });

    // Determine if goal was completed
    const lastBotMessage = botMessages[botMessages.length - 1]?.message.toLowerCase() || '';
    
    if (journey.primaryIntent === 'emergency') {
      // Goal complete if emergency product info was shown
      journey.completedGoal = botMessages.some(m => 
        m.message.toLowerCase().includes('postpill') || 
        m.message.toLowerCase().includes('emergency contraception')
      );
    } else if (journey.primaryIntent === 'prevention') {
      // Goal complete if at least one method was viewed
      journey.completedGoal = journey.keyDecisions.some(d => d.step === 'method_selection');
    } else if (journey.primaryIntent === 'comparison') {
      // Goal complete if comparison was shown
      journey.completedGoal = botMessages.some(m => m.message.toLowerCase().includes('method comparison'));
    } else if (journey.primaryIntent === 'clinic_search') {
      // Goal complete if clinic info was shown
      journey.completedGoal = botMessages.some(m => 
        m.message.toLowerCase().includes('clinic') || 
        m.message.toLowerCase().includes('location')
      );
    } else {
      // Exploration - complete if multiple topics covered
      journey.completedGoal = journey.keyDecisions.length >= 2;
    }

    // Identify drop-off point if goal not completed
    if (!journey.completedGoal && journey.keyDecisions.length > 0) {
      const lastDecision = journey.keyDecisions[journey.keyDecisions.length - 1];
      journey.dropOffPoint = lastDecision.step;
    }

    return journey;
  };

  // Phase 4.1: Generate intelligent summary based on journey
  private generateIntelligentSummary = (
    summary: {
      topicsExplored: string[];
      methodsViewed: string[];
      recommendations: string[];
      duration: string;
    },
    journey: {
      primaryIntent: string;
      urgency: string;
      keyDecisions: Array<{ step: string; decision: string }>;
      completedGoal: boolean;
      dropOffPoint?: string;
    },
    MessageFormatter: any
  ): string => {
    let summaryText = MessageFormatter.formatInfo("📊 *Your Journey Summary*\n\n");

    // Personalized opening based on intent and completion
    if (journey.completedGoal) {
      if (journey.primaryIntent === 'emergency') {
        summaryText += "✅ Great! You got the emergency contraception information you needed.\n\n";
      } else if (journey.primaryIntent === 'prevention') {
        summaryText += "✅ Excellent! You explored family planning options for your needs.\n\n";
      } else if (journey.primaryIntent === 'comparison') {
        summaryText += "✅ Perfect! You compared different methods to make an informed choice.\n\n";
      } else if (journey.primaryIntent === 'clinic_search') {
        summaryText += "✅ Great! You found clinic information.\n\n";
      } else {
        summaryText += "✅ You explored family planning options today.\n\n";
      }
    } else {
      summaryText += "📝 Here's what we covered in our conversation:\n\n";
    }

    // Show methods viewed
    if (summary.methodsViewed.length > 0) {
      summaryText += `👁️ *Methods You Viewed:*\n`;
      summary.methodsViewed.forEach((method) => {
        const emoji = MessageFormatter.getMethodEmoji(method);
        summaryText += `• ${method} ${emoji}\n`;
      });
      summaryText += "\n";
    }

    // Show key decisions made
    if (journey.keyDecisions.length > 0) {
      summaryText += `📝 *Key Decisions:*\n`;
      journey.keyDecisions.slice(0, 3).forEach((decision) => {
        summaryText += `• ${decision.decision}\n`;
      });
      summaryText += "\n";
    }

    // Show topics explored
    if (summary.topicsExplored.length > 0) {
      summaryText += `📚 *Topics Covered:* ${summary.topicsExplored.slice(0, 3).join(', ')}\n\n`;
    }

    // Session stats
    summaryText += `⏱️ *Time Spent:* ${summary.duration}\n\n`;

    // Phase 4.2: Context-aware recommendations
    summaryText += this.generateRecommendations(summary, journey, MessageFormatter);

    return summaryText;
  };

  // Phase 4.2: Extract contextual data from conversation
  private extractContextualData = (messages: any[]): {
    ageGroup?: string;
    maritalStatus?: string;
    lifestyle: string[];
    concerns: string[];
    preferences: string[];
    healthFactors: string[];
  } => {
    const context = {
      lifestyle: [] as string[],
      concerns: [] as string[],
      preferences: [] as string[],
      healthFactors: [] as string[]
    };

    messages.forEach((msg) => {
      const text = msg.message.toLowerCase();

      // Detect lifestyle factors
      if (text.match(/busy|travel|work|schedule|forget/i)) {
        context.lifestyle.push('busy_schedule');
      }
      if (text.match(/partner|relationship|married/i)) {
        context.lifestyle.push('relationship');
      }
      if (text.match(/irregular|heavy period|menstrual|cramp/i)) {
        context.concerns.push('menstrual_concerns');
      }
      if (text.match(/pain|discomfort|side effect/i)) {
        context.concerns.push('side_effects');
      }
      if (text.match(/weight|acne|mood|headache/i)) {
        context.concerns.push('hormonal_effects');
      }

      // Detect preferences
      if (text.match(/long.term|permanent|years/i)) {
        context.preferences.push('long_term');
      }
      if (text.match(/short.term|temporary|month/i)) {
        context.preferences.push('short_term');
      }
      if (text.match(/natural|no hormone|hormone.free/i)) {
        context.preferences.push('non_hormonal');
      }
      if (text.match(/convenient|easy|simple/i)) {
        context.preferences.push('convenience');
      }
      if (text.match(/cheap|afford|cost|price/i)) {
        context.preferences.push('cost_conscious');
      }

      // Detect health factors
      if (text.match(/smoke|smoking|cigarette/i)) {
        context.healthFactors.push('smoking');
      }
      if (text.match(/blood pressure|hypertension/i)) {
        context.healthFactors.push('high_blood_pressure');
      }
      if (text.match(/diabetes/i)) {
        context.healthFactors.push('diabetes');
      }
      if (text.match(/breast.?feed|nursing|lactating/i)) {
        context.healthFactors.push('breastfeeding');
      }
    });

    return context;
  };

  // Phase 4.2: Generate personalized recommendations with context awareness
  private generateRecommendations = (
    summary: {
      topicsExplored: string[];
      methodsViewed: string[];
      recommendations: string[];
      duration: string;
    },
    journey: {
      primaryIntent: string;
      urgency: string;
      completedGoal: boolean;
      dropOffPoint?: string;
    },
    MessageFormatter: any
  ): string => {
    let recommendations = "💡 *Next Steps:*\n";
    
    // Extract contextual data for enhanced recommendations
    const context = this.extractContextualData(this.state.messages || []);

    // Intent-based recommendations
    if (journey.primaryIntent === 'emergency') {
      recommendations += "• Visit a pharmacy or clinic within 5 days for emergency contraception\n";
      recommendations += "• Consider long-term contraception to prevent future emergencies\n";
      recommendations += "• Get a pregnancy test if your next period is late\n";
    } else if (journey.primaryIntent === 'prevention') {
      if (summary.methodsViewed.length > 0) {
        recommendations += "• Book a consultation with a healthcare provider to discuss your choice\n";
        recommendations += "• Visit a clinic to start your chosen method\n";
        
        // Phase 4.2: Context-aware method suggestions
        if (context.lifestyle.includes('busy_schedule')) {
          recommendations += "• Given your busy schedule, ask about long-acting methods like implants or IUD\n";
        }
        if (context.preferences.includes('non_hormonal')) {
          recommendations += "• You mentioned interest in hormone-free options - discuss copper IUD with your provider\n";
        }
        if (context.preferences.includes('cost_conscious')) {
          recommendations += "• Ask about government-subsidized clinics for more affordable options\n";
        }
        
        if (summary.methodsViewed.length === 1) {
          recommendations += "• Consider comparing with other methods to find the best fit\n";
        }
      } else {
        recommendations += "• Continue exploring methods to find what suits you best\n";
        recommendations += "• Consider your lifestyle, budget, and health needs\n";
      }
    } else if (journey.primaryIntent === 'comparison') {
      recommendations += "• Review the comparison to make an informed decision\n";
      recommendations += "• Discuss your top choice with a healthcare provider\n";
      recommendations += "• Visit a clinic to start your selected method\n";
    } else if (journey.primaryIntent === 'clinic_search') {
      recommendations += "• Call ahead to confirm clinic hours and services\n";
      recommendations += "• Bring any relevant health information\n";
      recommendations += "• Ask about costs and insurance coverage\n";
    } else {
      // General exploration
      recommendations += "• Continue chatting anytime you have questions\n";
      recommendations += "• Visit a healthcare provider for personalized advice\n";
      recommendations += "• Explore different methods to find your best fit\n";
    }

    // Phase 4.2: Health factor contraindications
    if (context.healthFactors.length > 0) {
      recommendations += "\n⚕️ *Important Health Note:*\n";
      
      if (context.healthFactors.includes('smoking')) {
        recommendations += "• Inform your provider about smoking - some methods may not be suitable\n";
      }
      if (context.healthFactors.includes('high_blood_pressure')) {
        recommendations += "• With blood pressure concerns, your provider will recommend appropriate methods\n";
      }
      if (context.healthFactors.includes('breastfeeding')) {
        recommendations += "• Some methods are safe while breastfeeding - ask about progestin-only options\n";
      }
      if (context.healthFactors.includes('diabetes')) {
        recommendations += "• Discuss diabetes management with contraception options with your provider\n";
      }
    }

    // Phase 4.2: Concern-based recommendations
    if (context.concerns.length > 0) {
      if (context.concerns.includes('menstrual_concerns')) {
        recommendations += "\n🩸 *For Menstrual Concerns:*\n";
        recommendations += "• Some methods can reduce heavy periods or cramps (IUD, pills, implant)\n";
        recommendations += "• Discuss your menstrual symptoms with a healthcare provider\n";
      }
      if (context.concerns.includes('side_effects')) {
        recommendations += "\n💊 *About Side Effects:*\n";
        recommendations += "• Most side effects are temporary and manageable\n";
        recommendations += "• Your provider can switch methods if side effects persist\n";
      }
    }

    // Phase 4.2: Follow-up timing based on method viewed
    if (summary.methodsViewed.length > 0) {
      const method = summary.methodsViewed[0];
      recommendations += "\n📅 *Follow-Up Suggestion:*\n";
      
      if (method.includes('pills')) {
        recommendations += "• Return in 3 months to share your experience and get a refill\n";
      } else if (method.includes('Implant')) {
        recommendations += "• Check in after 1 month if you have concerns, otherwise in 6 months\n";
      } else if (method.includes('Injectable')) {
        recommendations += "• Schedule your next injection in 3 months (don't miss the window!)\n";
      } else if (method.includes('IUD') || method.includes('IUS')) {
        recommendations += "• Return for a follow-up check after your next period\n";
      } else if (method.includes('condom')) {
        recommendations += "• Chat with us anytime you have questions about proper use\n";
      }
    }

    // Urgency-based additions
    if (journey.urgency === 'high') {
      recommendations += "\n⚠️ *Important:* For emergency situations, seek immediate medical attention.\n";
    }

    // Incomplete goal suggestions
    if (!journey.completedGoal && journey.dropOffPoint) {
      recommendations += "\n📌 *Tip:* You can return anytime to continue where you left off.\n";
    }

    recommendations += "\n💬 Feel free to come back anytime! Stay safe! 🛡️";

    return recommendations;
  };

  private extractConversationSummary = (): {
    topicsExplored: string[];
    decisions: Array<{ question: string; answer: string }>;
    methodsViewed: string[];
    recommendations: string[];
    duration: string;
  } => {
    const summary = {
      topicsExplored: [] as string[],
      decisions: [] as Array<{ question: string; answer: string }>,
      methodsViewed: [] as string[],
      recommendations: [] as string[],
      duration: '0 minutes'
    };

    const messages = this.state.messages || [];
    
    // Extract topics from bot messages
    const topicsSet = new Set<string>();
    messages.forEach((msg) => {
      if (msg.type === 'bot') {
        const text = msg.message.toLowerCase();
        
        if (text.includes('emergency') || text.includes('postpill')) {
          topicsSet.add('Emergency contraception');
        }
        if (text.includes('daily pills') || text.includes('oral contraceptive')) {
          topicsSet.add('Daily contraceptive pills');
        }
        if (text.includes('condom')) {
          topicsSet.add('Condoms');
        }
        if (text.includes('implant') || text.includes('jadelle')) {
          topicsSet.add('Contraceptive implants');
        }
        if (text.includes('injectable') || text.includes('sayana')) {
          topicsSet.add('Injectable contraceptives');
        }
        if (text.includes('iud') || text.includes('iuslydia')) {
          topicsSet.add('IUD/IUS');
        }
        if (text.includes('clinic') || text.includes('location')) {
          topicsSet.add('Clinic locations');
        }
        if (text.includes('compare') || text.includes('comparison')) {
          topicsSet.add('Method comparison');
        }
      }
    });
    
    summary.topicsExplored = Array.from(topicsSet);

    // Extract methods viewed from currentStep or messages
    const methodsSet = new Set<string>();
    messages.forEach((msg) => {
      if (msg.type === 'user') {
        const methods = [
          'Daily pills', 'Male condom', 'Female condom', 'Implants',
          'Injectables', 'IUD', 'IUS', 'Emergency pills', 'Diaphragm'
        ];
        methods.forEach((method) => {
          if (msg.message.includes(method)) {
            methodsSet.add(method);
          }
        });
      }
    });
    
    summary.methodsViewed = Array.from(methodsSet);

    // Calculate session duration (rough estimate from message timestamps)
    if (messages.length > 1) {
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length - 1];
      
      if (firstMsg.timestamp && lastMsg.timestamp) {
        const durationMs = new Date(lastMsg.timestamp).getTime() - new Date(firstMsg.timestamp).getTime();
        const durationMin = Math.round(durationMs / (60 * 1000));
        summary.duration = durationMin > 0 ? `${durationMin} minutes` : 'Less than a minute';
      }
    }

    return summary;
  };

  // Phase 3.4: Handle Resume Session
  handleResumeSession = async (resume: boolean): Promise<void> => {
    await this.ensureChatSession();

    if (resume) {
      const savedState = localStorage.getItem('conversationState');
      if (!savedState) {
        await this.showHelpMessage("⚠️ Sorry, I couldn't find your previous session. Let's start fresh!");
        return;
      }

      try {
        const state = JSON.parse(savedState);
        
        const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;

        const continueMsg = this.createChatBotMessage(
          MessageFormatter.formatSuccess("Great! Let's continue from where you left off. ✅"),
          { delay: 300 }
        );

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, continueMsg],
          currentStep: state.currentStep || prev.currentStep,
        }));

        // Restore comparison state
        if (state.compareSelectedMethods && state.compareSelectedMethods.length > 0) {
          this.compareSelectedMethods = state.compareSelectedMethods;
          
          const compareRestoredMsg = this.createChatBotMessage(
            MessageFormatter.formatInfo(
              `📋 I've restored your comparison list with ${state.compareSelectedMethods.length} method(s):\n` +
              state.compareSelectedMethods.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')
            ),
            { delay: 800, widget: 'comparisonActions' }
          );
          
          this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, compareRestoredMsg],
          }));
        } else if (state.currentStep === 'duration') {
          // Show duration options
          const durationMsg = this.createChatBotMessage(
            "For how long do you want to prevent pregnancy?",
            { delay: 500, widget: 'preventionDurationOptions' }
          );
          this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, durationMsg],
          }));
        } else {
          // Show flow end options to continue
          const optionsMsg = this.createChatBotMessage(
            MessageFormatter.formatInfo("What would you like to do?"),
            { delay: 500, widget: 'flowEndOptions' }
          );
          this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, optionsMsg],
          }));
        }

        // Track session resume
        await this.api.createConversation({
          message_text: "Resumed previous session",
          message_type: 'bot',
          chat_step: 'sessionResume',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 300
        }).catch(err => console.error('Failed to save resume:', err));

      } catch (error) {
        console.error('Error resuming session:', error);
        await this.showHelpMessage("⚠️ Sorry, I had trouble resuming your session. Let's start fresh!");
      }
    } else {
      // Start fresh
      localStorage.removeItem('conversationState');
      localStorage.removeItem('conversationStateTimestamp');
      
      const MessageFormatter = (await import('./utils/MessageFormatter')).MessageFormatter;

      const freshStartMsg = this.createChatBotMessage(
        MessageFormatter.formatSuccess("Perfect! Let's start fresh. What would you like help with today?"),
        { delay: 300, widget: 'planningMethodOptions' }
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, freshStartMsg],
        currentStep: 'fpm',
      }));

      // Track fresh start
      await this.api.createConversation({
        message_text: "Started fresh session",
        message_type: 'bot',
        chat_step: 'freshStart',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 300
      }).catch(err => console.error('Failed to save fresh start:', err));
    }
  };

  private generateMethodComparison = async (methods: string[]): Promise<string> => {
    const methodData: Record<string, { duration: string; effectiveness: string; cost: string; availability: string }> = {
      "Daily pills": { duration: "Daily", effectiveness: "91-99%", cost: "₦500-1,500/month", availability: "Pharmacies, Clinics" },
      "Male condom": { duration: "Per use", effectiveness: "82-98%", cost: "₦50-200/pack", availability: "Pharmacies, Stores" },
      "Female condom": { duration: "Per use", effectiveness: "79-95%", cost: "₦200-500 each", availability: "Pharmacies, Clinics" },
      "Implants": { duration: "3-5 years", effectiveness: "99%+", cost: "₦10,000-25,000", availability: "Clinics, Hospitals" },
      "Injectables": { duration: "3 months", effectiveness: "94-99%", cost: "₦1,500-3,000/dose", availability: "Clinics, Hospitals" },
      "IUD": { duration: "5-10 years", effectiveness: "99%+", cost: "₦5,000-15,000", availability: "Clinics, Hospitals" },
      "IUS": { duration: "5-7 years", effectiveness: "99%+", cost: "₦15,000-35,000", availability: "Clinics, Hospitals" },
      "Emergency pills": { duration: "One-time", effectiveness: "75-89%", cost: "₦500-2,000", availability: "Pharmacies, Clinics" },
      "Diaphragm": { duration: "Per use", effectiveness: "88-94%", cost: "₦5,000-10,000", availability: "Clinics" },
    };

    const { MessageFormatter } = await import('./utils/MessageFormatter');
    
    let comparison = MessageFormatter.formatInfo("📊 *Method Comparison*\n\n");
    
    methods.forEach((method, index) => {
      const data = methodData[method] || { 
        duration: "Contact clinic", 
        effectiveness: "Contact clinic", 
        cost: "Varies", 
        availability: "Contact clinic" 
      };
      
      const emoji = MessageFormatter.getMethodEmoji(method);
      
      comparison += `*${index + 1}. ${method}* ${emoji}\n`;
      comparison += `⏱️ Duration: ${data.duration}\n`;
      comparison += `📈 Effectiveness: ${data.effectiveness}\n`;
      comparison += `💰 Cost: ${data.cost}\n`;
      comparison += `📍 Availability: ${data.availability}\n`;
      
      if (index < methods.length - 1) {
        comparison += `\n${'─'.repeat(30)}\n\n`;
      }
    });

    comparison += `\n\n💡 *Tip:* For personalized advice, visit a healthcare provider.`;
    
    return comparison;
  };

  handleNextAction = async (action: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(action, 'next_action');

    // Track user action selection
    await this.api.createConversation({
      message_text: action,
      message_type: 'user',
      chat_step: "nextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "nextActionOptions"
    }).catch(err => console.error('Failed to save next action:', err));

    switch (action) {
      case 'Chat with AI /Human':
        await this.handleGeneralQuestion();
        return;

      case 'Learn other methods': {
        const methodsMessage = this.createChatBotMessage(
          'What would you like me to help you with?',
          {
            widget: 'fpmOptions',
            delay: 500,
          },
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, methodsMessage],
          currentStep: 'fpm',
        }));
        
        // Track learn other methods path
        await this.api.createConversation({
          message_text: methodsMessage.message,
          message_type: 'bot',
          chat_step: "fpm",
          message_sequence_number: this.getNextSequenceNumber(),
          widget_name: "fpmOptions",
          message_delay_ms: 500
        }).catch(err => console.error('Failed to save methods message:', err));
        return;
      }

      case 'Pada  si Ibere': {
        const mainMenuMessage = this.createChatBotMessage(
          ' Kin ni ohun ti o tún fẹ se báyìí?',
          {
            widget: 'fpmOptions',
            delay: 500,
          },
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, mainMenuMessage],
          currentStep: 'fpm',
        }));
        
        // Track back to main menu path
        await this.api.createConversation({
          message_text: mainMenuMessage.message,
          message_type: 'bot',
          chat_step: "fpm",
          message_sequence_number: this.getNextSequenceNumber(),
          widget_name: "fpmOptions",
          message_delay_ms: 500
        }).catch(err => console.error('Failed to save main menu:', err));
        return;
      }

      default: {
        const responseMessage = this.createChatBotMessage(
          'Thank you for using our family planning assistant!',
          { delay: 500 },
        );
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, responseMessage],
          currentStep: 'default',
        }));
        
        // Track default path
        await this.api.createConversation({
          message_text: responseMessage.message,
          message_type: 'bot',
          chat_step: "default",
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 500
        }).catch(err => console.error('Failed to save thank you:', err));
      }
    }
  };
  handleErectileDysfunctionOptions = async (option: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(option, 'erectile_dysfunction_option');

    // Track user ED option selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: "erectileDysfunction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "erectileDysfunctionOptions"
    }).catch(err => console.error('Failed to save ED option:', err));

    const responseMessage = this.createChatBotMessage(
      'For erectile dysfunction concerns, I recommend consulting with a healthcare provider for proper evaluation and treatment options.',
      { delay: 500 },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: 'default',
    }));
    
    // Track bot response
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "erectileDysfunctionAdvice",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save ED advice:', err));
  };

  handleSexEnhancementNextAction = async (option: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage = this.createUserMessage(option, 'sex_enhancement_next_action');

    // Track user next action selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: "sexEnhancementNextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "sexEnhancementNextActionOptions"
    }).catch(err => console.error('Failed to save sex enhancement next action:', err));

    const responseMessage = this.createChatBotMessage(
      'Thank you for your interest in sexual health.n jẹ o fẹ lati béèrè ohun miran?',
      {
        widget: 'moreHelpOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep: 'moreHelp',
    }));
    
    // Track bot response
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "moreHelp",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "moreHelpOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save more help:', err));
  };

  // GENERAL QUESTION HANDLER IMPLEMENTATIONS

  handleGeneralQuestion = async (): Promise<void> => {
    const responseMessage = this.createChatBotMessage(
      'Inu mi yoo dun lati ṣe iranlọwọ pẹlu awọn ibeere rẹ! ',
      { delay: 500 },
    );
    const agentMessage = this.createChatBotMessage(
      'Would you prefer to speak with a human agent or continue with me (AI chatbot)?',
      {
        widget: 'agentTypeOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, responseMessage, agentMessage],
      currentStep: 'agentTypeSelection',
    }));
    
    await this.ensureChatSession();
    
    // Create conversation and store the conversation ID
    try {
      const conversation = await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: 'agentTypeSelection',
        message_sequence_number: 1,
        widget_name: 'agentTypeOptions',
      });
      
      // Store the conversation ID in state for later use in escalation
      if (conversation && conversation.conversation_id) {
        this.setState((prev: ChatbotState) => ({
          ...prev,
          conversationId: conversation.conversation_id,
        }));
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  handleAgentTypeSelection = async (type: string): Promise<void> => {
    const userMessage = this.createUserMessage(type, 'agent_type_selection');

    if (type === 'Human Agent') {
      try {
        // Use the agent escalation service to escalate to human
        const escalationResult = await this.escalateToHuman();

        let responseMessage: ChatMessage;

        if (escalationResult?.status === 'ASSIGNED') {
          responseMessage = this.createChatBotMessage(
            `Great! I've connected you with ${escalationResult.agentName || 'a human agent'}. They'll be with you shortly.`,
            { delay: 500 },
          );

          // Set up WebSocket listener for agent messages
          if (escalationResult.agentId) {
            this.setupAgentCommunication(escalationResult.agentId);
          }
        } else if (escalationResult?.status === 'QUEUED') {
          const queueMessage = `I'm adding you to the queue for a human agent. You're position ${escalationResult.position} with an estimated wait time of ${escalationResult.estimatedWaitTime}.`;

          responseMessage = this.createChatBotMessage(queueMessage, {
            delay: 500,
            widget: 'queueStatus',
          });

          // Set up queue status updates
          this.setupQueueStatusUpdates();
        } else {
          // Fallback message if escalation service is not available
          responseMessage = this.createChatBotMessage(
            "I'm connecting you with a human agent. Please wait a moment while I transfer your chat.",
            { delay: 500 },
          );
        }

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, responseMessage],
          currentStep:
            escalationResult?.status === 'ASSIGNED'
              ? 'agentActive'
              : 'waitingForAgent',
          escalationStatus: escalationResult?.status,
          queuePosition: escalationResult?.position,
          assignedAgent: escalationResult?.agentName,
          agentId: escalationResult?.agentId,
        }));

        // Save conversation step to backend
        // TODO: Enable when API method is available
        // await this.saveConversationMessage({
        //   message_text: responseMessage.message,
        //   message_type: 'bot',
        //   chat_step: 'agent_escalation',
        //   message_sequence_number: this.getNextMessageSequence(),
        //   widget_name: escalationResult?.status === 'QUEUED' ? 'queueStatus' : undefined
        // });
      } catch (error) {
        console.error('Failed to escalate to human agent:', error);

        // Fallback error handling
        const errorMessage = this.createChatBotMessage(
          "I'm sorry, there was an issue connecting you to a human agent. Let me try to help you myself, or you can try again later.",
          { delay: 500 },
        );

        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage, errorMessage],
          currentStep: 'agentTypeSelection',
        }));
      }
    } else if (type === 'AI Chatbot' || type === 'AI chatbot' || type === 'AI Agent') {
      const aiMessage = this.createChatBotMessage(
        "Perfect! I'm here to help. Please ask your question and I'll do my best to provide accurate information.",
        { delay: 500 },
      );
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, aiMessage],
        currentStep: 'userQuestion',
      }));

      // Save conversation step to backend
      await this.ensureChatSession();
      await this.api.createConversation({
        message_text: aiMessage.message,
        message_type: 'bot',
        chat_step: 'ai_agent_selected',
        message_sequence_number: this.getNextSequenceNumber(),
        detected_intent: 'ai_chatbot_selected',
        widget_name: 'agentTypeOptions',
        message_delay_ms: 500,
      }).catch(err => console.error('Failed to log AI selection:', err));
    } else {
      const errorMessage = this.createChatBotMessage(
        "I'm sorry, I didn't understand that. Please choose either 'Human Agent' or 'AI Chatbot'.",
        { delay: 500 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, errorMessage],
        currentStep: 'agentTypeSelection',
      }));
    }
  };

  // NEW METHODS FOR AGENT INTEGRATION

  private async escalateToHuman(): Promise<EscalationResult | null> {
    try {
      // Get the current conversation ID
      const currentConversationId = this.getCurrentConversationId();
      
      if (!currentConversationId) {
        console.error('No conversation ID available for escalation');
        return null;
      }

      // Use the API service to escalate
      const response = await this.api.escalateToAgent(currentConversationId);
      
      return response as EscalationResult | null;
    } catch (error) {
      console.error('Error escalating to human:', error);
    }
    return null;
  }

  private setupAgentCommunication(agentId: string) {
    // Set up WebSocket connection for real-time agent communication
    if (typeof WebSocket !== 'undefined') {
      const ws = new WebSocket(
        `ws://localhost:8080/chatbot-ws?userId=${this.userSessionId}&agentId=${agentId}`,
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleAgentMessage(data);
      };

      ws.onopen = () => {
        console.log('Connected to agent communication channel');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      // Store WebSocket reference for cleanup
      this.setState((prev) => ({ ...prev, agentWebSocket: ws }));
    }
  }

  private setupQueueStatusUpdates() {
    // Set up periodic queue status updates
    const updateInterval = setInterval(async () => {
      try {
        const currentConversationId = this.getCurrentConversationId();
        if (!currentConversationId) return;

        const queueData = await this.api.getQueueStatus(currentConversationId);
        if (queueData && queueData.status === 'QUEUED') {
          this.handleQueueUpdate({
            position: queueData.position || 0,
            estimatedWaitTime: queueData.estimatedWaitTime || '15 minutes',
            status: queueData.status,
          });
        }
      } catch (error) {
        console.error('Error fetching queue status:', error);
      }
    }, 30000); // Update every 30 seconds

    // Store interval reference for cleanup
    this.setState((prev) => ({ ...prev, queueUpdateInterval: updateInterval }));
  }

  private handleAgentMessage = (data: AgentMessageData) => {
    switch (data.type) {
      case 'AGENT_JOINED':
        this.handleAgentJoined(data);
        break;
      case 'AGENT_MESSAGE':
        this.handleIncomingAgentMessage(data);
        break;
      case 'AGENT_DISCONNECTED':
        this.handleAgentDisconnected(data);
        break;
    }
  };

  private handleAgentJoined = (data: AgentMessageData) => {
    const agentJoinMessage = this.createChatBotMessage(
      `${data.agentName} has joined the conversation and will assist you now.`,
      {
        delay: 500,
        withAvatar: true,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, agentJoinMessage],
      currentStep: 'agentActive',
      assignedAgent: data.agentName,
      agentId: data.agentId,
      escalationStatus: 'ASSIGNED',
    }));
  };

  private handleIncomingAgentMessage = (data: AgentMessageData) => {
    if (!data.message) return;

    const agentMessage = this.createChatBotMessage(data.message, {
      withAvatar: true,
      tag: 'agent-message',
    });

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, agentMessage],
    }));
  };

  private handleAgentDisconnected = (data: AgentMessageData) => {
    const disconnectMessage = this.createChatBotMessage(
      `${data.agentName} has left the conversation. I'm here to continue helping you.`,
      { delay: 500 },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, disconnectMessage],
      currentStep: 'userQuestion',
      assignedAgent: null,
      agentId: null,
      escalationStatus: null,
    }));
  };

  private handleQueueUpdate = (queueData: QueueUpdateData) => {
    if (this.state.escalationStatus === 'QUEUED') {
      const updateMessage = this.createChatBotMessage(
        `Queue update: You're now position ${queueData.position} with an estimated wait time of ${queueData.estimatedWaitTime}.`,
        { delay: 500 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, updateMessage],
        queuePosition: queueData.position,
      }));
    }
  };

  private getCurrentConversationId(): string {
    // Generate or retrieve current conversation ID
    return (
      this.state.conversationId || `conv-${this.userSessionId}-${Date.now()}`
    );
  }

  private getConversationSummary() {
    const recentMessages = this.state.messages.slice(-10); // Last 10 messages
    return {
      userId: this.userSessionId,
      conversationId: this.getCurrentConversationId(),
      currentStep: this.state.currentStep,
      language: this.state.selectedLanguage,
      recentMessages: recentMessages.map((msg) => ({
        text: msg.message,
        type: msg.type,
        timestamp: new Date(),
      })),
      userProfile: {
        selectedGender: this.state.selectedGender,
        selectedState: this.state.selectedState,
        selectedLGA: this.state.selectedLGA,
        selectedAgeGroup: this.state.selectedAgeGroup,
        selectedMaritalStatus: this.state.selectedMaritalStatus,
      },
      fpmData: this.state.fpmInteractionData || {},
    };
  }

  // TODO: Use when message sequencing is needed
  // private getNextMessageSequence(): number {
  //   return (this.state.messages.length || 0) + 1;
  // };

  // Clean up WebSocket and intervals when component unmounts
  cleanup = () => {
    if (this.state.agentWebSocket) {
      this.state.agentWebSocket.close();
    }
    if (this.state.queueUpdateInterval) {
      clearInterval(this.state.queueUpdateInterval);
    }
  };

  handleMoreHelp = (answer: string): void => {
    const userMessage = this.createUserMessage(answer, 'more_help_selection');

    if (answer === 'Yes') {
      const helpOptions = this.createChatBotMessage(
        'Se mo tun le ran ọ lọwọ fun nnkan miiran bíi?',
        {
          widget: 'moreHelpOptions',
          delay: 500,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, helpOptions],
        currentStep: 'moreHelp',
      }));
    } else {
      const thankYou = this.createChatBotMessage(
        'O ṣeun fun lilo iṣẹ wa! Lero ọfẹ lati pada wa nigbakugba ti o nilo iranlọwọ. Ojo re oni a dara gan ni!',
        { delay: 500 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, thankYou],
        currentStep: 'default',
      }));
    }
  };

  handleMoreHelpOptions = (option: string): void => {
    console.log('More help option:', option);
    this.handleMoreHelp(option);
  };

  handleUserQuestion = async (question: string): Promise<void> => {
    const userMessage = this.createUserMessage(question, 'user_question');

    // Add user message immediately
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // Show typing indicator
    const loadingMessage = this.createChatBotMessage('...', {
      loading: true,
      withAvatar: true,
    });
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }));

    try {
      // USE THE ACTUAL AI SERVICE
      const aiResponse = await this.api.askAI(question);

      // Replace loading message with AI response
      const responseMessage = this.createChatBotMessage(aiResponse, {
        delay: 500,
      });

      this.setState((prev) => ({
        ...prev,
        messages: prev.messages
          .filter((msg) => !msg.loading)
          .concat(responseMessage),
      }));

      // 📊 SAVE AI CONVERSATION TO DATABASE
      await this.api
        .createConversation({
          message_type: 'user',
          message_text: question,
          chat_step: 'userQuestion',
          widget_name: 'userQuestion',
          message_sequence_number: 1,
          message_delay_ms: 0,
        })
        .catch((err) => console.error('Failed to save user question:', err));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: aiResponse,
          chat_step: 'userQuestion',
          widget_name: 'aiResponse',
          message_sequence_number: 2,
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save AI response:', err));

      // 📝 SAVE USER RESPONSE TRACKING
      await this.api
        .createResponse({
          response_category: 'AIAssistance',
          response_type: 'user',
          question_asked: 'AI Agent Question',
          user_response: question,
          widget_used: 'userQuestion',
          available_options: [],
          step_in_flow: 'userQuestion',
        })
        .catch((err) =>
          console.error('Failed to save AI response tracking:', err),
        );

      // Ask if user needs more help
      const helpMessage = this.createChatBotMessage(
      'Se mo tun le ran ọ lọwọ fun nnkan miiran bíi?',
        {
          widget: 'moreHelpOptions',
          delay: 1000,
        },
      );

      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, helpMessage],
        currentStep: 'moreHelp',
      }));
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Provide a helpful fallback response when AI is unavailable
      const fallbackResponse =
        "I apologize, but I'm having trouble connecting to my AI service at the moment. For family planning questions, I recommend speaking with one of our medical professionals. Would you like me to connect you with a human agent?";

      const errorMessage = this.createChatBotMessage(fallbackResponse, {
        delay: 500,
      });

      const helpOptions = this.createChatBotMessage(
        'How would you like to proceed?',
        {
          widget: 'agentTypeOptions',
          delay: 1000,
        },
      );

      this.setState((prev) => ({
        ...prev,
        messages: prev.messages
          .filter((msg) => !msg.loading)
          .concat(errorMessage, helpOptions),
        currentStep: 'agentTypeSelection',
      }));
    }
  };

  // FPM CHANGE/STOP HANDLER IMPLEMENTATIONS - Delegated to FPMChangeProvider

  handleFPMChangeSelection = (option: string): void => {
    this.fpmChangeProvider.handleFPMChangeSelection(option);
  };

  handleFPMConcernSelection = (option: string): void => {
    this.fpmChangeProvider.handleFPMConcernSelection(option);
  };

  handleCurrentFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleCurrentFPMSelection(method);
  };

  handleFPMConcernTypeSelection = (concernType: string): void => {
    this.fpmChangeProvider.handleFPMConcernTypeSelection(concernType);
  };

  handleFPMSideEffectSelection = (sideEffect: string): void => {
    this.fpmChangeProvider.handleFPMSideEffectSelection(sideEffect);
  };

  handleFPMNextAction = (action: string): void => {
    this.fpmChangeProvider.handleFPMNextAction(action);
  };

  handleFinalFeedback = (feedback: string): void => {
    this.fpmChangeProvider.handleFinalFeedback(feedback);
  };

  // FPM SWITCH FLOW HANDLERS

  handleSwitchCurrentFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleSwitchCurrentFPMSelection(method);
  };

  handleSatisfactionAssessment = (satisfaction: string): void => {
    this.fpmChangeProvider.handleSatisfactionAssessment(satisfaction);
  };

  handleSwitchReason = (reason: string): void => {
    this.fpmChangeProvider.handleSwitchReason(reason);
  };

  handleMethodRecommendationInquiry = (response: string): void => {
    this.fpmChangeProvider.handleMethodRecommendationInquiry(response);
  };

  handleKidsInFuture = (response: string): void => {
    this.fpmChangeProvider.handleKidsInFuture(response);
  };

  handleTimingSelection = (timing: string): void => {
    this.fpmChangeProvider.handleTimingSelection(timing);
  };

  handleImportantFactors = (factor: string): void => {
    this.fpmChangeProvider.handleImportantFactors(factor);
  };

  handleMenstrualFlowPreference = (preference: string): void => {
    this.fpmChangeProvider.handleMenstrualFlowPreference(preference);
  };

  // FPM STOP FLOW HANDLERS

  handleStopFPMSelection = (method: string): void => {
    this.fpmChangeProvider.handleStopFPMSelection(method);
  };

  handleStopReason = (reason: string): void => {
    this.fpmChangeProvider.handleStopReason(reason);
  };

  // GET PREGNANT HANDLER IMPLEMENTATIONS - Delegated to GetPregnantActionProvider

  handleGetPregnantInitiation = (): void => {
    this.getPregnantActionProvider.handleGetPregnantInitiation();
  };

  handleGetPregnantFPMSelection = (selection: string): void => {
    this.getPregnantActionProvider.handleGetPregnantFPMSelection(selection);
  };

  handleGetPregnantTryingDuration = (duration: string): void => {
    this.getPregnantActionProvider.handleGetPregnantTryingDuration(duration);
  };

  handleGetPregnantIUDRemoval = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantIUDRemoval(status);
  };

  handleGetPregnantImplantRemoval = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantImplantRemoval(status);
  };

  handleGetPregnantInjectionStop = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantInjectionStop(status);
  };

  handleGetPregnantPillsStop = (status: string): void => {
    this.getPregnantActionProvider.handleGetPregnantPillsStop(status);
  };

  handleGetPregnantNextAction = (action: string): void => {
    this.getPregnantActionProvider.handleGetPregnantNextAction(action);
  };

  handleGetPregnantUserQuestion = (question: string): void => {
    this.getPregnantActionProvider.handleGetPregnantUserQuestion(question);
  };

  // UTILITY METHODS

  private getLubricantInfo = (category: string, product?: string): string => {
    const lubricantData: Record<
      string,
      {
        description: string;
        products?: Record<string, string>;
      }
    > = {
      'Water-based': {
        description:
          "Water-based lubricants are safe to use with condoms and are easy to clean up. They're compatible with all types of contraceptives.",
        products: {
          'Fiesta Intim Gel':
            'Fiesta Intim Gel is a water-based lubricant designed to enhance comfort and pleasure during intimate moments.',
          'KY Jelly':
            "KY Jelly is a well-known water-based personal lubricant that's gentle and effective for reducing friction during intimacy.",
        },
      },
      'Silicone-based': {
        description:
          "Silicone-based lubricants last longer than water-based ones and are good for longer sessions. They're also condom-compatible.",
      },
      'Natural options': {
        description:
          'Natural options include coconut oil or aloe vera, but note that oil-based products can break down latex condoms.',
      },
    };

    const categoryData = lubricantData[category];

    if (!categoryData) {
      return 'This lubricant can help enhance comfort during intimate moments. \nPlease consult with a healthcare provider about safe lubricant options.';
    }

    if (product && categoryData.products && categoryData.products[product]) {
      return categoryData.products[product];
    }

    return categoryData.description;
  };

  // DEMOGRAPHICS UPDATE HANDLER
  handleDemographicsUpdate = (): void => {
    const userMessage = this.createUserMessage('demographics', 'demographics_update');

    // Get current demographic information for display
    const currentInfo = this.getDemographicSummary();

    const updateMessage = this.createChatBotMessage(
      "I'll help you update your demographic information. Here's what I currently have:\n\n" +
        currentInfo,
      { delay: 500 },
    );

    const confirmMessage = this.createChatBotMessage(
      "Would you like to update any of this information? I'll walk you through each step:",
      { delay: 1000 },
    );

    const languageQuestion = this.createChatBotMessage(
      'First, please select your preferred language:',
      {
        widget: 'languageOptions',
        delay: 1500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        updateMessage,
        confirmMessage,
        languageQuestion,
      ],
      currentStep: 'language',
    }));
  };

  // Helper method to get current demographic summary
  private getDemographicSummary = (): string => {
    const {
      selectedLanguage,
      selectedGender,
      selectedState,
      selectedLGA,
      selectedAge,
      selectedMaritalStatus,
    } = this.state;

    let summary = '';
    if (selectedLanguage) summary += `• Language: ${selectedLanguage}\n`;
    if (selectedGender) summary += `• Gender: ${selectedGender}\n`;
    if (selectedState) summary += `• State: ${selectedState}\n`;
    if (selectedLGA) summary += `• LGA: ${selectedLGA}\n`;
    if (selectedAge) summary += `• Age: ${selectedAge}\n`;
    if (selectedMaritalStatus)
      summary += `• Marital Status: ${selectedMaritalStatus}\n`;

    return summary || '• No demographic information stored yet\n';
  };
}

export default ActionProvider;
