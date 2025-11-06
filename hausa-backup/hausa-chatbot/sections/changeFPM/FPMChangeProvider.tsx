// src/chatbot/FPMChangeProvider.tsx - FIXED VERSION WITH COMPREHENSIVE PERSISTENCE
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatStep, ChatbotState } from '../../types';
import {
  FPMChangeProviderInterface,
  CreateChatBotMessage,
  SetStateFunc,
} from './fpmTypes';
import { getSpecificConcernResponse } from './fpmResponses';
import { ApiService } from '@/services/api';

/**
 * FPMChangeProvider handles the logic for changing or stopping family planning methods.
 * It manages user interactions related to concerns, current methods, and next actions.
 */

class FPMChangeProvider implements FPMChangeProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  api: ApiService;
  private chatSessionInitialized: boolean = false;
  private messageSequenceNumber: number = 1;
  private userSessionId: string;

  // Store these locally instead of relying on state getters/setters
  private currentMethodLocal: string = '';
  private satisfaction: string = '';
  private switchReason: string = '';
  private kidsInFuture: string = '';
  private timing: string = '';

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
    apiClient: ApiService,
    userSessionId?: string,
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
      console.error('FPMChange: Failed to save state to server:', error);
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
        console.error('FPMChange: Failed to initialize chat session:', error);
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

  // FIXED: Handler for selecting current FPM method
  handleCurrentFPMSelection = async (method: string): Promise<void> => {
    await this.ensureChatSession();
    
    console.log('🔍 handleCurrentFPMSelection called with:', method);
    console.log('🔍 Current state before update:', this.state.currentFPMMethod);

    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };
    
    // Track user FPM selection
    await this.api.createConversation({
      message_text: method,
      message_type: 'user',
      chat_step: "currentFPMSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "currentFPMOptions"
    }).catch(err => console.error('Failed to save user selection:', err));
    
    await this.api.createFpmInteraction({ current_fpm_method: method }).catch(err => console.error('Failed to save FPM interaction:', err));
    // Store method locally for immediate use AND in state for persistence
    // this.currentMethodLocal = method;
    // console.log("🔧 Stored method locally:", this.currentMethodLocal);

    const concernTypeQuestion = this.createChatBotMessage(
      'To, zan iya taimaka miki. Wane irin damuwa kike da wannan hanya (method)?\nDa fatan za ki zaɓi nau’in damuwarki (concern type).',
      {
        widget: 'fpmConcernTypeOptions',
        delay: 500,
      },
    );

    // Store method in state for persistence across instances
    this.setState((prev: ChatbotState) => {
      console.log('🔧 setState callback - storing method:', method);
      return {
        ...prev,
        messages: [...prev.messages, userMessage, concernTypeQuestion],
        currentFPMMethod: method, // This will persist across ActionProvider instances
        currentStep: 'fpmConcernType' as ChatStep,
      };
    });

    // Track bot question
    await this.api.createConversation({
      message_text: concernTypeQuestion.message,
      message_type: 'bot',
      chat_step: "fpmConcernType",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmConcernTypeOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save concern question:', err));

    console.log('🔍 State update initiated for method:', method);
  };

  // FIXED: Handler for FPM concern type selection
  handleFPMConcernTypeSelection = async (
    concernType: string,
  ): Promise<void> => {
    await this.ensureChatSession();
    
    console.log('handleFPMConcernTypeSelection called with:', concernType);
    const userMessage: ChatMessage = {
      message: concernType,
      type: 'user',
      id: uuidv4(),
    };

    // Track user concern type selection
    await this.api.createConversation({
      message_text: concernType,
      message_type: 'user',
      chat_step: "fpmConcernTypeSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmConcernTypeOptions"
    }).catch(err => console.error('Failed to save concern type:', err));

    await this.api.createFpmInteraction({ fpm_flow_type: concernType }).catch(err => console.error('Failed to save FPM interaction:', err));
    
    // Use local method first, fallback to state if needed
    const methodToUse = this.state.currentFPMMethod || '';
    console.log('🔍 Using method for response:', methodToUse);

    const responseMessage = this.createChatBotMessage(
      'Na fahimci damuwarki. Bari in ba ki wasu bayanai.',
      { delay: 500 }
    );

    const concernQuestion = this.createChatBotMessage(
      'Me kike so ki ƙara sani a kai?',
      {
        widget: 'fpmConcernOptions',
        delay: 1000,
      }
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, concernQuestion],
      currentStep: 'fpmConcernSelection',
      currentConcernType: concernType,
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "fpmConcernTypeResponse",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save response:', err));
    
    await this.api.createConversation({
      message_text: concernQuestion.message,
      message_type: 'bot',
      chat_step: "fpmConcernSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmConcernOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save concern question:', err));
  };

  // FIXED: Handler for FPM concern selection
  handleFPMConcernSelection = async (option: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    // Track user concern selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: "fpmConcernSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmConcernOptions"
    }).catch(err => console.error('Failed to save concern selection:', err));

    await this.api.updateUser({ current_concern_type: option }).catch(err => console.error('Failed to update user:', err));
    // Store the user's intention locally
    let userIntention = '';
    if (option === 'Damuwa game da Tsarin Iyali (FP).') {
      userIntention = 'concerned';
    } else if (option === 'Inaso na canza Tsarin Iyali (FP).') {
      userIntention = 'switch';
    } else if (option === 'Inaso na daina Tsarin Iyali (FP).') {
      userIntention = 'stop';
    }

    console.log('🔧 Set userIntention in state to:', userIntention);

    if (userIntention === 'switch') {
      const responseMessage = this.createChatBotMessage(
        'To, na gane.\n\nBari in tambaye ki ‘yan tambayoyi don fahimtar wacce hanya (method) ta fi dacewa da ke.',
        { delay: 500 },
      );

      const methodQuestion = this.createChatBotMessage(
        'Wace hanya (method) kike amfani da ita a halin yanzu?',
        {
          widget: 'switchFPMOptions',
          delay: 1000,
        },
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
        currentStep: 'switchCurrentFPM',
      }));

      // Track bot messages for switch path
      await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: "switchFPMPath",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save response:', err));
      
      await this.api.createConversation({
        message_text: methodQuestion.message,
        message_type: 'bot',
        chat_step: "switchCurrentFPM",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "switchFPMOptions",
        message_delay_ms: 1000
      }).catch(err => console.error('Failed to save method question:', err));

      await this.api.createResponse({
        response_category: 'FPMConcern',
        response_type: 'user',
        question_asked: 'Menene damuwarki game da Tsarin Iyali ',
        user_response: option,
        widget_used: 'fpmConcernOptions',
        available_options: [
          'Damuwa game da Tsarin Iyali (FP).',
          'Inaso na canza Tsarin Iyali (FP).',
          'Inaso na daina Tsarin Iyali (FP).',
        ] as string[],
        step_in_flow: 'fpmConcernSelection',
      }).catch(err => console.error('Failed to save response data:', err));
    } else {
      // For concerned and stop - ask which method they're using
      const responseMessage = this.createChatBotMessage(
        'To, zan iya taimaka miki. Wace hanya (method) kike amfani da ita a yanzu?\n Zaɓuɓɓuka (options/choose):',
        {
          widget:
            userIntention === 'stop' ? 'stopFPMOptions' : 'currentFPMOptions',
          delay: 500,
        },
      );

      const nextStep =
        userIntention === 'stop' ? 'stopCurrentFPM' : 'currentFPM';

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        userIntention: userIntention, // store user intention in state
        currentStep: nextStep as ChatbotState['currentStep'],
      }));
      
      // Track bot message for concerned/stop paths
      await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: nextStep,
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: userIntention === 'stop' ? 'stopFPMOptions' : 'currentFPMOptions',
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save response:', err));
    }
  };

  // FIXED: Handler for selecting current FPM in the "switch" flow
  handleSwitchCurrentFPMSelection = async (method: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };

    // Track user method selection
    await this.api.createConversation({
      message_text: method,
      message_type: 'user',
      chat_step: "switchCurrentFPMSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "switchFPMOptions"
    }).catch(err => console.error('Failed to save method selection:', err));

    // Store the selected method locally
    console.log('🔧 Switch flow - stored method locally:', method);
    await this.api.createFpmInteraction({ current_fpm_method: method }).catch(err => console.error('Failed to save FPM interaction:', err));
    await this.api.updateUser({ current_fpm_method: method }).catch(err => console.error('Failed to update user:', err));
    // Ask about satisfaction with the current method
    const satisfactionQuestion = this.createChatBotMessage(
      'Yaya hanyar (method) ta ke aiki a gare ki? Za ki ce kina da gamsuwa kaɗan ne ko kuwa ba ki gamsu da ita gaba ɗaya ba?',
      {
        widget: 'satisfactionOptions',
        delay: 500,
      },
    );

    await this.api.createFpmInteraction({
      switch_reason: method,
    }).catch(err => console.error('Failed to save switch reason:', err));
    
    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, satisfactionQuestion],
      currentFPMMethod: method, // store method in state for persistence
      currentStep: 'satisfactionAssessment',
    }));
    
    // Track bot satisfaction question
    await this.api.createConversation({
      message_text: satisfactionQuestion.message,
      message_type: 'bot',
      chat_step: "satisfactionAssessment",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "satisfactionOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save satisfaction question:', err));
    
    await this.api.createResponse({
      response_category: 'SwitchCurrentFPM',
      response_type: 'user',
      question_asked: 'Wace hanyar kike amfani da ita a yanzun?',
      user_response: method,
      widget_used: 'switchFPMOptions',
      available_options: [
        'Kwayoyi (Pills)',
        'Na’urar IUD',
        'Implant',
        'Injectables',
        'Kwandom',
        'Wata Hanya',
      ] as string[],
      step_in_flow: 'switchCurrentFPMSelection',
    }).catch(err => console.error('Failed to save response data:', err));
  };

  // FIXED: Handler for stop FP flow
  handleStopFPMSelection = async (method: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: method,
      type: 'user',
      id: uuidv4(),
    };
    
    // Track user method selection for stop flow
    await this.api.createConversation({
      message_text: method,
      message_type: 'user',
      chat_step: "stopFPMSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "stopFPMOptions"
    }).catch(err => console.error('Failed to save stop selection:', err));
    
    console.log('🔧 Stop flow - stored method in state:', method);
    await this.api.createFpmInteraction({ stop_reason: method }).catch(err => console.error('Failed to save FPM interaction:', err));
    const reasonQuestion = this.createChatBotMessage(
      'To, na gode da bayanan ki! \n Za ki iya faɗa min dalilin da yasa kike son daina amfani da wannan hanyar?\n\nFP = Tsarin Iyali\nZaɓuɓɓuka (Zabi daya)',
      {
        widget: 'stopReasonOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, reasonQuestion],
      currentFPMMethod: method, // store method in state for persistence
      currentStep: 'stopReason',
    }));
    
    // Track bot reason question
    await this.api.createConversation({
      message_text: reasonQuestion.message,
      message_type: 'bot',
      chat_step: "stopReason",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "stopReasonOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save reason question:', err));
    
    await this.api.createResponse({
      response_category: 'StopFPMSelection',
      response_type: 'user',
      question_asked:
        'Za ki iya faɗa min dalilin da yasa kike son daina amfani da wannan hanyar',
      user_response: method,
      widget_used: 'stopReasonOptions',
      available_options: [],
      step_in_flow: 'StopFPMSelection',
    }).catch(err => console.error('Failed to save response data:', err));
  };

  // Handler for FPM change selection (first step after selecting "Change/stop current FPM")
  handleFPMChangeSelection = async (option: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: option,
      type: 'user',
      id: uuidv4(),
    };

    // Track user change selection
    await this.api.createConversation({
      message_text: option,
      message_type: 'user',
      chat_step: "fpmChangeSelection",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "satisfactionOptions"
    }).catch(err => console.error('Failed to save change selection:', err));

    const concernMessage = this.createChatBotMessage(
      'Ban ji dadi cewa ba ki gamsu da hanyar tsarin iyali da kike amfani da ita a yanzu. \n Ama ko zaki iya fadamin abun da ke faruwa? \n\n FP = Tsarin Iyali',
      {
        widget: 'fpmConcernOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, concernMessage],
      currentStep: 'fpmConcern',
    }));
    
    // Track bot concern message
    await this.api.createConversation({
      message_text: concernMessage.message,
      message_type: 'bot',
      chat_step: "fpmConcern",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmConcernOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save concern message:', err));
    
    await this.api.createResponse({
      response_category: 'FPMChangeSelection',
      response_type: 'user',
      question_asked:
        'Yaya hanyar take aiki a gare ki? Za ki ce kina da ɗan gamsuwa, ko kuwa ba ki gamsu da ita gaba ɗaya?',
      user_response: option,
      widget_used: 'satisfactionOptions',
      available_options: ['Ba laifi', 'Ba a gamsu da ita ba gaba ɗaya'],
      step_in_flow: 'FPMChangeSelection',
    }).catch(err => console.error('Failed to save response data:', err));
  };

  // Handler for satisfaction assessment (switch flow)
  handleSatisfactionAssessment = async (
    satisfaction: string,
  ): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: satisfaction,
      type: 'user',
      id: uuidv4(),
    };

    // Track user satisfaction response
    await this.api.createConversation({
      message_text: satisfaction,
      message_type: 'user',
      chat_step: "satisfactionAssessment",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "satisfactionOptions"
    }).catch(err => console.error('Failed to save satisfaction:', err));

    this.satisfaction = satisfaction;

    // Complete database persistence
    await this.api.createFpmInteraction({
      satisfaction_level: satisfaction,
      fpm_flow_type: 'satisfaction_assessment',
      current_fpm_method: this.state.currentFPMMethod,
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    await this.api.createResponse({
      response_category: 'SatisfactionAssessment',
      response_type: 'user',
      question_asked: 'Yaya hanyar take aiki a gare ki?',
      user_response: satisfaction,
      widget_used: 'satisfactionOptions',
      available_options: ['Ba laifi', 'Ba a gamsu da ita ba gaba ɗaya'],
      step_in_flow: 'satisfactionAssessment',
    }).catch(err => console.error('Failed to save response data:', err));

    const reasonQuestion = this.createChatBotMessage(
      'Ko zan iya sanin dalilin da yasa kike son canza tsarin da kike amfani da yanzun?\nZabi dalilin da yasa',
      {
        widget: 'switchReasonOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, reasonQuestion],
      currentStep: 'switchReason',
    }));
    
    // Track bot reason question
    await this.api.createConversation({
      message_text: reasonQuestion.message,
      message_type: 'bot',
      chat_step: "switchReason",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "switchReasonOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save reason question:', err));
  };

  // Handler for switch reason
  handleSwitchReason = async (reason: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: reason,
      type: 'user',
      id: uuidv4(),
    };

    // Track user switch reason
    await this.api.createConversation({
      message_text: reason,
      message_type: 'user',
      chat_step: "switchReason",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "switchReasonOptions"
    }).catch(err => console.error('Failed to save switch reason:', err));

    this.switchReason = reason;

    // Comprehensive persistence with accumulated data
    await this.api.createFpmInteraction({
      switch_reason: reason,
      satisfaction_level: this.satisfaction,
      current_fpm_method: this.state.currentFPMMethod,
      fpm_flow_type: 'switch_reason_selection',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    await this.api.createResponse({
      response_category: 'SwitchReason',
      response_type: 'user',
      question_asked: 'Miye dalilin da yasa kike son canza tsari?',
      user_response: reason,
      widget_used: 'switchReasonOptions',
      step_in_flow: 'switchReason',
    }).catch(err => console.error('Failed to save response data:', err));
    const recommendationQuestion = this.createChatBotMessage(
      'Kina son san wasu hanyoyin ko zaki so ki gwada su?',
      {
        widget: 'methodRecommendationOptions',
        delay: 500,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, recommendationQuestion],
      currentStep: 'methodRecommendation',
    }));
    
    // Track bot recommendation question
    await this.api.createConversation({
      message_text: recommendationQuestion.message,
      message_type: 'bot',
      chat_step: "methodRecommendation",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "methodRecommendationOptions",
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save recommendation question:', err));
  };

  // Handler for method recommendation inquiry
  handleMethodRecommendationInquiry = async (
    response: string,
  ): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: response,
      type: 'user',
      id: uuidv4(),
    };

    // Track user recommendation response
    await this.api.createConversation({
      message_text: response,
      message_type: 'user',
      chat_step: "methodRecommendation",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "methodRecommendationOptions"
    }).catch(err => console.error('Failed to save recommendation response:', err));

    // Persist recommendation inquiry response
    await this.api.createResponse({
      response_category: 'MethodRecommendationInquiry',
      response_type: 'user',
      question_asked: 'Kina son sanin wasu hanyoyin?',
      user_response: response,
      widget_used: 'methodRecommendationOptions',
      available_options: ["Ee', 'A'a"],
      step_in_flow: 'methodRecommendation',
    }).catch(err => console.error('Failed to save response data:', err));

    if (response === 'Ee') {
      const introMessage = this.createChatBotMessage(
        'To bari in yi maki wasu tambayoyi don fahimtar irin hanyar da za ta fi dacewa da ke',
        { delay: 500 },
      );

      const kidsQuestion = this.createChatBotMessage(
        "Za ki so ki samu wasu yaran a nan gaba ko a'a?",
        {
          widget: 'kidsInFutureOptions',
          delay: 1000,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, introMessage, kidsQuestion],
        currentStep: 'kidsInFuture',
      }));
      
      // Track bot messages for Yes path
      await this.api.createConversation({
        message_text: introMessage.message,
        message_type: 'bot',
        chat_step: "methodRecommendationIntro",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save intro:', err));
      
      await this.api.createConversation({
        message_text: kidsQuestion.message,
        message_type: 'bot',
        chat_step: "kidsInFuture",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "kidsInFutureOptions",
        message_delay_ms: 1000
      }).catch(err => console.error('Failed to save kids question:', err));
    } else {
      const nextActions = this.createChatBotMessage(
        'Me kike son yi nan gaba?',
        {
          widget: 'fpmNextActionOptions',
          delay: 500,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, nextActions],
        currentStep: 'fpmNextAction',
      }));
      
      // Track bot message for No path
      await this.api.createConversation({
        message_text: nextActions.message,
        message_type: 'bot',
        chat_step: "fpmNextAction",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "fpmNextActionOptions",
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save next actions:', err));
    }
  };

  // Handler for kids in future
  handleKidsInFuture = async (response: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: response,
      type: 'user',
      id: uuidv4(),
    };

    // Track user kids response
    await this.api.createConversation({
      message_text: response,
      message_type: 'user',
      chat_step: "kidsInFuture",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "kidsInFutureOptions"
    }).catch(err => console.error('Failed to save kids response:', err));

    this.kidsInFuture = response;

    // Persist data to database
    await this.api.createFpmInteraction({
      kids_in_future: response,
      fpm_flow_type: 'family_planning_timeline',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    await this.api.createResponse({
      response_category: 'KidsInFuture',
      response_type: 'user',
      question_asked: 'Za ki so ki samu wasu yaran nan gaba?',
      user_response: response,
      widget_used: 'kidsInFutureOptions',
      step_in_flow: 'kidsInFuture',
    }).catch(err => console.error('Failed to save response data:', err));

    if (response === 'Ee, Ina so in samu yara fiye da haka.') {
      const timingQuestion = this.createChatBotMessage(
        'Shekaru nawa kike son jira kafin ki kuma haihuwa?\nMenu',
        {
          widget: 'timingOptions',
          delay: 500,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, timingQuestion],
        currentStep: 'timing',
      }));
      
      // Track bot timing question
      await this.api.createConversation({
        message_text: timingQuestion.message,
        message_type: 'bot',
        chat_step: "timing",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "timingOptions",
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save timing question:', err));
    } else {
      this.proceedToImportantFactors(userMessage);
    }
  };

  // Handler for timing selection
  handleTimingSelection = async (timing: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: timing,
      type: 'user',
      id: uuidv4(),
    };

    // Track user timing selection
    await this.api.createConversation({
      message_text: timing,
      message_type: 'user',
      chat_step: "timing",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "timingOptions"
    }).catch(err => console.error('Failed to save timing:', err));

    this.timing = timing;

    // Comprehensive database persistence
    await this.api.createFpmInteraction({
      timing_preference: timing,
      kids_in_future: this.kidsInFuture,
      fpm_flow_type: 'timing_selection',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    await this.api.createResponse({
      response_category: 'TimingPreference',
      response_type: 'user',
      question_asked:
        'Shekaru nawa kike son jira kafin ki kuma haihuwa?',
      user_response: timing,
      widget_used: 'timingOptions',
      step_in_flow: 'timing',
    }).catch(err => console.error('Failed to save response data:', err));

    this.proceedToImportantFactors(userMessage);
  };

  // Helper method to proceed to important factors
  private proceedToImportantFactors = async (userMessage: ChatMessage): Promise<void> => {
    const thanksMessage = this.createChatBotMessage(
      'Madalla, Nagode da bayanen ki',
      { delay: 500 },
    );

    const factorsQuestion = this.createChatBotMessage(
      'Lokacin da kuke zabar hanyoyin hana haihuwa, wadanne abubuwa ne suke da mahimmanci a gare ku?\nZabi hanya daya',
      {
        widget: 'importantFactorsOptions',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, thanksMessage, factorsQuestion],
      currentStep: 'importantFactors',
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: thanksMessage.message,
      message_type: 'bot',
      chat_step: "importantFactorsIntro",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save thanks message:', err));
    
    await this.api.createConversation({
      message_text: factorsQuestion.message,
      message_type: 'bot',
      chat_step: "importantFactors",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "importantFactorsOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save factors question:', err));
  };

  // Handler for important factors
  handleImportantFactors = async (factor: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: factor,
      type: 'user',
      id: uuidv4(),
    };

    // Track user factor selection
    await this.api.createConversation({
      message_text: factor,
      message_type: 'user',
      chat_step: "importantFactors",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "importantFactorsOptions"
    }).catch(err => console.error('Failed to save factor:', err));

    // Persist comprehensive interaction data
    await this.api.createFpmInteraction({
      important_factors: [factor],
      fpm_flow_type: 'important_factors_selection',
      kids_in_future: this.kidsInFuture,
      timing_preference: this.timing,
      satisfaction_level: this.satisfaction,
      switch_reason: this.switchReason,
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    await this.api.createResponse({
      response_category: 'ImportantFactors',
      response_type: 'user',
      question_asked:
        'Wace hanya ce tafi muhimmanci a gareku lokacin zabar hanyar hana haihuwa?',
      user_response: factor,
      widget_used: 'importantFactorsOptions',
      step_in_flow: 'importantFactors',
    }).catch(err => console.error('Failed to save response data:', err));

    const response = this.getFactorBasedRecommendation(factor);

    let responseMessage: ChatMessage;
    let nextStep = 'fpmNextAction';

    if (factor === 'Baya da illa ga haila🩸') {
      responseMessage = this.createChatBotMessage(
        'Wace hanya ce tafi muhimmanci a gareku lokacin zabar hanyar hana haihuwa?',
        {
          widget: 'menstrualFlowOptions',
          delay: 500,
        },
      );
      nextStep = 'menstrualFlow';
      
      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage],
        currentStep: nextStep as ChatbotState['currentStep'],
      }));
      
      // Track menstrual flow question
      await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: "menstrualFlow",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "menstrualFlowOptions",
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save menstrual question:', err));
    } else {
      responseMessage = this.createChatBotMessage(response, { delay: 500 });

      const nextActions = this.createChatBotMessage(
        'Me kike son yi nan gaba?',
        {
          widget: 'fpmNextActionOptions',
          delay: 1000,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, responseMessage, nextActions],
        currentStep: 'fpmNextAction',
      }));

      // Track bot messages for other factors
      await this.api.createConversation({
        message_text: responseMessage.message,
        message_type: 'bot',
        chat_step: "factorRecommendation",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save recommendation:', err));
      
      await this.api.createConversation({
        message_text: nextActions.message,
        message_type: 'bot',
        chat_step: "fpmNextAction",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "fpmNextActionOptions",
        message_delay_ms: 1000
      }).catch(err => console.error('Failed to save next actions:', err));

      return;
    }

    // Save FPM interaction for important factors
    try {
      await this.api.createFpmInteraction({ important_factors: [factor] });
    } catch (err) {
      console.error('Failed to save FPM interaction:', err);
    }
  };

  // Helper for factor-based recommendation
  private getFactorBasedRecommendation(factor: string): string {
    const recommendations: Record<string, string> = {
      'Inganci wajen hana ɗaukar ciki':
        "Ingantattun hanyoyin suna haɗe da inflant ta hanu da IUDs.\nSauran hanyoyin da za a yi la'akari da su suna haɗa da allurai, kwayoyi na kowace rana, da diaphragm",
      'Mafi aminci wajen amfani':
        'Kwarai kuwa\n\nDuk hanyoyin da muke ba da shawarar an zaɓe su don kiyaye ki da lafiyar ki',
      'Mafi sauki da kwanciyar hankali':
        'Daga cikin duk hanyoyin da suke da sauƙin amfani, hanya mafi inganci ita ce Inflant.\n\nSauran hanyoyin sauƙi da za a iya amfani da su sun haɗa da allurai da kwayoyi.\n\nHanya mafi ƙarancin inganci (amma har yanzu tana da kashi 99%) da za ku iya amfani da ita ita ce amfani da kwaroron roba (condom).',
      'Mafi sauki wurin amfani':
        'Daga cikin duk hanyoyin da suke da sauƙin amfani, hanya mafi inganci ita ce Inflant.\n\nSauran hanyoyin sauƙi da za a iya amfani da su sun haɗa da allurai da kwayoyi.\n\nHanya mafi ƙarancin inganci (amma har yanzu tana da kashi 99%) da za ku iya amfani da ita ita ce amfani da kwaroron roba (condom).',
      'Mai ɗorewa na dogon lokaci':
        'Idan kina son hanyar hana haiwuha mai ɗorewa na dogon lokaci, mafi inganci sune Impfant wanda yake ɗaukar shekara 3–5, ko Na’urar IUD wadda take iya ɗaukar shekara 5–10. Wadannan hanyoyi ba sa buƙatar kulawa sosai bayan an saka su',
      'Mafi sirri acikin su dukka':
        "Idan kina neman hanya mafi sirri, ita ce Imflant ita ce hanya mafi inganci.Sauran hanyoyi da suke da srri da inganci sun haɗa da Allurai da Diaphragm.",
      Discreet:
        "Idan kina neman hanya mafi sirri, ita ce Imflant ita ce hanya mafi inganci.Sauran hanyoyi da suke da sirri da inganci sun haɗa da Allurai da Diaphragm.",
      'Ba ciwo/laulayi/amai':
        ' Hanyoyin da ba su da zafi su ne kwaroron roba da diaprams amma ba su da tasiri kamar allura, dasa da kuma IUDs. Tare da alluran alluran da sanyawa, yawancin mutane ba sa fuskantar illa amma wasu mutane suna samun ciwon kai mai sauƙi. Tare da IUD yawancin mutane ba sa samun wani rashin jin daɗi bayan an saka su amma wasu mutane suna ba da rahoton ciwon ciki mai sauƙi.',
      'Ba ƙaran kiba':
        "ko, idan ba kwa son ƙara kiba, hanya mafi inganci ita ce IUD. Wasu haya mafi inganci sune amfani da Diaphragm, kuma mafi karancin tasiri sune, zaku iya amfani da condom , ku kauracewa jima'i lokacin da da ta fi kyankyasan kwai da kuma inzili(fitar da zakari yayin kawi maniyyi)",
      "Ba illa ga rayuwar jima'i (sex life)":
        "Amfanin hanyoyin hana haihuwa a rayuwar jima'i na iya bambanta dangane da abubuwan da mutum ya samu da kuma abubuwan da ake so.\n\nWasu hanyoyin, kamar maganin hana haihuwa na hormonal (kamar maganin hana haihuwa, faci, ko IUDs), na iya samun illa kamar canje-canje a cikin libido, canjin yanayi, ko bushewa.\n\nDuk da haka, waɗannan tasirin ba na duniya ba ne, kuma mutane da yawa suna amfani da maganin hana haihuwa ba tare da samun mummunan tasiri akan rayuwarsu ta jima'i ba.\n\nSauran hanyoyin da ba na hormonal ba kamar kwaroron roba ko jan ƙarfe IUD yawanci ba sa shafar sha'awa (libido).\nA ƙarshe, yana da mahimmanci a tattauna duk wata damuwa ko illa mai lahani tare da mai ba da lafiya don nemo mafi kyawun zaɓi wanda ya dace da bukatunku da salon rayuwa.",
      'No hormones':
        'Idan kina son hanyar da ba ta ƙunsa sinadarin hormone ba, Na’urar Copper IUD ita ce hanya mafi inganci. Kwandom da Diaphragm suma ba su ƙunshi hormone ba, amma suna buƙatar a riƙa amfani da su akai-akai.',
      'A ci gaba da iya haihuwa bayan daina amfani da hanya':
        "To, na gane.\n\nHanyoyin da suka fi dacewa don dawowa da sauri zuwa haihuwa sune Imflants da IUD.\n\nSauran ingantattun hanyoyin sune Kwayoyin Kwayoyin Kuɗi da Diaphragm kuma mafi ƙarancin ingantattun hanyoyin da zaku iya amfani da su sune kwaroron roba, kauracewa jima'i a ranakun haihuwa, da kuma hanyar cirewa.",
      'A daina ba tare da zuwa asibiti ba':
        ' To, na gane.\n\nWasu daga cikin hanyoyi (methods) masu inganci da za a iya daina amfani da su cikin sauƙi ba tare da zuwa asibiti ba sun haɗa da Allurai, Kwayoyi, da Diaphragm.\n\nSauran hanyoyi masu ƙarancin inganci waɗanda ake iya daina amfani da su cikin sauƙi sun haɗa da Kwandom), Guje wa jima’i a ranakun yiwuwar daukan ciki (fertile days), da Hanyar cire azzakari kafin inzali (withdrawal method).',
      'Ana iya dainawa a ko wani lokaci':
        '"Idan kina son biyan bukata nan take, Kwandom da Kwayoyi na kullum za a iya daina amfani da su a kowane lokaci. Diaphragm ma tana ba da irin wannan sassaucin. Amma ga hanyoyi na dogon lokaci, Allurai suna daina aiki da kansu bayan watanni uku (3 months)."',
      Affordable:
        "Don hanyoyi masu araha, Kwandom da Kwayoyi na kullum su ne mafi araha gaba ɗaya. Allurai a na iya zama masu sauƙin biya gwargwadon irin inshorar lafiyarki. Kira 7790 don samun bayani kan farashin da ake amfani da shi a yankinku.",
      'Kariya daga cututtukan jima’i':
        "Kwandom ita ce kaɗai hanyar hana daukan ciki da ke kuma ba da kariya daga cututtukan da ake ɗauka ta hanyar jima’i (STIs). Don samun kariya biyu, za ki iya amfani da Kwandom tare da wata hanyar.",
    };

    return (
      recommendations[factor] ||
      `Na gode da bayyana ra’ayinki. Dangane da buƙatarki da suka shafi ${factor.toLowerCase()}, ina ba da shawarar ki tuntuɓi mai ba da kulawar lafiya ta kiran 7790 don samun shawara ta musamman gare ki.`
    );
  }

  // Handler for menstrual flow preference
  handleMenstrualFlowPreference = async (preference: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: preference,
      type: 'user',
      id: uuidv4(),
    };

    // Track user preference
    await this.api.createConversation({
      message_text: preference,
      message_type: 'user',
      chat_step: "menstrualFlow",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "menstrualFlowOptions"
    }).catch(err => console.error('Failed to save menstrual preference:', err));

    const response = this.getMenstrualFlowResponse(preference);
    const responseMessage = this.createChatBotMessage(response, { delay: 500 });
    await this.api.createFpmInteraction({
      menstrual_flow_preference: preference,
    }).catch(err => console.error('Failed to save FPM interaction:', err));
    
    const nextActions = this.createChatBotMessage(
      'Me kike son ki yi gaba',
      {
        widget: 'fpmNextActionOptions',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, nextActions],
      currentStep: 'fpmNextAction',
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "menstrualFlowRecommendation",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save recommendation:', err));
    
    await this.api.createConversation({
      message_text: nextActions.message,
      message_type: 'bot',
      chat_step: "fpmNextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmNextActionOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save next actions:', err));
  };

  // Helper for menstrual flow response
  private getMenstrualFlowResponse(preference: string): string {
    const responses: Record<string, string> = {
      'Ba ya ƙara yawan zubar jini🩸':
        'Idan kina so ki guje wa karuwar hawan haila, hanyoyin da suka fi dacewa shine dasa alurar hanu (imflants).\n\nSauran hanyoyin da za a bi sun haɗa da allura  da ƙwayoyin sha',
      'Ba ya rage yawan zubar jini🩸':
        'Idan kana son kauce wa raguwa/tashewar jinin haila, Hanyoyi mafi inganci shine IUD.\n\nWasu hanyoyi da za a iya amfani da su sun hada da shan kwayoyi',
      'Ba ya canza yawan jinin al’ada':
        "Idan kina son hanyar da ba ta canza yawan jinin al’ada, za ki iya amfani da Na’urar Copper IUD ko Kwandom. Waɗannan hanyoyi yawanci ba sa shafar jinin al’ada. Da fatan za ki tuntuɓi mai ba da kulawar lafiya don samun shawara ta musamman.",
      'Ƙaranci ko daukewar jinin al’ada':
        "Idan kina son samun ƙarancin jinin al’ada ko ma rashin al’ada gaba ɗaya, Na’urar Hormonal IUD, Imflants, ko Allurai na iya zama hanyoyi mafi dacewa gare ki. Waɗannan hanyoyi suna iya rage zubar jinin al’ada ko ma su hana al’ada gaba ɗaya ga wasu masu amfani. Da fatan za ki tuntuɓi mai ba da kulawar lafiya don ƙarin bayani.",
      'Regular periods':
        "Idan yin haila ko wani wata yana da muhimmanci a gare ku, kwayoyin hana daukar ciki (Daily pills) na iya taimakawa wajen daidaita zagayowar hailar ku. Don Allah tuntubi ma'aikacin kiwon lafiya don tattauna mafi kyawun zaɓi ga bukatun ku.",
    };

    return (
      responses[preference] ||
      'Na gode da bayyana ra’ayinki. Don ƙarin bayani game da yadda hanyoyi hana daukar ciki (contraceptive methods) daban-daban ke shafar jinin al’ada (menstrual flow), kira 7790 don yin magana da ƙwararren ma’aikacin lafiya.'
    );
  }

  // Handler for stop reason
  handleStopReason = async (reason: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: reason,
      type: 'user',
      id: uuidv4(),
    };

    // Track user stop reason
    await this.api.createConversation({
      message_text: reason,
      message_type: 'user',
      chat_step: "stopReason",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "stopReasonOptions"
    }).catch(err => console.error('Failed to save stop reason:', err));

    const counselingResponse = this.createChatBotMessage(
      'To, na fahimta, kuma banji dadin irin waɗannan matsalolin da kike fuskanta ba. \n\nDa fatan za ki kira 7790 don yin magana da jami’in lafiya mai ba da shawara (nurse counsellor) domin ya jagorance ki kuma ya ba ki shawara kan hanyoyi mafi dacewa gare ki.',
      { delay: 500 },
    );
    
    await this.api.createFpmInteraction({ stop_reason: reason }).catch(err => console.error('Failed to save FPM interaction:', err));
    
    const nextActions = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
      {
        widget: 'fpmNextActionOptions',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        counselingResponse,
        nextActions,
      ],
      currentStep: 'fpmNextAction',
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: counselingResponse.message,
      message_type: 'bot',
      chat_step: "counseling",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save counseling:', err));
    
    await this.api.createConversation({
      message_text: nextActions.message,
      message_type: 'bot',
      chat_step: "fpmNextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmNextActionOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save next actions:', err));
  };

  // Handler for side effect selection
  handleFPMSideEffectSelection = async (sideEffect: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: sideEffect,
      type: 'user',
      id: uuidv4(),
    };

    // Track user side effect selection
    await this.api.createConversation({
      message_text: sideEffect,
      message_type: 'user',
      chat_step: "sideEffect",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "sideEffectOptions"
    }).catch(err => console.error('Failed to save side effect:', err));

    const responseMessage = this.createChatBotMessage(
      'To, na fahimta, kuma banji dadi ba da irin waɗannan matsalolin da kike fuskanta.\nDa fatan za ki kira 7790 don yin magana da jami’in lafiya mai ba da shawara (nurse counselor) wanda zai jagorance ki kuma ya ba ki shawara kan abin da ya kamata ki yi',
      { delay: 500 },
    );

    await this.api.createFpmInteraction({}).catch(err => console.error('Failed to save FPM interaction:', err));
    
    const nextActions = this.createChatBotMessage(
      "Me kike son yi gaba?",
      {
        widget: 'fpmNextActionOptions',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, userMessage, responseMessage, nextActions],
      currentStep: 'fpmNextAction',
    }));
    
    // Track bot messages
    await this.api.createConversation({
      message_text: responseMessage.message,
      message_type: 'bot',
      chat_step: "sideEffectCounseling",
      message_sequence_number: this.getNextSequenceNumber(),
      message_delay_ms: 500
    }).catch(err => console.error('Failed to save counseling:', err));
    
    await this.api.createConversation({
      message_text: nextActions.message,
      message_type: 'bot',
      chat_step: "fpmNextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmNextActionOptions",
      message_delay_ms: 1000
    }).catch(err => console.error('Failed to save next actions:', err));
  };

  // Handler for final feedback
  handleFinalFeedback = async (feedback: string): Promise<void> => {
    await this.ensureChatSession();
    
    const userMessage: ChatMessage = {
      message: feedback,
      type: 'user',
      id: uuidv4(),
    };

    // Track user feedback
    await this.api.createConversation({
      message_text: feedback,
      message_type: 'user',
      chat_step: "feedback",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "feedbackOptions"
    }).catch(err => console.error('Failed to save feedback:', err));

    // Persist final feedback and complete session
    await this.api.createResponse({
      response_category: 'FinalFeedback',
      response_type: 'user',
      question_asked: 'Da fatan na amsa tambayarki?',
      user_response: feedback,
      widget_used: 'feedbackOptions',
      available_options: ['Ee', "A'a", 'Tsallake'],
      step_in_flow: 'feedback',
    }).catch(err => console.error('Failed to save response data:', err));

    // Mark interaction as complete
    await this.api.createFpmInteraction({
      fpm_flow_type: 'session_feedback_complete',
      provided_information: 'Session completed with user feedback',
      next_action: feedback === 'Ee' ? 'Angamsu' : 'Ana buƙatar ƙarin kulawa',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    if (feedback === 'Ee') {
      const thankYou = this.createChatBotMessage(
        "Na gode da jin ra’ayinki! Ina farin ciki cewa na taimaka miki yadda ya kamata. Ra’ayinki yana taimaka mana wajen inganta ayyukanmu. Idan kina buƙatar ƙarin bayani game da Tsarin Iyali (family planning) da hanyoyin hana ɗaukar ciki (contraception), za ki iya samuna a kowane lokaci (24/7)! Ina sa ran yin magana da ke nan gaba. 👍",
        { delay: 500 },
      );

      const callInfo = this.createChatBotMessage(
        "Idan kina son yin magana da jami’in lafiya don ƙarin tambayoyi da tattaunawa, da fatan za ki kira 7790. Idan kina son a haɗa ki da ƙwararren ma’aikacin lafiya a cikin wannan tattaunawa (chat), kawai rubuta kalmar 'human'.",
        { delay: 1000 },
      );

      const moreHelp = this.createChatBotMessage(
        'Shin zan iya taimaka miki da wani abu kuma?',
        {
          widget: 'moreHelpOptions',
          delay: 1500,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, thankYou, callInfo, moreHelp],
        currentStep: 'moreHelp',
      }));
      
      // Track positive feedback path
      await this.api.createConversation({
        message_text: thankYou.message,
        message_type: 'bot',
        chat_step: "thankYou",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save thank you:', err));
      
      await this.api.createConversation({
        message_text: callInfo.message,
        message_type: 'bot',
        chat_step: "callInfo",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000
      }).catch(err => console.error('Failed to save call info:', err));
      
      await this.api.createConversation({
        message_text: moreHelp.message,
        message_type: 'bot',
        chat_step: "moreHelp",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "moreHelpOptions",
        message_delay_ms: 1500
      }).catch(err => console.error('Failed to save more help:', err));
    } else if (feedback === "A'a") {
      const sorryMessage = this.createChatBotMessage(
        "Banji dadi ba cewa ban samu damar magance duk damuwarki ba. Don samun taimako na musamman, da fatan za ki kira 7790 don yin magana da ƙwararren ma’aikacin lafiya.",
        { delay: 500 },
      );

      const moreHelp = this.createChatBotMessage(
        'Shin zan iya taimaka miki da wani abu kuma?',
        {
          widget: 'moreHelpOptions',
          delay: 1000,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, sorryMessage, moreHelp],
        currentStep: 'moreHelp',
      }));
      
      // Track negative feedback path
      await this.api.createConversation({
        message_text: sorryMessage.message,
        message_type: 'bot',
        chat_step: "apology",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save apology:', err));
      
      await this.api.createConversation({
        message_text: moreHelp.message,
        message_type: 'bot',
        chat_step: "moreHelp",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "moreHelpOptions",
        message_delay_ms: 1000
      }).catch(err => console.error('Failed to save more help:', err));
    } else {
      const goodbye = this.createChatBotMessage(
        "Na gode da lokacinki. Ina sa ran yin magana da ke nan gaba. Idan kina buƙatar ƙarin bayani game da Tsarin Iyali (family planning) da hanyoyin hana ɗaukar ciki (contraception), za ki iya samuna a kowane lokaci (24/7)! 👍",
        { delay: 500 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, goodbye],
        currentStep: 'default',
      }));
      
      // Track skip/other feedback path
      await this.api.createConversation({
        message_text: goodbye.message,
        message_type: 'bot',
        chat_step: "goodbye",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save goodbye:', err));
    }
  };

  // Handler for FPM next action
  handleFPMNextAction = async (action: string): Promise<void> => {
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
      chat_step: "fpmNextAction",
      message_sequence_number: this.getNextSequenceNumber(),
      widget_name: "fpmNextActionOptions"
    }).catch(err => console.error('Failed to save next action:', err));

    // Persist user's next action choice
    await this.api.createResponse({
      response_category: 'FPMNextAction',
      response_type: 'user',
      question_asked: 'Me kike son yi gaba?',
      user_response: action,
      widget_used: 'fmpNextActionOptions',
      available_options: [
        'Ƙare wannan tattaunawar',
        'Yi wasu tambayoyin',
        'Yi magana da AI / Jami’in lafiya',
        'Nemo asibiti mafi kusa',
      ],
      step_in_flow: 'fmpNextAction',
    }).catch(err => console.error('Failed to save response data:', err));

    await this.api.createFpmInteraction({
      next_action: action,
      fpm_flow_type: 'next_action_selection',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    if (action === 'Ƙare wannan tattaunawar') {
      const feedbackRequest = this.createChatBotMessage(
        'Shin na amsa tambayarki?',
        {
          widget: 'feedbackOptions',
          delay: 500,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, feedbackRequest],
        currentStep: 'feedback',
      }));
      
      // Track end chat path
      await this.api.createConversation({
        message_text: feedbackRequest.message,
        message_type: 'bot',
        chat_step: "feedback",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "feedbackOptions",
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save feedback request:', err));
    } else if (action === 'Yi wasu tambayoyin') {
      const response = this.createChatBotMessage('Okay!', { delay: 500 });
      const questionPrompt = this.createChatBotMessage(
        'Da fatan za a lura cewa ni chatbot ne na Tsarin Iyali (family planning bot) kuma zan iya amsa tambayoyi ne kawai da suka shafi tsarin iyali. Menene tambayarki?',
        { delay: 1000 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, response, questionPrompt],
        currentStep: 'userQuestion',
      }));
      
      // Track ask more questions path
      await this.api.createConversation({
        message_text: response.message,
        message_type: 'bot',
        chat_step: "acknowledgment",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save acknowledgment:', err));
      
      await this.api.createConversation({
        message_text: questionPrompt.message,
        message_type: 'bot',
        chat_step: "userQuestion",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000
      }).catch(err => console.error('Failed to save question prompt:', err));
    } else if (action === 'Yi magana da AI / Jami’in lafiya') {
      const agentQuestion = this.createChatBotMessage(
        'Shin kina son a haɗa ki da ƙwararren ma’aikacin lafiya ko AI chatbot?',
        {
          widget: 'humanAIOptions',
          delay: 500,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, agentQuestion],
        currentStep: 'humanAISelection',
      }));
      
      // Track human/AI selection path
      await this.api.createConversation({
        message_text: agentQuestion.message,
        message_type: 'bot',
        chat_step: "humanAISelection",
        message_sequence_number: this.getNextSequenceNumber(),
        widget_name: "humanAIOptions",
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save agent question:', err));
    } else if (action === 'Nemo asibiti mafi kusa') {
      const clinicMessage = this.createChatBotMessage(
        'Zan iya taimaka miki wajen nemo asibitin mafi kusa dake, da fatan ki tabbatar da wurinki ko sunan garinku / yankinku.',
        { delay: 500 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, clinicMessage],
        currentStep: 'locationInput',
      }));
      
      // Track find clinic path
      await this.api.createConversation({
        message_text: clinicMessage.message,
        message_type: 'bot',
        chat_step: "locationInput",
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500
      }).catch(err => console.error('Failed to save clinic message:', err));
    }
  };
}

export default FPMChangeProvider;
export type { FPMChangeProviderInterface };
