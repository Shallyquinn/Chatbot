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
  
  // Static navigation callback for language switching (set by App component)
  private static navigationCallback: ((path: string) => void) | null = null;
  
  static setNavigationCallback(callback: (path: string) => void) {
    ActionProvider.navigationCallback = callback;
  }

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
            `Barka da dawowa!👋\n\n Ina nan don taimaka muku kan tambayoyinku na tsarin iyali (family planning).\n\nMe kuke son in taimaka muku a kai a yau?`,
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
        "Sunana Honey. Ni abokiyar hira ce na tsarin iyali da rigakafin ciki. Ina nan don taimakawa da bayanai kan ilimin tsarin iyali da lafiyar jima'i.",
      ),
      this.createChatBotMessage(
        'Kafin mu ci gaba, Ina so in yi muku ƴan tambayoyi don taimaka muku da kyau.',
      ),
      this.createChatBotMessage(
        'Zan iya amsa tambayoyin tsarin iyalin ku, in tura ku zuwa ga ƙwararren likita don yin magana da ku, sannan kuma in tura ku asibitin kayyade iyali.',
      ),
      this.createChatBotMessage(
        'Duk wata hanyar sadarwa da ke faruwa a cikin wannan taɗi na sirri ne, don haka ki kwantar da hankalin ki bazaki samu matsala ba karkiji kunyar yin bayani.',
      ),
    ];

    if (typeof this.addMessageToState === 'function') {
      messages.forEach((msg) => this.addMessageToState(msg));
    }

    if (typeof this.setDemographicsStep === 'function') {
      this.setDemographicsStep('gender');
    }

    const genderQuestion = this.createChatBotMessage('Menene jinsinku?', {
      widget: 'genderOptions',
      payload: {
        options: ['Namiji', 'Mace', 'Na fi son kada in faɗi'],
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
          'Wace Karamar Hukuma (LGA) kike hira?',
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
          'Da fatan zaki ƙara tabbatar mana da karamar hukumar ku.',
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
          "To, yi hakuri, mu sake dubawa",
        );
        this.addMessageToState(retryMsg);
        break;
      }

      case 'age': {
        this.setDemographicsStep('marital_status');
        const ageQuestion = this.createChatBotMessage('Shekarar ki nawa​?', {
          widget: 'ageOptions',
          payload: {
            options: ['< 25', '25-34', '35-44', '45-54', '55 da sama da haka'],
          },
        });
        this.addMessageToState(ageQuestion);
        break;
      }

      case 'marital_status':
        {
          const maritalQuestion = this.createChatBotMessage(
            'Mene ne matsayin aurenki ahalin yanzu',
            {
              widget: 'maritalOptions',
              payload: {
                options: [
                  'Bani da aure',
                  'Na kusa yin aure',
                  '​Ina da aure',
                  'Bazawara (gwauruwa)',
                  'Bazawara',
                  '​​​Na fi son kar na ce komai',
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
        'Na gode da amsoshin (bayanan) da kika ba ni!! Yanzu zan iya taimakonki da kyau',
      ),
      this.createChatBotMessage(
        'I can provide you with information about Family Planning Methods (FPM) or other sex-related questions. What do you want to know?',
        {
          widget: 'mainNavigationOptions',
          payload: {
            options: [
              'Yadda ake ɗaukar ciki',
              'Yadda rigakafin ɗaukar ciki',
              'Sauya/tsayar da hanyar Tsara Iyali da ake amfani dashi a yanzu',
              "Yadda za a inganta rayuwar jima'i",
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
          'Ga muhimman zaɓuɓɓukan da ake da su:\n\n' +
            '1. Nemi bayanai kan hanyoyin tsara iyali (family planning)\n' +
            '2. Nemi cibiyar kiwon lafiya mafi kusa da kai\n' +
            "3. Yi magana da ƙwararren ma'aikacin lafiya\n" +
            '4. Sauya, ko daina hanyar tsara iyali [family planning] da kuke amfani da ita a halin yanzu\n' +
            '5. Nemi taimako wajen ɗaukar ciki\n' +
            "6. Inganta rayuwar jima'i \n" +
            '7. Yi tambaya game da duk abunda kake da buƙata',
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
            `Zan taimaka wajen nemo cibiyoyin lafiya a ${this.state.selectedLGA}, ${this.state.selectedState}.`,
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
          "Suna na Honey, mataimakin ku na chatbot na AI. Ta yaya zan iya taimaka muku a yau? Za ku iya:\n" +
            '1. Ku yi mini tambayoyi kan tsarin iyali \n' +
            '2. Samu bayanai kan ayyukanmu\n' +
            "3. Tuntuɓi wakilin lafiya ta hanyar rubuta 'human'",
          { delay: 500 },
        );
        this.addMessageToState(aiMessage);
        break;
      }

      case 'human': {
        const humanMessage = this.createChatBotMessage(
          "Zan haɗa ku da ƙwararren ma’aikacin kiwon lafiya nan take. Da fatan za ku jira ɗan lokaci yayin da nake tura ku.",
          { delay: 500 },
        );
        this.addMessageToState(humanMessage);
        this.handleAgentTypeSelection('human');
        break;
      }

      case 'language': {
        // Hausa chatbot - show only English and Yoruba options (smart switching)
        const languageMessage = this.createChatBotMessage(
          'Wane yare kake so ka canza zuwa? (Which language would you like to switch to?)',
          {
            widget: 'smartLanguageSwitch',
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
          "Ban gane wannan kalmar ba. Ga kalmomin da ake da su:\n" +
            '- Menu: Duba jerin zaɓuɓɓuka na babban menu\n' +
            '- Cibiyar lafiya: Nemo cibiyoyin lafiya kusa da kai\n' +
            '- Honey: Yi tattaunawa da mataimakin basirar wucin gadi (AI)\n' +
            '- Mutum: Tuntubi ƙwararren ma’aikacin lafiya\n' +
            '- Harshe: Sauya harshen tattaunawa\n' +
            "- Bayanan ƙididdigar jama'a (Demographics): Sabunta bayanan ka",
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
        widget_name: 'smartLanguageSwitch',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((error) => {
        console.warn(
          'Could not log conversation (working offline):',
          error.message,
        );
      });

    // Smart language switching - redirect only if switching to a different language
    if (language === 'English') {
      const redirectMessage = this.createChatBotMessage(
        'Ana canzawa zuwa Turanci... (Switching to English...)',
        { delay: 500 },
      );
      this.addMessageToState(redirectMessage);
      
      setTimeout(() => {
        if (ActionProvider.navigationCallback) {
          ActionProvider.navigationCallback('/chat');
        } else {
          console.error('Navigation callback not set. Please ensure the chatbot component calls ActionProvider.setNavigationCallback(navigate)');
        }
      }, 1000);
      return;
    }

    if (language === 'Yoruba') {
      const redirectMessage = this.createChatBotMessage(
        'Ana canzawa zuwa Yarbanci... (Switching to Yoruba...)',
        { delay: 500 },
      );
      this.addMessageToState(redirectMessage);
      
      setTimeout(() => {
        if (ActionProvider.navigationCallback) {
          ActionProvider.navigationCallback('/chat/yoruba');
        } else {
          console.error('Navigation callback not set. Please ensure the chatbot component calls ActionProvider.setNavigationCallback(navigate)');
        }
      }, 1000);
      return;
    }

    // If user selected Hausa (current language), just acknowledge
    if (language === 'Hausa') {
      const stayMessage = this.createChatBotMessage(
        'Kuna cikin Hausa tuni. (You are already in Hausa language.)',
        { delay: 500 },
      );
      this.addMessageToState(stayMessage);
      return;
    }

    // For initial setup or other cases, continue with normal Hausa onboarding
    // Check if this is a returning user first
    const isReturningUser = await this.checkForReturningUser();

    // Only proceed with onboarding if this is a new user
    if (!isReturningUser) {
      const greeting = this.createChatBotMessage(
        'Sannu! Sunana Honey. Ni manhajar tattaunawa ce kan tsarin iyali da rigakafin ɗaukar ciki. Ina nan don taimaka maka/miki da bayanai game da tsarin iyali, lafiyar jima’i, da kusancin iyali (intimacy).\n\n Zan iya amsa tambayoyinka/ki game da tsarin iyali, in tura ka/ki ga ƙwararren ma’aikacin lafiya don ku yi magana, kuma in tura ka/ki zuwa cibiyar tsarin iyali (family planning clinic).\n\n  Idan kana/kina son a haɗa ka/ki da ƙwararren ma’aikacin lafiya, kawai rubuta kalmar “human” a kowane lokaci. \n\n  Duk sadarwar da ake yi a wannan tattaunawa ana kiyaye ta cikin tsananin sirri, don haka za ku ki iya jin aminci wajen raba bayanan ku na sirri.',
        { delay: 500 },
      );
      const followup1 = this.createChatBotMessage(
        'Domin sauƙaƙa kewaya cikin fasalolina, yi amfani da waɗannan kalmomin don samun damar fasaloli daban-daban\nMenu: Don zuwa babban menu na chatbot.\nClinic: Samu adireshin asibiti a garinku.\nHoney: A haɗa ku da AI chatbot ko wakilin lafiya don ku yi tambayoyinku.\nHuman: Nemi a haɗa ku da ƙwararren jami’in lafiya.\nLanguage: Zaɓi harshen da za ku yi hira da bot (English, Hausa, ko Yoruba).',
        { delay: 1000 },
      );
      const followUp2 = this.createChatBotMessage(
        'Kafin mu ci gaba, ina so in yi muku wasu tambayoyi kaɗan domin mu taimaka muku yadda ya kamata.',
        { delay: 1000 },
      );
      const genderQuestion = this.createChatBotMessage('Menene jinsinku?', {
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
      'Daga wace jiha kuke hira? Da fatan za ku nema a ƙasa sannan ku zaɓi jiharku.',
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
      `Madalla! Wane LGA (Ƙaramar Hukumar Gwamnati) kuke ciki a cikin jihar ${state}?`,
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
      `Da kyau! Kuna tattaunawa daga ${lga}, ${this.userState}.`,
      { delay: 500 },
    );

    const ageQuestion = this.createChatBotMessage('Wane rukunin shekaru kuke ciki?', {
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
      `Da fatan za ku tabbatar da cewa ƙaramar hukumar ku ita ce: ${location}`,
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

    if (locationOption === "Ee, haka yake") {
      const ageQuestion = this.createChatBotMessage('Shekarunku nawa?', {
        widget: 'ageOptions',
        delay: 500,
      });
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, ageQuestion],
        currentStep: 'age',
      }));
    } else if (locationOption === 'Canza wuri') {
      const stateQuestion = this.createChatBotMessage(
        "Bari mu fara daga farko. Daga wace jiha kake/kike tattaunawa?",
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
      "Menene matsayin auren ku a yanzu?",
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

    const thankYou = this.createChatBotMessage('Mun gode da bayanan ku!', {
      delay: 500,
    });
    const assistMsg = this.createChatBotMessage(
      'Yanzu zan iya taimaka muku yadda ya kamata.',
      { delay: 500 },
    );
    const fpmQuestion = this.createChatBotMessage(
      "Zan iya ba ku bayanai game da Hanyoyin Tsara Iyali ko kuma sauran tambayoyin da suka shafi jima'i. \n Idan kuna son a haɗa ku da ma'aikacin kiwon lafiya, ku rubuta kalmar 'human' a kowane lokaci. \n Don ganin dukkan cibiyoyin tsarin iyali da ake da su, rubuta 'clinic'. \n Me kuke son sani? \n\n FPM = Hanyar Tsarin Iyali (Family Planning Method)",
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
          'Yadda ake ɗaukar ciki',
          'Yadda ake rigakafin ɗaukar ciki',
          "Yadda za a inganta rayuwar jima'i",
          'Sauya/dakatar da hanyar Tsarin Iyali da ake amfani dashi a yanzu',
          'Yi tambaya game da duk abunda kake da buƙata',
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
      case 'Yadda ake ɗaukar ciki':
        this.handleGetPregnantInitiation();
        return;

      case 'How to prevent pregnancy':
        this.preventPregnancyActionProvider.handlePreventPregnancyInitiation();
        return;

      case 'Yadda za a inganta rayuwar jima\'i':
        this.sexEnhancementActionProvider.handleSexEnhancementInitiation();
        return;

      case 'Sauya/dakatar da hanyar Tsarin Iyali da ake amfani dashi a yanzu':
        this.setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, userMessage],
        }));
        this.handleFPMChangeSelection(method);
        return;

      case 'Yi tambaya game da duk abunda kake da buƙata':
        this.handleGeneralQuestion();
        return;

      default:
        responseMessage = this.createChatBotMessage(
          "Yi haƙuri, ban fahimci wannan zaɓin ba. Don Allah zaɓi daga cikin zaɓuɓɓukan da ke akwai.",
          { delay: 500 },
        );
        break;
    }
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage],
      currentStep:
        method === 'Yadda ake rigakafin ɗaukar ciki'
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

  // Medical conditions screening handler (delegated to preventPregnancyActionProvider)
  handleMedicalConditionsResponse = (option: string): void => {
    this.preventPregnancyActionProvider.handleMedicalConditionsResponse(option);
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
      "Zan iya taimaka muku wajen inganta gogewarku a fannin jima'i. Wane ɓangare kuke son in mai da hankali a kai?",
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
        'Ga wasu zaɓuɓɓukan man shafawa (lubricant) da za ku iya amfani dasu:',
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
        'Game da damuwar rashin miƙewar azzakari (erectile dysfunction), ina ba da shawarar a tuntuɓi ƙwararren mai ba da kulawar lafiya domin a gudanar da ingantaccen binciken da ya kamata tare da tattauna zaɓuɓɓukan magani.',
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
        question_asked: 'A kan me kuke son mayar da hankali?',
        user_response: option,
        widget_used: 'sexEnhancementOptions',
        available_options: ['Gels da Man shafawa (Lubricants)', 'Matsalar rashin tsayuwar azzakari'],
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
      'Me kike son yi a gaba?',
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
      question_asked: 'Wane irin man shafawa (lubricant) kake/kike son sanin bayani a kai?',
      user_response: lubricant,
      widget_used: 'lubricantOptions',
      available_options: ['Na ruwa (Water-based)','Na mai (Oil-based)', 'Na silicone (Silicone-based)'],
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
      case 'Yi hira da AI ko Mutum':
        await this.handleGeneralQuestion();
        return;

      case 'Learn other methods': {
        const methodsMessage = this.createChatBotMessage(
          'A kan me kuke so in taimaka muku?',
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

      case 'Koma zuwa babban menu': {
        const mainMenuMessage = this.createChatBotMessage(
          'Me za ku so in taimaka muku a kai?',
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
          'Mun gode da amfani da mataimakinmu na tsarin iyali (family planning)!',
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
      'Idan akwai damuwa game da matsalar rashin tsayuwar azzakari (erectile dysfunction), ana ba da shawarar a tuntuɓi ƙwararren ma’aikacin kiwon lafiya don cikakkiyar tantancewa da zaɓuɓɓukan magani da suka dace.',
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
      'Na gode da sha’awarku kan lafiyar jima’i (sexual health). Shin akwai wani abun da zan iya taimaka muku?',
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
      "Zan yi farin cikin taimaka muku game da tambayoyinku!",
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
    
    if (type === 'Wakilin Kiwon lafiya') {
      try {
        // Use the agent escalation service to escalate to human
        const escalationResult = await this.escalateToHuman();

        let responseMessage: ChatMessage;

        if (escalationResult?.status === 'ASSIGNED') {
          responseMessage = this.createChatBotMessage(
            `Madalla! Na haɗa ku da wani ${escalationResult.agentName || 'wakilin kiwon lafiya'}. Zai kasance tare da ku nan ba da jimawa ba.`,
            { delay: 500 },
          );

          // Set up WebSocket listener for agent messages
          if (escalationResult.agentId) {
            this.setupAgentCommunication(escalationResult.agentId);
          }
        } else if (escalationResult?.status === 'QUEUED') {
          const queueMessage = `Ina ƙara ku a cikin jerin jiran wakilin kiwon lafiya. Matsayinku na yanzu shine ${escalationResult.position} tare da kimanin lokacin jira na ${escalationResult.estimatedWaitTime}.`;

          responseMessage = this.createChatBotMessage(queueMessage, {
            delay: 500,
            widget: 'queueStatus',
          });

          // Set up queue status updates
          this.setupQueueStatusUpdates();
        } else {
          // Fallback message if escalation service is not available
          responseMessage = this.createChatBotMessage(
            "Ina haɗa ku da wakilin kiwon lafiya. Don Allah ku jira na ɗan lokaci yayin da nake tura sakwannin ku",
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
          "Ina ba ku haƙuri, an sami matsala wajen haɗa ku da jami'in kiwon lafiya. Bari in yi ƙoƙarin taimaka muku da kaina, ko kuma za ku iya sake gwadawa daga baya.",
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
        "Madalla! Ina nan don taimaka muku. Da fatan za ku gabatar da tambayoyin ku, zan yi iya ƙoƙarina in ba da sahihin bayani.",
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
        "Yi haƙuri, ban fahimci hakan ba. Da fatan za a zaɓi ɗaya: 'Wakilin Kiwon lafiya' ko 'AI Agent'.",
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
      console.log('🚀 Frontend: Starting escalateToHuman');
      
      // Get the current conversation ID
      const currentConversationId = this.getCurrentConversationId();
      
      console.log('🔍 Frontend: Conversation ID:', currentConversationId);
      
      if (!currentConversationId) {
        console.error('❌ Frontend: No conversation ID available for escalation');
        // Try to create a conversation first if we don't have one
        try {
          console.log('🔄 Frontend: Attempting to create conversation first...');
          const conversation = await this.api.createConversation({
            message_text: 'User requested human agent',
            message_type: 'bot',
            chat_step: 'agent_escalation',
            widget_name: 'agentTypeSelection',
            selected_option: 'Human Agent',
            widget_options: [],
            message_sequence_number: this.getNextSequenceNumber(),
          });
          
          if (conversation?.conversation_id) {
            // Update state with the new conversation ID
            this.setState((prev) => ({
              ...prev,
              conversationId: conversation.conversation_id,
            }));
            console.log('✅ Frontend: Created conversation:', conversation.conversation_id);
          } else {
            console.error('❌ Frontend: Failed to create conversation');
            return null;
          }
        } catch (error) {
          console.error('❌ Frontend: Error creating conversation:', error);
          return null;
        }
      }

      // Get the conversation ID again (might have been created)
      const conversationId = this.getCurrentConversationId();
      if (!conversationId) {
        console.error('❌ Frontend: Still no conversation ID after creation attempt');
        return null;
      }

      // Use the API service to escalate
      console.log('📤 Frontend: Calling api.escalateToAgent...');
      const response = await this.api.escalateToAgent(conversationId);
      
      console.log('✅ Frontend: Escalation response:', response);
      return response as EscalationResult | null;
    } catch (error) {
      console.error('❌ Frontend: Error escalating to human:', error);
      return null;
    }
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
      `${data.agentName} Ya shiga tattaunawar kuma zai taimaka muku yanzu.`,
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
      `${data.agentName} ya bar tattaunawar. Ina nan don ci gaba da taimaka muku.`,
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
        `Bayani akan jerin masu jira: Yanzu kuna a matsayi na ${queueData.position} tare da kimantaccen lokacin jira na ${queueData.estimatedWaitTime}.`,
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

    if (answer === 'Ee') {
      const helpOptions = this.createChatBotMessage(
        'Wane ƙarin taimako kuke so?',
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
        'Mun gode da amfani da sabis ɗin mu! Za ku iya dawo a duk lokacin da kuke buƙatar taimako. Ku huta lafiya!',
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

      // SAVE AI CONVERSATION TO DATABASE
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

      // SAVE USER RESPONSE TRACKING
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
        'Shin akwai wani abin da zan iya taimaka muku da shi?',
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
        "Ina ba ku haƙuri, amma a wannan lokaci ina samun matsala wajen haɗuwa da sabis na AI na. Dangane da tambayoyin tsarin iyali (family planning), ina ba da shawarar ku yi magana da ɗaya daga cikin ƙwararrun ma’aikatan lafiyarmu. Kuna so in haɗa ku da wakilin kiwon lafiya?";

      const errorMessage = this.createChatBotMessage(fallbackResponse, {
        delay: 500,
      });

      const helpOptions = this.createChatBotMessage(
        'Ta wace hanya kuke son mu ci gaba?',
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
          "Man shafawa na ruwa (water-based lubricants) suna da aminci a yi amfani da su tare da kwaroron roba (condoms), kuma suna da sauƙin tsabtacewa. Sun dace da dukkan nau'ikan hanyoyin hana haihuwa (contraceptives).",
        products: {
          'Fiesta Intim Gel':
            'Fiesta Intim Gel man shafawa (lubricant) ne mai ruwa (water-based) da aka amfani dashi don haɓaka jin daɗi a lokutan kusanci na jima’i.',
          'KY Jelly':
            "KY Jelly sanannen man shafawa ne (water-based personal lubricant),wanda yake da tasiri wajen rage gogayya yayin saduwa da iyali.",
        },
      },
      'Silicone-based': {
        description:
          "Man shafawa na silikoni (silicone-based lubricants) yana dadewa fiye da man shafawa na ruwa (water-based lubricants) kuma yana da kyau ga lokuta masu tsawo. Haka kuma ana iya amfani dashi da kwaroron roba (condom-compatible).",
      },
      'Natural options': {
        description:
          'Zaɓuɓɓukan halitta sun haɗa da man kwakwa ko aloe vera, amma a lura cewa samfuran mai na iya lalata kwaroron roba na latex.',
      },
    };

    const categoryData = lubricantData[category];

    if (!categoryData) {
      return 'Wannan man shafawa (lubricant) na iya taimakawa wajen inganta jin daɗi a lokutan jima’i. Da fatan za a tuntubi ma’aikacin kiwon lafiya don samun shawara kan zaɓuɓɓukan man shafawa (lubricant) masu aminci.';
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
      "Zan taimaka muku wajen sabunta bayanan ƙididdigar jama’a (demographic information). Ga bayanan da nake da su a halin yanzu:\n\n" +
        currentInfo,
      { delay: 500 },
    );

    const confirmMessage = this.createChatBotMessage(
      "Kuna son sabunta wani daga cikin waɗannan bayanan? Zan jagorance ku ta kowanne mataki:",
      { delay: 1000 },
    );

    const languageQuestion = this.createChatBotMessage(
      'Da farko, don Allah zaɓi yaren da kuke so:',
      {
        widget: 'initialLanguageSelection',
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
    if (selectedLanguage) summary += `• Harshe: ${selectedLanguage}\n`;
    if (selectedGender) summary += `• Jinsi: ${selectedGender}\n`;
    if (selectedState) summary += `• Jiha:: ${selectedState}\n`;
    if (selectedLGA) summary += `• Karamar Hukuma: ${selectedLGA}\n`;
    if (selectedAge) summary += `• Shekaru: ${selectedAge}\n`;
    if (selectedMaritalStatus)
      summary += `• Matsayin Aure: ${selectedMaritalStatus}\n`;

    return summary || '• Har yanzu ba a adana bayanan ƙididdigar jama’a (demographic information) ba.\n';
  };
}

export default ActionProvider;
