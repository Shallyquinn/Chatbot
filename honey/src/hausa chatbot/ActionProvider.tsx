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

    const genderQuestion = this.createChatBotMessage('What is your gender?', {
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
        "Wani abu kike son sani game da tsarin iyali? Zan iya ba ki bayani game da Hanyoyin Tsarin Iyali (FPM) ko wasu tambayoyin da suka shafi jima'i.",
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
        // Show main menu options
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
        this.addMessageToState(menuMessage);
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
        const languageMessage = this.createChatBotMessage(
          'Da fatan za a zaɓi harshen da kuka fi so:',
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
      `Madalla! Menene sunan ƙaramar hukuma (LGA) ɗinku a cikin ${state} Jihar?`,
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
    const userMessage: ChatMessage = {
      message: location,
      type: 'user',
      id: uuidv4(),
    };

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
    const userMessage: ChatMessage = {
      message: locationOption,
      type: 'user',
      id: uuidv4(),
    };

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

      case 'Yadda ake rigakafin ɗaukar ciki':
        this.preventPregnancyActionProvider.handlePreventPregnancyInitiation();
        return;

      case "Yadda za a inganta rayuwar jima'i":
        responseMessage = this.createChatBotMessage(
          'Zan iya taimaka muku wajen inganta rayuwar jima’in ku. A wane ɓangare kuke son mu mayar da hankali?',
          {
            widget: 'sexEnhancementOptions',
            delay: 500,
          },
        );
        this.handleSexLifeImprovement();
        break;

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
      case 'Yi hira da AI ko Mutum':
        await this.handleGeneralQuestion();
        return;

      case 'Donsanin wasu hanyoyin': {
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
      'Shin za ku fi so ku yi magana da wakilin kiwon lafiya, ko ku ci gaba da tattaunawa tare da ni (AI chatbot)?',
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
          const queueMessage = `Ina ƙara ku cikin jerin masu jira don a haɗa ku da wakilin kiwon lafiya. Zaku jira ${escalationResult.position} na dan lokacin tsawon ${escalationResult.estimatedWaitTime}.`;

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
    } else if (type === 'AI Agent') {
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
      // TODO: Enable when API method is available
      // await this.saveConversationMessage({
      //   message_text: aiMessage.message,
      //   message_type: 'bot',
      //   chat_step: 'ai_agent_selected',
      //   message_sequence_number: this.getNextMessageSequence()
      // });
    } else {
      const errorMessage = this.createChatBotMessage(
        "Yi haƙuri, ban fahimci hakan ba. Da fatan za a zaɓi ɗaya: 'Human Agent' ko 'AI Agent'.",
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
    const userMessage: ChatMessage = {
      message: answer,
      type: 'user',
      id: uuidv4(),
    };

    if (answer === 'Ee') {
      const helpOptions = this.createChatBotMessage(
        'Wane irin ƙarin taimako kuke so?',
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
          'Zaɓuɓɓukan mai na gargajiya sun haɗa da man kwakwa (coconut oil) ko aloe vera, amma a lura cewa samfuran da aka yi da mai (oil-based products) na iya lalata kwandumi na latex (latex condoms).',
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
    const userMessage: ChatMessage = {
      message: 'demographics',
      type: 'user',
      id: uuidv4(),
    };

    // Get current demographic information for display
    const currentInfo = this.getDemographicSummary();

    const updateMessage = this.createChatBotMessage(
      "Zan taimaka muku wajen sabunta bayanan ƙididdigar jama’a (demographic information). Ga bayanan da nake da su a halin yanzu:\n\n" +
        currentInfo,
      { delay: 500 },
    );

    const confirmMessage = this.createChatBotMessage(
      "Shin kuna son sabunta wani ɓangare na wannan bayanin? Zan yi muku jagora akowani mataki-mataki:",
      { delay: 1000 },
    );

    const languageQuestion = this.createChatBotMessage(
      'Da farko, don Allah zaɓi harshen da kuka fi so:',
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
    if (selectedLanguage) summary += `• Harshe: ${selectedLanguage}\n`;
    if (selectedGender) summary += `• Jinsi: ${selectedGender}\n`;
    if (selectedState) summary += `• Jiha:: ${selectedState}\n`;
    if (selectedLGA) summary += `• Karamar Hukuma: ${selectedLGA}\n`;
    if (selectedAge) summary += `• Shekaru: ${selectedAge}\n`;
    if (selectedMaritalStatus)
      summary += `• Matsayin aure: ${selectedMaritalStatus}\n`;

    return summary || '• Har yanzu ba a adana bayanan ƙididdigar jama’a (demographic information) ba.\n';
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
