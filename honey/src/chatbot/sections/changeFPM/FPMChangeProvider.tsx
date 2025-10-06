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
      'Ok, I can help you. What specific concern do you have with this method?\nPlease select a concern type',
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
      'I understand your concern. Let me provide you with some information.',
      { delay: 500 }
    );

    const concernQuestion = this.createChatBotMessage(
      'What would you like to know more about?',
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
    if (option === 'Concerned about FP') {
      userIntention = 'concerned';
    } else if (option === 'Want to switch FP') {
      userIntention = 'switch';
    } else if (option === 'Want to stop FP') {
      userIntention = 'stop';
    }

    console.log('🔧 Set userIntention in state to:', userIntention);

    if (userIntention === 'switch') {
      const responseMessage = this.createChatBotMessage(
        'Okay, I see.\n\nLet me ask you a few questions to better understand what kind of method would suit best for you.',
        { delay: 500 },
      );

      const methodQuestion = this.createChatBotMessage(
        'Which method are you currently using?\nMethod you use now',
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
        question_asked: 'What is your concern about family planning?',
        user_response: option,
        widget_used: 'fpmConcernOptions',
        available_options: [
          'Concerned about FP',
          'Want to switch FP',
          'Want to stop FP',
        ] as string[],
        step_in_flow: 'fpmConcernSelection',
      }).catch(err => console.error('Failed to save response data:', err));
    } else {
      // For concerned and stop - ask which method they're using
      const responseMessage = this.createChatBotMessage(
        'Ok, I can help you. Which method are you currently using?\noptions(choose)',
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
      'How has the method been working for you? Would you say you are somewhat satisfied, or not at all satisfied with your method?',
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
      question_asked: 'Which method are you currently using?',
      user_response: method,
      widget_used: 'switchFPMOptions',
      available_options: [
        'Pills',
        'IUD',
        'Implant',
        'Injectables',
        'Condoms',
        'Other',
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
      'Okay, thanks for sharing!\nCan you tell me why do you want to stop using this method?\n\nFP = Family planning method\nOptions(Choose one)',
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
        'Can you tell me why do you want to stop using this method?',
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
      'I am sorry to hear that you are dissatisfied with the current family planning method.\n Could you tell me a little more about the situation? What is your concern? \n\n FP = Family Planning method (contraceptive)',
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
        'How has the method been working for you? Would you say you are somewhat satisfied, or not at all satisfied with your method?',
      user_response: option,
      widget_used: 'satisfactionOptions',
      available_options: ['Somewhat satisfied', 'Not at all satisfied'],
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
      question_asked: 'How has the method been working for you?',
      user_response: satisfaction,
      widget_used: 'satisfactionOptions',
      available_options: ['Somewhat satisfied', 'Not at all satisfied'],
      step_in_flow: 'satisfactionAssessment',
    }).catch(err => console.error('Failed to save response data:', err));

    const reasonQuestion = this.createChatBotMessage(
      'May I know why do you want to switch?\nPick a reason why',
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
      question_asked: 'Why do you want to switch methods?',
      user_response: reason,
      widget_used: 'switchReasonOptions',
      step_in_flow: 'switchReason',
    }).catch(err => console.error('Failed to save response data:', err));
    const recommendationQuestion = this.createChatBotMessage(
      'Would you like to know about other methods that you may like better?',
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
      question_asked: 'Would you like to know about other methods?',
      user_response: response,
      widget_used: 'methodRecommendationOptions',
      available_options: ['Yes', 'No'],
      step_in_flow: 'methodRecommendation',
    }).catch(err => console.error('Failed to save response data:', err));

    if (response === 'Yes') {
      const introMessage = this.createChatBotMessage(
        'OK. Let me ask you a few questions to better understand what kind of method would be good for you.',
        { delay: 500 },
      );

      const kidsQuestion = this.createChatBotMessage(
        'Would you like to have kids in the future or not?',
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
        'What would you like to do next?',
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
      question_asked: 'Do you want to have children in the future?',
      user_response: response,
      widget_used: 'kidsInFutureOptions',
      step_in_flow: 'kidsInFuture',
    }).catch(err => console.error('Failed to save response data:', err));

    if (response === 'Yes, I want more kids') {
      const timingQuestion = this.createChatBotMessage(
        'How many years would you like to wait from now before you have another child?\nMenu',
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
        'How many years would you like to wait before having another child?',
      user_response: timing,
      widget_used: 'timingOptions',
      step_in_flow: 'timing',
    }).catch(err => console.error('Failed to save response data:', err));

    this.proceedToImportantFactors(userMessage);
  };

  // Helper method to proceed to important factors
  private proceedToImportantFactors = async (userMessage: ChatMessage): Promise<void> => {
    const thanksMessage = this.createChatBotMessage(
      'Okay, thank you for sharing this!',
      { delay: 500 },
    );

    const factorsQuestion = this.createChatBotMessage(
      'When you are picking a contraceptive method, which factor is the most important to you?\nPick one factor',
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
        'Which factor is the most important to you when picking a contraceptive method?',
      user_response: factor,
      widget_used: 'importantFactorsOptions',
      step_in_flow: 'importantFactors',
    }).catch(err => console.error('Failed to save response data:', err));

    const response = this.getFactorBasedRecommendation(factor);

    let responseMessage: ChatMessage;
    let nextStep = 'fpmNextAction';

    if (factor === 'No effect on menstrual🩸') {
      responseMessage = this.createChatBotMessage(
        'When you are picking a contraceptive method, what are the things that are important to you?',
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
        'What would you like to do next?',
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
      'Efficiency in prevention':
        'The most effective methods are implants and IUDs.\nOther effective methods to consider are injectables, daily pills, and diaphragms.',
      'Should be safe to use':
        'Absolutely.\n\nAll methods we recommend are chosen to keep you safe and healthy.',
      'Be easy and convenient':
        'Of all methods that are easy to use, the most effective method is the Implants.\n\nOther simple methods to adopt are the Injectables and the Pills.\n\nThe least effective (but still 99%) method you can use is Condoms.',
      'Easy to use':
        'Of all methods that are easy to use, the most effective method is the Implants.\n\nOther simple methods to adopt are the Injectables and the Pills.\n\nThe least effective (but still 99%) method you can use is Condoms.',
      'Long lasting':
        'If you want a long-lasting contraceptive method, the most effective options are Implants (3-5 years) or IUDs (5-10 years). These require minimal maintenance once inserted.',
      'Discreet from others':
        "If you're looking for a discreet method, the Implant is the most effective option. Other effective hidden methods includes Injectables and Diaphragm.",
      Discreet:
        "If you're looking for a discreet method, the Implant is the most effective option. Other effective hidden methods includes Injectables and Diaphragm.",
      'No pain/cramp/vomit':
        'The methods that are completely painless are the condoms and diaphrams but they are not as effective as the injectibles, implants and the IUDs. With the injectibles and implants, most people do not experience side effects but some people experience mild headaches. With the IUDs most people do not experience any discomfort after insertion but some people report mild abdominal pain.',
      'No weight gain':
        'Ok, if you do not want to gain weight, the most effective method to adopt is the IUD.\n\nOther method to adopt is the Diaphragm and the least effective methods you can use are the condoms, abstinence from sex on fertile days, and the withdrawal method.',
      'No effect on sex life':
        "The effects of contraceptive methods on sex life can vary depending on individual experiences and preferences.\n\nSome methods, like hormonal contraceptives (such as birth control pills, patches, or IUDs), may have side effects like changes in libido, mood swings, or dryness.\n\nHowever, these effects are not universal, and many individuals use contraceptives without experiencing negative impacts on their sex lives.\n\nOther non-hormonal methods like condoms or copper IUDs typically don't affect libido.\nUltimately, it's essential to discuss any concerns or potential side effects with a healthcare provider to find the best option that suits your needs and lifestyle.",
      'No hormones':
        'If you prefer a non-hormonal method, the Copper IUD is the most effective option. Condoms and diaphragms are also hormone-free but require consistent use.',
      'Be able have kids after':
        'Okay, I see.\n\nThe most effective methods for quick return to fertility are Implants and IUD.\n\nOther effective methods are Daily Pills and Diaphragm and the least effective methods you can use are the condoms, abstinence from sex on fertile days, and the withdrawal method.',
      'Stop without clinic':
        'Okay, I see.\n\nSome of the effective methods you can stop easily without going to the clinic are the injectables, the piils and the diaphragm.\n\nOther least effective methods that can easily stop using are the condoms, abstinence from sex on fertile days, and the withdrawal method.',
      'Can stop anytime':
        'If you want immediate control, condoms and daily pills can be stopped anytime. Diaphragms also offer this flexibility. For longer-term methods, injectables wear off naturally in 3 months.',
      Affordable:
        'For cost-effective options, condoms and daily pills are generally the most affordable. Injectables may also be budget-friendly depending on your healthcare coverage. Call 7790 for local pricing information.',
      'Protects against STIs':
        'Condoms are the only contraceptive method that also protects against sexually transmitted infections (STIs). For dual protection, you might consider using condoms along with another highly effective method.',
    };

    return (
      recommendations[factor] ||
      `Thank you for sharing your preference. For your specific needs regarding ${factor.toLowerCase()}, I recommend speaking with a healthcare provider at 7790 for personalized guidance.`
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
      'What would you like to do next?',
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
      'No INcrease of🩸flow':
        'If you want to avoid increasing menstrual flow, the most effective methods are Implants.\n\nOther methods to adopt includes the Injectables and Pills.',
      'No DEcrease of🩸flow':
        'If you want to avoid decrease/stop of menstrual flow, The most effective methods is IUD.\n\nOther method to adopt is the pills.',
      'No change in menstrual flow':
        'If you prefer a method that does not change your menstrual flow, you may consider the Copper IUD or condoms. These methods typically do not affect your periods. Please consult a healthcare provider for more personalized advice.',
      'Lighter or no periods':
        'If you would like lighter or no periods, hormonal IUDs, implants, or injections may be suitable options. These methods can reduce menstrual bleeding or even stop periods for some users. Please consult a healthcare provider for more information.',
      'Regular periods':
        'If having regular periods is important to you, daily pills may help regulate your cycle. Please consult a healthcare provider to discuss the best option for your needs.',
    };

    return (
      responses[preference] ||
      'Thank you for sharing your preference. For more information on how different contraceptive methods affect menstrual flow, please call 7790 to speak with a healthcare professional.'
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
      'Okay, I understand and I am sorry you are experiencing these issues.\n\nPlease call 7790 and request to speak to a nurse counsellor to direct and counsel you on better options for you.',
      { delay: 500 },
    );
    
    await this.api.createFpmInteraction({ stop_reason: reason }).catch(err => console.error('Failed to save FPM interaction:', err));
    
    const nextActions = this.createChatBotMessage(
      'What would you like to do next?',
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
      'Okay, I understand and I am sorry you are experiencing these issues.\nPlease call 7790 and ask to speak to a nurse counselor who will direct and counsel you on what to do.',
      { delay: 500 },
    );

    await this.api.createFpmInteraction({}).catch(err => console.error('Failed to save FPM interaction:', err));
    
    const nextActions = this.createChatBotMessage(
      'What would you like to do next?',
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
      question_asked: 'Did I answer your question?',
      user_response: feedback,
      widget_used: 'feedbackOptions',
      available_options: ['Yes', 'No', 'Skip'],
      step_in_flow: 'feedback',
    }).catch(err => console.error('Failed to save response data:', err));

    // Mark interaction as complete
    await this.api.createFpmInteraction({
      fpm_flow_type: 'session_feedback_complete',
      provided_information: 'Session completed with user feedback',
      next_action: feedback === 'Yes' ? 'satisfied' : 'needs_follow_up',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    if (feedback === 'Yes') {
      const thankYou = this.createChatBotMessage(
        "Thank you for your feedback! I am happy that I was of great service to you. Your input helps us improve our service. If you need any additional information on family planning and contraception, I'm available 24/7!. I look forward to chatting with you again soon. 👍",
        { delay: 500 },
      );

      const callInfo = this.createChatBotMessage(
        'If you want to speak to an agent for further enquiries and discussion, please call 7790.\n\nIf you want to be connected to a medical professional agent here in chat, just type the word "human".',
        { delay: 1000 },
      );

      const moreHelp = this.createChatBotMessage(
        'Can I help you with anything else?',
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
    } else if (feedback === 'No') {
      const sorryMessage = this.createChatBotMessage(
        "I'm sorry I couldn't fully address your concerns. For more personalized assistance, please call 7790 to speak with a healthcare professional.",
        { delay: 500 },
      );

      const moreHelp = this.createChatBotMessage(
        'Can I help you with anything else?',
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
        "Thanks for your time. I look forward to chatting with you again soon. If you need any additional information on family planning and contraception, I'm available 24/7! 👍",
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
      question_asked: 'What would you like to do next?',
      user_response: action,
      widget_used: 'fmpNextActionOptions',
      available_options: [
        'End this chat',
        'Ask more questions',
        'Talk to AI / Human',
        'Find nearest clinic',
      ],
      step_in_flow: 'fmpNextAction',
    }).catch(err => console.error('Failed to save response data:', err));

    await this.api.createFpmInteraction({
      next_action: action,
      fpm_flow_type: 'next_action_selection',
    }).catch(err => console.error('Failed to save FPM interaction:', err));

    if (action === 'End this chat') {
      const feedbackRequest = this.createChatBotMessage(
        'Did I answer your question?',
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
    } else if (action === 'Ask more questions') {
      const response = this.createChatBotMessage('Okay!', { delay: 500 });
      const questionPrompt = this.createChatBotMessage(
        'Please note that I am a family planning bot and can only respond to questions relating to family planning. What is your question?',
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
    } else if (action === 'Talk to AI / Human') {
      const agentQuestion = this.createChatBotMessage(
        'Do you want to be connected to a human medical professional agent or AI chatbot?',
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
    } else if (action === 'Find nearest clinic') {
      const clinicMessage = this.createChatBotMessage(
        'I can help you find the nearest clinic, please confirm your location or your city/area name.',
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
