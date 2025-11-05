// src/chatbot/sections/getPregnant/getPregnantActionProvider.tsx
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatbotState, ChatStep } from '../../types';
import { ApiService } from '@/services/api';

// Define the types for our get pregnant provider
type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>,
) => ChatMessage;
type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

export interface GetPregnantActionProviderInterface {
  handleGetPregnantInitiation: () => void;
  handleGetPregnantFPMSelection: (selection: string) => void;
  handleGetPregnantTryingDuration: (duration: string) => void;
  handleGetPregnantIUDRemoval: (status: string) => void;
  handleGetPregnantImplantRemoval: (status: string) => void;
  handleGetPregnantInjectionStop: (status: string) => void;
  handleGetPregnantPillsStop: (status: string) => void;
  handleGetPregnantNextAction: (action: string) => void;
  handleGetPregnantUserQuestion: (question: string) => void;
  handleLocationInput: (location: string) => void;
}

class GetPregnantActionProvider implements GetPregnantActionProviderInterface {
  createChatBotMessage: CreateChatBotMessage;
  setState: SetStateFunc;
  state: ChatbotState;
  api: ApiService;
  private userSessionId: string;

  // Store user's current selection context
  private currentFPMMethod: string = '';
  private tryingDuration: string = '';
  private messageSequenceNumber: number = 1; // Track message sequence across conversation

  constructor(
    createChatBotMessage: CreateChatBotMessage,
    setStateFunc: SetStateFunc,
    state: ChatbotState,
    apiClient: ApiService,
    userSessionId?: string,
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

    // Enhanced constructor with server-side persistence (similar to prevent pregnancy flow)
    this.setState = (
      newState: ChatbotState | ((prev: ChatbotState) => ChatbotState),
    ) => {
      // Ensure state has messages array initialized
      const safeState = {
        ...this.state,
        messages: this.state.messages || [],
      };

      const updatedState =
        typeof newState === 'function' ? newState(safeState) : newState;

      // Ensure updated state also has messages array
      const finalState = {
        ...updatedState,
        messages: updatedState.messages || [],
      };

      // Primary: Save to server for cross-device sync
      this.saveStateToServer(finalState).catch((error) => {
        console.warn(
          'Failed to save get pregnant state to server, using localStorage fallback:',
          error,
        );
      });

      // Secondary: Always save to localStorage as backup
      localStorage.setItem('chat_state', JSON.stringify(finalState));

      // Update component state
      setStateFunc(finalState);
      this.state = finalState;
    };
  }

  // Save complete chat state to server for WhatsApp-style cross-device sync
  private async saveStateToServer(state: ChatbotState): Promise<void> {
    try {
      await this.ensureChatSession();

      await this.api.saveUserSession({
        user_session_id: this.api['sessionId'] || 'anonymous',
        chat_state: JSON.stringify(state),
        last_activity: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save get pregnant chat state to server:', error);
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
        console.warn('No user session ID available for get pregnant flow');
        return;
      }

      await this.api.initializeChatSession();
    } catch (error) {
      console.error('Failed to initialize get pregnant session:', error);
    }
  }

  // Initiate the get pregnant flow
  handleGetPregnantInitiation = async (): Promise<void> => {
    // Reset sequence number for new conversation
    this.resetSequenceNumber();

    const userMessage = this.createUserMessage('How to get pregnant');

    // Ensure session is initialized
    await this.ensureChatSession();

    // Use the original messages from getPregnantConfig
    const introMessage = this.createChatBotMessage(
      'This is great! I am happy to give you advice on family planning.',
      { delay: 500 },
    );

    const questionMessage = this.createChatBotMessage(
      'Are you currently using a family planning method (FPM) or did you recently use one?\n\nPlease select from the options your current or recently used method. Scroll to see all options',
      {
        widget: 'getPregnantFPMSelection',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: userMessage
        ? [...prev.messages, userMessage, introMessage, questionMessage]
        : [...prev.messages, introMessage, questionMessage],
      currentStep: 'getPregnantFPMSelection',
    }));

    // Update User table with get pregnant intent
    await this.api
      .updateUser({
        current_step: 'getPregnantFPMSelection',
        user_intention: 'get_pregnant',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save user message conversation
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: userMessage.message,
        chat_step: 'getPregnantInitiation',
        widget_name: 'getPregnantInitiation',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    // Save bot intro message
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text:
          'This is great! I am happy to give you advice on family planning.',
        chat_step: 'getPregnantFPMSelection',
        widget_name: 'getPregnantFPMSelection',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    // Save bot question message
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text:
          'Are you currently using a family planning method (FPM) or did you recently use one?\n\nPlease select from the options your current or recently used method. Scroll to see all options',
        chat_step: 'getPregnantFPMSelection',
        widget_name: 'getPregnantFPMSelection',
        widget_options: [
          'No FPM now or recently',
          'IUD',
          'Implants',
          'Injections /Depo-provera / Sayana Press',
          'Sayana Press',
          'Daily Pills',
          'Condoms',
          'Emergency pills',
          'Female sterilisation',
          'Male sterilisation',
        ],
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));
  };

