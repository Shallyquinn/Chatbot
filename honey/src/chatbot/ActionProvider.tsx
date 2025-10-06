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
import { apiService, ApiService } from '@/services/api';

// ACTION PROVIDER INTERFACE - Complete interface matching all widgets

export interface ActionProviderInterface {
  // NAVIGATION HANDLERS
  handleKeywordNavigation: (keyword: string) => void;

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
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;

  // Initialize providers
  private fpmChangeProvider: FPMChangeProvider;
  private getPregnantActionProvider: GetPregnantActionProvider;
  private preventPregnancyActionProvider: PreventPregnancyActionProvider;

  // Store user's location data
  private userState: string = '';
  private api: ApiService;
  private chatSessionInitialized: boolean = false;

  private userSessionId: string;
  private messageSequenceNumber: number = 0;

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
  ) {
    this.createChatBotMessage = createChatBotMessage;
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

    // Load state from server on initialization
    this.loadStateFromServer();

    console.log('🏗️ ActionProvider constructed with all providers');
  }

  // Session management for proper database storage

  // Ensure chat session is initialized before API calls
  private async ensureChatSession() {
    if (!this.chatSessionInitialized) {
      try {
        await this.api.initializeChatSession();
        this.chatSessionInitialized = true;
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
      }
    }
  }

  // Get next message sequence number for tracking
  private getNextSequenceNumber(): number {
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
        // Show main menu options
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
        this.addMessageToState(menuMessage);
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

  // BASIC SETUP HANDLER IMPLEMENTATIONS

  handleLanguageSelection = async (language: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: language,
      type: 'user',
      id: uuidv4(),
      tag: 'language_selection',
    };

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
        message_sequence_number: 1,
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    // Check if this is a returning user first
    const isReturningUser = await this.checkForReturningUser();

    // Only proceed with onboarding if this is a new user
    if (!isReturningUser) {
      const greeting = this.createChatBotMessage(
        'Hey! My name is Honey. I am a family planning and pregnancy prevention chatbot. I am here to help with information on family planning, sexual health, and intimacy.\n\n I can answer your family planning questions, refer you to a medical professional to talk to, and also refer you to a family planning clinic\n\n If you want to be connected to a medical professional agent, just type the word "human" at any time. \n\n Any communication happening in this chat is strictly confidential, so you can feel safe sharing personal information',
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
      const genderQuestion = this.createChatBotMessage('What is your gender?', {
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
    const userMessage: ChatMessage = {
      message: gender,
      type: 'user',
      id: uuidv4(),
      tag: 'gender_selection',
    };

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
        message_sequence_number: 2,
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
    const userMessage: ChatMessage = {
      message: state,
      type: 'user',
      id: uuidv4(),
      tag: 'state_selection',
    };
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
        message_sequence_number: 3,
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const lgaQuestion = this.createChatBotMessage(
      `Great! What LGA (Local Government Area) are you in within ${state} state?`,
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
    const userMessage: ChatMessage = {
      message: lga,
      type: 'user',
      id: uuidv4(),
      tag: 'lga_selection',
    };
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
        message_sequence_number: 4,
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

    const ageQuestion = this.createChatBotMessage('What is your age group?', {
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
    const userMessage: ChatMessage = {
      message: location,
      type: 'user',
      id: uuidv4(),
    };

    const confirmLocation = this.createChatBotMessage(
      `Please confirm your local government area is ${location}`,
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
    const userMessage: ChatMessage = {
      message: locationOption,
      type: 'user',
      id: uuidv4(),
    };

    if (locationOption === "Yes, that's correct") {
      const ageQuestion = this.createChatBotMessage('How old are you?', {
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
    const userMessage: ChatMessage = {
      message: age,
      type: 'user',
      id: uuidv4(),
      tag: 'age_selection',
    };

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
        message_sequence_number: 5,
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const maritalQuestion = this.createChatBotMessage(
      "What's your marital status?",
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
    const userMessage: ChatMessage = {
      message: status,
      type: 'user',
      id: uuidv4(),
      tag: 'marital_status_selection',
    };
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
        message_sequence_number: 6,
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    const thankYou = this.createChatBotMessage('Thank you for sharing!', {
      delay: 500,
    });
    const assistMsg = this.createChatBotMessage(
      'Now I can assist you better.',
      { delay: 500 },
    );
    const fpmQuestion = this.createChatBotMessage(
      'I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. \n If you want to be connected to a human agent, just type the word "human" at any time. \n To see all the family planning clinics available, type "clinic". \n What do you want to know? \n\nFPM = Family Planning Method',
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
    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };

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
        message_sequence_number: 1,
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
        responseMessage = this.createChatBotMessage(
          'I can help improve your sexual experience. What would you like to focus on?',
          {
            widget: 'sexEnhancementOptions',
            delay: 500,
          },
        );
        this.handleSexLifeImprovement();
        break;

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
    
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

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
    
    const userMessage: ChatMessage = {
      message: lubricant,
      type: 'user',
      id: uuidv4(),
    };

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

  handleNextAction = async (action: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: action,
      type: 'user',
      id: uuidv4(),
    };

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

      case 'Back to main menu': {
        const mainMenuMessage = this.createChatBotMessage(
          'What would you like me to help you with?',
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
    
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

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
    
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    // Track user next action selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: "sexEnhancementNextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "sexEnhancementNextActionOptions"
    }).catch(err => console.error('Failed to save sex enhancement next action:', err));

    const responseMessage = this.createChatBotMessage(
      'Thank you for your interest in sexual health. Is there anything else I can help you with?',
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
      "I'd be happy to help with your questions! ",
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
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: 'agentTypeSelection',
      message_sequence_number: 1,
      widget_name: 'agentTypeOptions',
    });
  };

  handleAgentTypeSelection = async (type: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: type,
      type: 'user',
      id: uuidv4(),
    };

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
    } else if (type === 'AI Agent') {
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
      // TODO: Enable when API method is available
      // await this.saveConversationMessage({
      //   message_text: aiMessage.message,
      //   message_type: 'bot',
      //   chat_step: 'ai_agent_selected',
      //   message_sequence_number: this.getNextMessageSequence()
      // });
    } else {
      const errorMessage = this.createChatBotMessage(
        "I'm sorry, I didn't understand that. Please choose either 'Human Agent' or 'AI Agent'.",
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
      const response = await fetch('/api/agent/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: this.getCurrentConversationId(),
          userId: this.userSessionId,
          conversationSummary: this.getConversationSummary(),
        }),
      });

      if (response.ok) {
        return (await response.json()) as EscalationResult;
      }
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
        const response = await fetch(
          `/api/agent/queue-status?conversationId=${this.getCurrentConversationId()}`,
        );
        if (response.ok) {
          const queueData = await response.json();
          this.handleQueueUpdate(queueData);
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
    const userMessage: ChatMessage = {
      message: answer,
      type: 'user',
      id: uuidv4(),
    };

    if (answer === 'Yes') {
      const helpOptions = this.createChatBotMessage(
        'What additional help would you like?',
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
        'Thank you for using our service! Feel free to come back anytime you need help. Have a great day!',
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
    const userMessage: ChatMessage = {
      message: question,
      type: 'user',
      id: uuidv4(),
    };

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
        'Is there anything else I can help you with?',
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
    const userMessage: ChatMessage = {
      message: 'demographics',
      type: 'user',
      id: uuidv4(),
    };

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

  // SERVER STATE MANAGEMENT METHODS

  private async saveStateToServer(state: ChatbotState): Promise<void> {
    try {
      await this.api.saveUserSession({
        user_session_id: this.userSessionId,
        chat_state: JSON.stringify(state),
        last_activity: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save state to server:', error);
      throw error;
    }
  }

  // TODO: Implement when API method is available
  // private async saveConversationMessage(messageData: ConversationMessage): Promise<void> {
  //   try {
  //     await this.api.saveConversationMessage({
  //       user_session_id: this.userSessionId,
  //       conversation_id: this.getCurrentConversationId(),
  //       ...messageData,
  //       timestamp: new Date().toISOString()
  //     });
  //   } catch (error) {
  //     console.error("Failed to save conversation message:", error);
  //     // Don't throw error to prevent breaking the flow
  //   }
  // }

  private async loadStateFromServer(): Promise<void> {
    try {
      const serverState = await this.api.getUserSession(this.userSessionId);
      if (serverState && serverState.chat_state) {
        const parsedState = JSON.parse(serverState.chat_state);

        // Update localStorage with server data
        localStorage.setItem('chat_state', serverState.chat_state);

        // Update the current state if server has more recent data
        this.setState(() => parsedState);

        console.log('✅ State loaded from server successfully');
      }
    } catch (error) {
      console.warn(
        'Could not load state from server, continuing with localStorage:',
        error,
      );
    }
  }
}

export default ActionProvider;