  // Handle FPM selection for get pregnant flow
  handleGetPregnantFPMSelection = async (selection: string): Promise<void> => {
    const userMessage = this.createUserMessage(selection);

    // Store the current method
    this.currentFPMMethod = selection;
    console.log('FPM Method stored:', this.currentFPMMethod); // debug log

    // Get specific response based on the method
    const response = this.getFPMSpecificResponse(selection);
    const responseMessage = this.createChatBotMessage(response.message, {
      delay: 500,
    });

    let followUpMessage = null;
    if (response.followUpWidget && response.followUpQuestion) {
      followUpMessage = this.createChatBotMessage(response.followUpQuestion, {
        widget: response.followUpWidget,
        delay: 1000,
      });
    }

    const messages = [userMessage, responseMessage];
    if (followUpMessage) messages.push(followUpMessage);

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
      currentStep: response.nextStep,
    }));

    // Update User table with FPM selection
    await this.api
      .updateUser({
        current_step: response.nextStep,
        current_fpm_method: selection,
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save user selection conversation
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: selection,
        chat_step: 'getPregnantFPMSelection',
        widget_name: 'getPregnantFPMSelection',
        message_sequence_number: 4,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    // Save bot response conversation
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: response.message,
        chat_step: response.nextStep,
        widget_name: response.followUpWidget || 'getPregnantNextAction',
        message_sequence_number: 5,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    // Save follow-up question if exists
    if (response.followUpQuestion) {
      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: response.followUpQuestion,
          chat_step: response.nextStep,
          widget_name: response.followUpWidget || 'getPregnantNextAction',
          widget_options: this.getWidgetOptions(response.followUpWidget || ''),
          message_sequence_number: 6,
          message_delay_ms: 1000,
        })
        .catch((err) =>
          console.error('Failed to save follow-up conversation:', err),
        );
    }

    // Save user response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantFPMSelection',
        response_type: 'user',
        question_asked:
          'Are you currently using a family planning method (FPM) or did you recently use one?',
        user_response: selection,
        widget_used: 'getPregnantFPMSelection',
        available_options: [
          'No FPM now or recently',
          'IUD',
          'Implants',
          'Injections /Depo-provera / Sayana Press',
          'Sayana Press',
          'Daily Pills',
          'Condoms',
          'Emergency pills',
          'Female sterilisation',
          'Male sterilisation',
        ],
        step_in_flow: 'getPregnantFPMSelection',
      })
      .catch((err) =>
        console.error('Failed to save FPM Selection responses:', err),
      );
  };

  // Get specific response based on FPM method
  private getFPMSpecificResponse(method: string): {
    message: string;
    followUpQuestion?: string;
    followUpWidget?: string;
    nextStep: ChatStep;
  } {
    console.log('getFPMSpecificResponse called with:', { method }); // debug log

    const responses: Record<
      string,
      {
        message: string;
        followUpQuestion?: string;
        followUpWidget?: string;
        nextStep: ChatStep;
      }
    > = {
      'No FPM now or recently': {
        message:
          "That's good to know. Since you're not using any contraceptive method, your body should be ready for pregnancy. Let me ask you about your journey so far.",
        followUpQuestion: 'How long have you been trying to conceive?',
        followUpWidget: 'getPregnantTryingDuration',
        nextStep: 'getPregnantTryingDuration',
      },
      IUD: {
        message:
          "I understand you currently have an IUD. To get pregnant, you'll need to have it removed by a healthcare provider. The IUD prevents pregnancy very effectively, so removal is necessary.",
        followUpQuestion: 'Have you had your IUD removed?',
        followUpWidget: 'getPregnantIUDRemoval',
        nextStep: 'getPregnantIUDRemoval',
      },
      Implants: {
        message:
          "I see you have an implant. To get pregnant, you'll need to have the implant removed by a healthcare provider. The implant prevents pregnancy very effectively.",
        followUpQuestion: 'Have you had your implant removed?',
        followUpWidget: 'getPregnantImplantRemoval',
        nextStep: 'getPregnantImplantRemoval',
      },
      'Injections /Depo-provera / Sayana Press': {
        message:
          "I understand you're using injections. To get pregnant, you'll need to stop getting the injections. However, it may take some time for your fertility to return after stopping.",
        followUpQuestion: 'Have you stopped getting the injections?',
        followUpWidget: 'getPregnantInjectionStop',
        nextStep: 'getPregnantInjectionStop',
      },
      'Sayana Press': {
        message:
          "I understand you're using Sayana Press. To get pregnant, you'll need to stop getting the injections. However, it may take some time for your fertility to return after stopping.",
        followUpQuestion:
          'Have you stopped getting the Sayana Press injections?',
        followUpWidget: 'getPregnantInjectionStop',
        nextStep: 'getPregnantInjectionStop',
      },
      'Daily Pills': {
        message:
          "I see you're taking daily contraceptive pills. To get pregnant, you'll need to stop taking the pills. Your fertility should return relatively quickly after stopping.",
        followUpQuestion: 'Have you stopped taking the daily pills?',
        followUpWidget: 'getPregnantPillsStop',
        nextStep: 'getPregnantPillsStop',
      },
      Condoms: {
        message:
          "Since you're using condoms, you can start trying to conceive immediately by simply not using them during intercourse. Condoms don't affect your fertility.",
        followUpQuestion: 'What would you like to do next?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
      'Emergency pills': {
        message:
          "Emergency contraceptive pills are only meant for occasional use and don't affect your long-term fertility. You can start trying to conceive whenever you're ready.",
        followUpQuestion: 'What would you like to do next?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
      'Female sterilisation': {
        message:
          "Female sterilisation is designed to be permanent. While reversal procedures exist, they are complex and don't guarantee restored fertility. I recommend consulting with a specialist about your options.",
        followUpQuestion: 'What would you like to do next?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
      'Male sterilisation': {
        message:
          "Male sterilisation (vasectomy) is designed to be permanent. While reversal procedures exist, they are complex and don't guarantee restored fertility. I recommend consulting with a specialist about your options.",
        followUpQuestion: 'What would you like to do next?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
    };

    const foundResponse = responses[method];
    console.log('Found response:', foundResponse ? 'Yes' : 'No', { method }); // Debug log
    return (
      foundResponse || {
        message: `I understand you're using ${method}. For specific guidance about conception while using this method, I recommend consulting with a healthcare provider. Please call 7790 for personalized assistance.`,
        followUpQuestion: 'What would you like to do next?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      }
    );
  }

  // Helper method to get widget options for conversation tracking
  private getWidgetOptions(widgetName: string): string[] {
    const optionsMap: Record<string, string[]> = {
      getPregnantTryingDuration: [
        'Less than 6 months',
        '6-12 months',
        'More than 1 year',
      ],
      getPregnantIUDRemoval: [
        'Yes, more than 1 year',
        'Yes, less than 1 year',
        "No, I didn't remove",
      ],
      getPregnantImplantRemoval: [
        'Longer than 3 months',
        'Less than 3 months',
        "No, I didn't remove",
      ],
      getPregnantInjectionStop: ['Yes', 'No'],
      getPregnantPillsStop: ['Yes', 'No'],
      getPregnantNextAction: [
        'Ask more questions',
        'Find nearest clinic',
        'Back to main menu',
      ],
    };
    return optionsMap[widgetName] || [];
  }

  // Get next message sequence number
  private getNextSequenceNumber(): number {
    return ++this.messageSequenceNumber;
  }

  // Reset message sequence for new conversation
  private resetSequenceNumber(): void {
    this.messageSequenceNumber = 0;
  }

  // Handle trying duration selection (No FPM branch)
  handleGetPregnantTryingDuration = async (duration: string): Promise<void> => {
    const userMessage = this.createUserMessage(duration);

    // Store the trying duration
    this.tryingDuration = duration;
    console.log('Trying duration stored:', this.tryingDuration); // debug log

    // Get specific advice based on duration
    const adviceMessage = this.createChatBotMessage(
      this.getTryingDurationAdvice(duration),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
        delay: 1000,
      },
    );

    this.setState((prev: ChatbotState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        userMessage,
        adviceMessage,
        nextActionMessage,
      ],
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table with trying duration
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save user duration selection
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: duration,
        chat_step: 'getPregnantTryingDuration',
        widget_name: 'getPregnantTryingDuration',
        message_sequence_number: 7,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    // Save bot advice message
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: this.getTryingDurationAdvice(duration),
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: 8,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    // Save next action question
    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: 9,
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantTryingDuration',
        response_type: 'user',
        question_asked: 'How long have you been trying to conceive?',
        user_response: duration,
        widget_used: 'getPregnantTryingDuration',
        available_options: [
          'Less than 6 months',
          '6-12 months',
          'More than 1 year',
        ],
        step_in_flow: 'getPregnantTryingDuration',
      })
      .catch((err) =>
        console.error('Failed to save trying duration response:', err),
      );
  };

  // Get advice based on trying duration
  private getTryingDurationAdvice(duration: string): string {
    const adviceMap: Record<string, string> = {
      'Less than 6 months':
        "It's still early in your conception journey. For most couples, it can take up to 6-12 months to conceive naturally. Continue with regular unprotected intercourse and maintain a healthy lifestyle with proper nutrition, exercise, and prenatal vitamins.",
      '6-12 months':
        "You've been trying for a while, which is normal for many couples. Consider tracking your ovulation cycle to optimize timing. Maintain healthy habits and consider consulting a healthcare provider if you have concerns.",
      ' than 1 year':
        "After trying for over a year, it may be helpful to consult with a fertility specialist or healthcare provider. They can assess both partners and provide guidance on next steps. Don't lose hope - many couples conceive with proper medical guidance.",
    };

    return (
      adviceMap[duration] ||
      'Thank you for sharing that information. For personalized advice about your conception journey, I recommend consulting with a healthcare provider who can assess your specific situation.'
    );
  }

  // Handle IUD removal status
  handleGetPregnantIUDRemoval = async (status: string): Promise<void> => {
    const userMessage = this.createUserMessage(status);

    const responseMessage = this.createChatBotMessage(
      this.getIUDRemovalResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
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
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save conversations
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: status,
        chat_step: 'getPregnantIUDRemoval',
        widget_name: 'getPregnantIUDRemoval',
        message_sequence_number: 7,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: this.getIUDRemovalResponse(status),
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: 8,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: 9,
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantIUDRemoval',
        response_type: 'user',
        question_asked: 'Have you had your IUD removed?',
        user_response: status,
        widget_used: 'getPregnantIUDRemoval',
        available_options: [
          'Yes, more than 1 year',
          'Yes, less than 1 year',
          "No, I didn't remove",
        ],
        step_in_flow: 'getPregnantIUDRemoval',
      })
      .catch((err) =>
        console.error('Failed to save IUD removal response:', err),
      );
  };

  // Get IUD removal specific response
  private getIUDRemovalResponse(status: string): string {
    const responses: Record<string, string> = {
      'Yes, more than 1 year':
        "Great! Since you had your IUD removed more than a year ago, your fertility should have fully returned. You can continue trying to conceive naturally. If you haven't conceived yet, consider consulting with a healthcare provider for fertility assessment.",
      'Yes, less than 1 year':
        "Good! Your IUD has been removed. Most women's fertility returns immediately after IUD removal, so you can start trying to conceive right away. It may take a few months for your cycle to regulate completely.",
      "No, I didn't remove":
        "To get pregnant, you'll need to have your IUD removed by a healthcare provider. This is a simple procedure that can be done at a clinic. Please call 7790 to schedule an appointment for IUD removal.",
    };

    return (
      responses[status] ||
      'Please consult with a healthcare provider about your IUD and conception plans. Call 7790 for personalized assistance.'
    );
  }

  // Handle Implant removal status
  handleGetPregnantImplantRemoval = async (status: string): Promise<void> => {
    const userMessage = this.createUserMessage(status);

    const responseMessage = this.createChatBotMessage(
      this.getImplantRemovalResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
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
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save conversations
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: status,
        chat_step: 'getPregnantImplantRemoval',
        widget_name: 'getPregnantImplantRemoval',
        message_sequence_number: 7,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: this.getImplantRemovalResponse(status),
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: 8,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: 9,
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantImplantRemoval',
        response_type: 'user',
        question_asked: 'Have you had your implant removed?',
        user_response: status,
        widget_used: 'getPregnantImplantRemoval',
        available_options: [
          'Longer than 3 months',
          'Less than 3 months',
          "No, I didn't remove",
        ],
        step_in_flow: 'getPregnantImplantRemoval',
      })
      .catch((err) =>
        console.error('Failed to save implant removal response:', err),
      );
  };

  // Get implant removal specific response
  private getImplantRemovalResponse(status: string): string {
    const responses: Record<string, string> = {
      'Longer than 3 months':
        'Excellent! Since you had your implant removed more than 3 months ago, your fertility should have fully returned. You can continue trying to conceive naturally. Most women conceive within a year of implant removal.',
      'Less than 3 months':
        "Good! Your implant has been removed recently. Most women's fertility returns immediately after implant removal, so you can start trying to conceive right away. It may take a few cycles for your body to fully adjust.",
      "No, I didn't remove":
        "To get pregnant, you'll need to have your implant removed by a healthcare provider. This is a simple procedure that can be done at a clinic. Please call 7790 to schedule an appointment for implant removal.",
    };

    return (
      responses[status] ||
      'Please consult with a healthcare provider about your implant and conception plans. Call 7790 for personalized assistance.'
    );
  }

  // Handle injection stopping status
  handleGetPregnantInjectionStop = async (status: string): Promise<void> => {
    const userMessage = this.createUserMessage(status);

    const responseMessage = this.createChatBotMessage(
      this.getInjectionStopResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
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
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save conversations
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: status,
        chat_step: 'getPregnantInjectionStop',
        widget_name: 'getPregnantInjectionStop',
        message_sequence_number: 7,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: this.getInjectionStopResponse(status),
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: 8,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: 9,
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantInjectionStop',
        response_type: 'user',
        question_asked: 'Have you stopped getting the injections?',
        user_response: status,
        widget_used: 'getPregnantInjectionStop',
        available_options: ['Yes', 'No'],
        step_in_flow: 'getPregnantInjectionStop',
      })
      .catch((err) =>
        console.error('Failed to save injection stop response:', err),
      );
  };

  // Get injection stop specific response
  private getInjectionStopResponse(status: string): string {
    const responses: Record<string, string> = {
      Yes: "Good! You've stopped the injections. Please note that it may take 6-12 months or sometimes longer for your fertility to return after stopping injections like Depo-Provera or Sayana Press. This is normal, so be patient with your body as it readjusts.",
      No: "To get pregnant, you'll need to stop getting the injections. Simply don't go for your next scheduled injection. Remember that it may take several months for your fertility to return after your last injection, so don't be discouraged if conception doesn't happen immediately.",
    };

    return (
      responses[status] ||
      'Please consult with a healthcare provider about stopping your injections and conception plans. Call 7790 for personalized assistance.'
    );
  }

  // Handle pills stopping status
  handleGetPregnantPillsStop = async (status: string): Promise<void> => {
    const userMessage = this.createUserMessage(status);

    const responseMessage = this.createChatBotMessage(
      this.getPillsStopResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
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
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save conversations
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: status,
        chat_step: 'getPregnantPillsStop',
        widget_name: 'getPregnantPillsStop',
        message_sequence_number: 7,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: this.getPillsStopResponse(status),
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: 8,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: 9,
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantPillsStop',
        response_type: 'user',
        question_asked:
          'Have you stopped taking the daily contraceptive pills?',
        user_response: status,
        widget_used: 'getPregnantPillsStop',
        available_options: ['Yes', 'No'],
        step_in_flow: 'getPregnantPillsStop',
      })
      .catch((err) =>
        console.error('Failed to save pills stop response:', err),
      );
  };

  // Get pills stop specific response
  private getPillsStopResponse(status: string): string {
    const responses: Record<string, string> = {
      Yes: "Great! You've stopped taking the pills. Your fertility should return relatively quickly - most women can conceive within 1-3 months after stopping birth control pills. Start taking prenatal vitamins if you haven't already.",
      No: "To get pregnant, you'll need to stop taking the daily contraceptive pills. Simply don't take any more pills. Your fertility should return quickly, often within the first month after stopping.",
    };

    return (
      responses[status] ||
      'Please consult with a healthcare provider about stopping your pills and conception plans. Call 7790 for personalized assistance.'
    );
  }

  // Handle next action selection
  handleGetPregnantNextAction = async (action: string): Promise<void> => {
    const userMessage = this.createUserMessage(action);

    if (action === 'Ask more questions') {
      const moreQuestionsMessage = this.createChatBotMessage(
        "I'm here to help with any questions you have about getting pregnant. What would you like to know?",
        { delay: 500 },
      );

      const promptMessage = this.createChatBotMessage(
        'Please type your question below:',
        { delay: 1000 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          moreQuestionsMessage,
          promptMessage,
        ],
        currentStep: 'getPregnantUserQuestion',
      }));

      // Update User table
      await this.api
        .updateUser({
          current_step: 'getPregnantUserQuestion',
        })
        .catch((err) => console.error('Failed to update user:', err));

      // Save conversations
      await this.api
        .createConversation({
          message_type: 'user',
          message_text: action,
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          message_sequence_number: 10,
          message_delay_ms: 0,
        })
        .catch((err) =>
          console.error('Failed to save user conversation:', err),
        );

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text:
            "I'm here to help with any questions you have about getting pregnant. What would you like to know?",
          chat_step: 'getPregnantUserQuestion',
          widget_name: 'getPregnantUserQuestion',
          message_sequence_number: 11,
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save bot conversation:', err));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: 'Please type your question below:',
          chat_step: 'getPregnantUserQuestion',
          widget_name: 'getPregnantUserQuestion',
          message_sequence_number: 12,
          message_delay_ms: 1000,
        })
        .catch((err) => console.error('Failed to save conversation:', err));

      await this.api
        .createResponse({
          response_category: 'GetPregnantNavigation',
          response_type: 'user',
          question_asked: 'What would you like to do next?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Ask more questions',
            'Find nearest clinic',
            'Back to main menu',
          ],
          step_in_flow: 'getPregnantNextAction',
        })
        .catch((err) =>
          console.error('Failed to save navigation response:', err),
        );
    } else if (action === 'Find nearest clinic') {
      const clinicMessage = this.createChatBotMessage(
        'To find the nearest clinic, please share your location or enter your city/area name.',
        { delay: 500 },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [...prev.messages, userMessage, clinicMessage],
        currentStep: 'locationInput',
      }));

      // Update User table
      await this.api
        .updateUser({
          current_step: 'locationInput',
        })
        .catch((err) => console.error('Failed to update user:', err));

      // Save conversations
      await this.api
        .createConversation({
          message_type: 'user',
          message_text: action,
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          message_sequence_number: 10,
          message_delay_ms: 0,
        })
        .catch((err) =>
          console.error('Failed to save user conversation:', err),
        );

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text:
            'To find the nearest clinic, please share your location or enter your city/area name.',
          chat_step: 'locationInput',
          widget_name: 'locationInput',
          message_sequence_number: 11,
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save bot conversation:', err));

      await this.api
        .createResponse({
          response_category: 'GetPregnantNavigation',
          response_type: 'user',
          question_asked: 'What would you like to do next?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Ask more questions',
            'Find nearest clinic',
            'Back to main menu',
          ],
          step_in_flow: 'locationInput',
        })
        .catch((err) =>
          console.error('Failed to save clinic navigation response:', err),
        );
    } else if (action === 'Back to main menu') {
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

      // Update User table
      await this.api
        .updateUser({
          current_step: 'fpm',
        })
        .catch((err) => console.error('Failed to update user:', err));

      // Save conversations
      await this.api
        .createConversation({
          message_type: 'user',
          message_text: action,
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          message_sequence_number: 10,
          message_delay_ms: 0,
        })
        .catch((err) =>
          console.error('Failed to save user conversation:', err),
        );

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: 'What would you like me to help you with?',
          chat_step: 'fpm',
          widget_name: 'fpmOptions',
          message_sequence_number: 11,
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save bot conversation:', err));

      await this.api
        .createResponse({
          response_category: 'GetPregnantNavigation',
          response_type: 'user',
          question_asked: 'What would you like to do next?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Ask more questions',
            'Find nearest clinic',
            'Back to main menu',
          ],
          step_in_flow: 'fpm',
        })
        .catch((err) =>
          console.error('Failed to save main menu navigation response:', err),
        );
    } else {
      // Handle unexpected actions - prevent dead ends
      const errorMessage = this.createChatBotMessage(
        "I didn't understand that option. Let me show you the available choices again.",
        { delay: 500 },
      );

      const nextActionMessage = this.createChatBotMessage(
        'What would you like to do next?',
        {
          widget: 'getPregnantNextAction',
          delay: 1000,
        },
      );

      this.setState((prev: ChatbotState) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          errorMessage,
          nextActionMessage,
        ],
        currentStep: 'getPregnantNextAction',
      }));

      // Save error handling conversation
      await this.api
        .createConversation({
          message_type: 'user',
          message_text: action,
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 0,
        })
        .catch((err) =>
          console.error('Failed to save user conversation:', err),
        );

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text:
            "I didn't understand that option. Let me show you the available choices again.",
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save bot conversation:', err));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: 'What would you like to do next?',
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          widget_options: [
            'Ask more questions',
            'Find nearest clinic',
            'Back to main menu',
          ],
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 1000,
        })
        .catch((err) => console.error('Failed to save conversation:', err));

      // Save error response tracking
      await this.api
        .createResponse({
          response_category: 'GetPregnantNavigationError',
          response_type: 'user',
          question_asked: 'What would you like to do next?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Ask more questions',
            'Find nearest clinic',
            'Back to main menu',
          ],
          step_in_flow: 'getPregnantNextAction',
        })
        .catch((err) => console.error('Failed to save error response:', err));
    }
  };

  // Handle user questions in get pregnant flow
  handleGetPregnantUserQuestion = async (question: string): Promise<void> => {
    const userMessage = this.createUserMessage(question);

    // Get response based on question content
    const responseMessage = this.createChatBotMessage(
      this.getQuestionResponse(question),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
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
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save conversations
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: question,
        chat_step: 'getPregnantUserQuestion',
        widget_name: 'getPregnantUserQuestion',
        message_sequence_number: 13,
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: this.getQuestionResponse(question),
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: 14,
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: 15,
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'GetPregnantUserQuestion',
        response_type: 'user',
        question_asked: 'What would you like to know about getting pregnant?',
        user_response: question,
        widget_used: 'getPregnantUserQuestion',
        available_options: [],
        step_in_flow: 'getPregnantUserQuestion',
      })
      .catch((err) =>
        console.error('Failed to save user question response:', err),
      );
  };

  // Handle location input for clinic finding
  handleLocationInput = async (location: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: location,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      `Thank you for providing your location: ${location}. I'm searching for clinics near you. For immediate assistance, please call 7790 to speak with our team who can provide specific clinic locations and contact information.`,
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'What would you like to do next?',
      {
        widget: 'getPregnantNextAction',
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
      currentStep: 'getPregnantNextAction',
    }));

    // Update User table
    await this.api
      .updateUser({
        current_step: 'getPregnantNextAction',
      })
      .catch((err) => console.error('Failed to update user:', err));

    // Save conversations
    await this.api
      .createConversation({
        message_type: 'user',
        message_text: location,
        chat_step: 'locationInput',
        widget_name: 'locationInput',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 0,
      })
      .catch((err) => console.error('Failed to save user conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: `Thank you for providing your location: ${location}. I'm searching for clinics near you. For immediate assistance, please call 7790 to speak with our team who can provide specific clinic locations and contact information.`,
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'What would you like to do next?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ],
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 1000,
      })
      .catch((err) => console.error('Failed to save conversation:', err));

    // Save response tracking
    await this.api
      .createResponse({
        response_category: 'LocationInput',
        response_type: 'user',
        question_asked:
          'Please share your location or enter your city/area name',
        user_response: location,
        widget_used: 'locationInput',
        available_options: [],
        step_in_flow: 'locationInput',
      })
      .catch((err) => console.error('Failed to save location response:', err));
  };

  // Get response for user questions
  private getQuestionResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes('ovulation') ||
      lowerQuestion.includes('fertile')
    ) {
      return "Ovulation typically occurs around day 14 of a 28-day cycle. You're most fertile in the days leading up to and during ovulation. Consider tracking your cycle and using ovulation predictor kits to optimize timing.";
    } else if (
      lowerQuestion.includes('nutrition') ||
      lowerQuestion.includes('diet')
    ) {
      return 'A healthy diet rich in folic acid, iron, and prenatal vitamins is important when trying to conceive. Avoid alcohol, limit caffeine, and maintain a balanced diet with plenty of fruits and vegetables.';
    } else if (
      lowerQuestion.includes('exercise') ||
      lowerQuestion.includes('activity')
    ) {
      return 'Moderate exercise is beneficial when trying to conceive. Avoid excessive high-intensity workouts that might affect your cycle. Walking, swimming, and yoga are excellent options.';
    } else if (
      lowerQuestion.includes('age') ||
      lowerQuestion.includes('older')
    ) {
      return "Age can affect fertility, but many women conceive naturally at various ages. If you're over 35 and have been trying for 6 months, or over 40, consider consulting a fertility specialist sooner.";
    } else {
      return 'Thank you for your question. For specific medical advice about conception, I recommend consulting with a healthcare provider who can address your individual situation. You can call 7790 to speak with a medical professional.';
    }
  }
}

export default GetPregnantActionProvider;
