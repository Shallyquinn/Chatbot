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
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.state = state;
    this.api = apiClient;
    this.userSessionId = userSessionId || localStorage.getItem('userSessionId') || '';

    // Enhanced constructor with server-side persistence (similar to prevent pregnancy flow)
    this.setState = (
      newState: ChatbotState | ((prev: ChatbotState) => ChatbotState),
    ) => {
      const updatedState =
        typeof newState === 'function' ? newState(this.state) : newState;

      // Primary: Save to server for cross-device sync
      this.saveStateToServer(updatedState).catch((error) => {
        console.warn(
          'Failed to save get pregnant state to server, using localStorage fallback:',
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

    const userMessage: ChatMessage = {
      message: 'Yadda ake ɗaukar ciki',
      type: 'user',
      id: uuidv4(),
    };

    // Ensure session is initialized
    await this.ensureChatSession();

    // Use the original messages from getPregnantConfig
    const introMessage = this.createChatBotMessage(
      'Da kyau! Ina farin cikin ba ki shawarwari kan tsarin iyali.',
      { delay: 500 },
    );

    const questionMessage = this.createChatBotMessage(
      'Shin a halin yanzu kina amfani da hanyar tsarin iyali ko kin yi amfani da shi kwanan nan?\n\nZaɓi abin da kake amfani da shi a yanzu. Duba jerin zabuka don ganin sauran su.',
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
          'Da kyau! Ina farin cikin ba ki shawarwari kan tsarin iyali.',
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
          'Shin a halin yanzu kina amfani da hanyar tsarin iyali ko kin yi amfani da shi kwanan nan?\n\nZaɓi abin da kake amfani da shi a yanzu. Duba jerin zabuka don ganin sauran su.',
        chat_step: 'getPregnantFPMSelection',
        widget_name: 'getPregnantFPMSelection',
        widget_options: [
          'Bantaba amfani da wata hanyar tsara iyali ba',
          "Na'urar IUD",
          'Alluran roba na hanu(Implants)',
          'Allurai / Depo-provera / Sayana Press',
          'Sayana Press',
          'Kwayan sha na kullum',
          'Kwaroron roba (condom)',
          'Kwayan sha na gaggawa',
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
    const userMessage: ChatMessage = {
      message: selection,
      type: 'user',
      id: uuidv4(),
    };

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
          'Shin a halin yanzu kina amfani da hanyar tsarin iyali ko kin yi amfani da shi kwanan nan?',
        user_response: selection,
        widget_used: 'getPregnantFPMSelection',
        available_options: [
          'Ban taba amfani da wata hanyar tsara iyali ba',
          "Na'urar IUD",
          'Alluran roba na hanu(Implants)',
          'Allurai / Depo-provera / Sayana Press',
          'Sayana Press',
          'Kwayan sha na kullum',
          'Kwaroron roba (condom)',
          'Kwayan sha na gaggawa',
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
      'Ban taba amfani da wata hanyar tsara iyali ba': {
        message:
          "Madalla da jin haka. Tun da ba kiyi amfani da wata hanyar hana daukar ciki ba, jikinki zai kasance a shirye don samun ciki. Bari in  yi miki wasu tambayoyi.",
        followUpQuestion: 'Na wani tsawon lokaci kike ƙoƙarin samun ciki?',
        followUpWidget: 'getPregnantTryingDuration',
        nextStep: 'getPregnantTryingDuration',
      },
      "Na'urar IUD": {
        message:
          "Na fahimci kina da na'urar IUD a halin yanzu. Don samun ciki, dole ne likita ya cire miki shi. Na'urar IUD yana hana daukar ciki sosai, don haka cire shi yana da muhimmanci.",
        followUpQuestion: "Kin cire na'urar IUD ɗinki?",
        followUpWidget: 'getPregnantIUDRemoval',
        nextStep: 'getPregnantIUDRemoval',
      },
      'Alluran roba na hanu(Implants)': {
        message:
          "Na kuma ga kina da imflant. Don samun ciki, dole ne likita ya cire miki shi. Imflant yana hana daukar ciki.",
        followUpQuestion: 'Kin cire imflant ɗinki?',
        followUpWidget: 'getPregnantImplantRemoval',
        nextStep: 'getPregnantImplantRemoval',
      },
      'Allurai / Depo-provera / Sayana Press': {
        message:
          "Na fahimci kina amfani da allurar hana daukar ciki. Don samun ciki, dole ne ki daina karɓar allurar. Duk da haka, yana iya ɗaukar ɗan lokaci kafin yanayin samun ciki ya dawo daidai bayan kin daina.",
        followUpQuestion: 'Kin daina karɓar allurar hana daukar ciki?',
        followUpWidget: 'getPregnantInjectionStop',
        nextStep: 'getPregnantInjectionStop',
      },
      'Sayana Press': {
        message:
          "Na fahimci kina amfani da Sayana Press. Don samun ciki, dole ne ki daina karɓar allurar Sayana Press. Amma yana iya ɗaukar ɗan lokaci kafin yanayin samun ciki ya dawo daidai bayan kin daina.",
        followUpQuestion:
          'Kin daina karɓar allurar Sayana Press?',
        followUpWidget: 'getPregnantInjectionStop',
        nextStep: 'getPregnantInjectionStop',
      },
      'Kwayan sha na kullum': {
        message:
          "Na ga kina shan kwayar hana daukar ciki kullum. Don samun ciki, dole ne ki daina shan kwayar. Haihuwa na dawowa da sauri bayan kin daina shan ta.",
        followUpQuestion: 'Kin daina shan kwayar kullum ta hana daukar ciki?',
        followUpWidget: 'getPregnantPillsStop',
        nextStep: 'getPregnantPillsStop',
      },
      'Kwaroron roba (condom)': {
        message:
          "Tunda kina amfani da kondom, zaku iya fara ƙoƙarin samun ciki nan take ta hanyar daina amfani da su yayin jima'i. Kondom baya shafar haihuwa.",
        followUpQuestion: 'Me kike son ki yi gaba?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
      'Kwayan sha na gaggawa': {
        message:
          "Kwayar hana daukar ciki ta gaggawa an tsara ta ne don amfani na lokaci-lokaci kawai, kuma bata da tasiri a kan haihuwa na dogon lokaci. Zaki iya fara ƙoƙarin samun ciki duk lokacin da kika shirya.",
        followUpQuestion: 'Me kike son ki yi gaba?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
      'Female sterilisation': {
        message:
          "Tiyatar hana haihuwa ga mata (female sterilisation) an ƙera ta ne don ta zama ta dindindin. Duk da yake ana yin tiyatar dawo da haihuwa, tana da wahala kuma ba ta tabbatar da dawowar haihuwar. Ina ba da shawarar ki tuntuɓi ƙwararren likita don tattaunawa kan zabin da ya dace.",
        followUpQuestion: 'Me kike son ki yi gaba?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
      'Male sterilisation': {
        message:
          "Tiyatar hana haihuwa ga maza (vasectomy) an tsara ta ne don ta zama ta dindindin. Duk da yake ana iya tiyatar dawo da haihuwa, tana da wahala kuma ba ta tabbatar da dawowar haihuwa ba. Ina ba da shawarar ka tuntuɓi ƙwararren likita don tattaunawa kan zabin da ya dace da kai.",
        followUpQuestion: 'Me kake son ka yi gaba?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      },
    };

    const foundResponse = responses[method];
    console.log('Found response:', foundResponse ? 'Ee' : "A'a", { method }); // Debug log
    return (
      foundResponse || {
        message: `Na fahimci kina amfani da ${method}. Don samun cikakken shawarwari kan yadda zaka iya samun ciki yayin amfani da wannan hanyar, ina ba da shawarar ka tuntuɓi likitan lafiya. Don samun taimako na musamman, ka kira 7790.`,
        followUpQuestion: 'Me kake son ka yi gaba?',
        followUpWidget: 'getPregnantNextAction',
        nextStep: 'getPregnantNextAction',
      }
    );
  }

  // Helper method to get widget options for conversation tracking
  private getWidgetOptions(widgetName: string): string[] {
    const optionsMap: Record<string, string[]> = {
      getPregnantTryingDuration: [
        'Ƙasa da watanni shida',
        'Watanni 6–12',
        'Fiye da shekara 1',
      ],
      getPregnantIUDRemoval: [
        'Eh, fiye da shekara ɗaya',
        'Eh, ƙasa da shekara ɗaya',
        "A’a, ban cire ba",
      ],
      getPregnantImplantRemoval: [
        'Fiye da watanni uku',
        'Ƙasa da watanni uku',
        "A’a, ban cire ba",
      ],
      getPregnantInjectionStop: ['Ee', "A'a"],
      getPregnantPillsStop: ['Ee', "A'a"],
      getPregnantNextAction: [
        'Yi ƙarin tambayoyi',
        'Nemo asibiti mafi kusa',
        'Koma zuwa babban menu',
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
    const userMessage: ChatMessage = {
      message: duration,
      type: 'user',
      id: uuidv4(),
    };

    // Store the trying duration
    this.tryingDuration = duration;
    console.log('Trying duration stored:', this.tryingDuration); // debug log

    // Get specific advice based on duration
    const adviceMessage = this.createChatBotMessage(
      this.getTryingDurationAdvice(duration),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Yi ƙarin tambayoyi',
          'Nemo asibiti mafi kusa',
          'Koma zuwa babban menu',
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
          'Ƙasa da watanni shida',
          'Watanni 6–12:',
          'Fiye da shekara 1:',
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
      'Ƙasa da watanni shida':
        "Har yanzu lokaci bai kure muku ba ta neman ciki. Ga ma’aurata da dama, yana iya ɗaukar tsawon watanni 6 zuwa 12 kafin su sami ciki ta hanya ta halitta. Ci gaba da saduwa ba tare da amfani da kariya ba, sannan ki kula da lafiyar ki — abinci mai gina jiki, motsa jiki, da shan bitamin na mata masu juna biyu.",
      'Watanni 6–12:':
        "Kin riga kin dade kina ƙoƙarin samun ciki, wanda hakan al’ada ce ga ma’aurata da dama. Yi la’akari da bin diddigin lokacin ovulation ɗinki domin sanin lokacin da kike da damar daukar ciki. Ci gaba da kula da lafiyarki, kuma ki tuntubi likitan lafiya idan kina da damuwa.",
      'Fiye da shekara 1:':
        "Idan kin yi ƙoƙarin samun ciki fiye da shekara guda, yana da kyau ki tuntuɓi ƙwararren likitan haihuwa (fertility specialist) ko likitan lafiya. Zasu iya bincikar ku duka biyun su kuma ba da shawarar matakan da suka dace. Kada ki damu, ma’aurata da dama suna samun ciki bayan samun kulawar likita.",
    };

    return (
      adviceMap[duration] ||
      'Na gode da bayyana wannan bayanin. Don samun shawarwari na musamman game da tafiyarki ta neman ciki, ina ba da shawarar ki tuntuɓi likitan lafiya domin tantance halin da kike ciki.'
    );
  }

  // Handle IUD removal status
  handleGetPregnantIUDRemoval = async (status: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: status,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getIUDRemovalResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Yi ƙarin tambayoyi',
          'Nemo asibiti mafi kusa',
          'Koma zuwa babban menu',
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
          'Eh, fiye da shekara ɗaya',
          'Eh, ƙasa da shekara ɗaya',
          "A’a, ban cire ba",
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
      'Eh, fiye da shekara ɗaya':
        "Madalla! Tun da aka cire miki IUD ɗinki fiye da shekara guda da ta wuce, yuwuwar samun ciki ta dawo yadda ta ke. Za ki iya ci gaba da ƙoƙarin samun ciki ta hanya ta halatta. Idan har yanzu baki samu ciki ba, ki yi la’akari da tuntuɓar likitan lafiya don yin gwajin haihuwa (fertility assessment).",
      'Eh, ƙasa da shekara ɗaya':
        "Da kyau! An cire miki IUD ɗinki. Yawancin mata suna samun damar daukar ciki nan da nan bayan cirewa, don haka za ki iya fara ƙoƙarin samun ciki yanzu. Amma ki sani, zai iya ɗaukar ‘yan watanni kafin jinin al’ada ya dawo yadda yake.",
      "A’a, ban cire ba":
        "Don Allah ki tuntuɓi likitan lafiya game da IUD ɗinki da shirin samun ciki. Ki kira 7790 don samun shawarwari na musamman.",
    };

    return (
      responses[status] ||
      'Don Allah ki tuntuɓi likitan lafiya game da IUD ɗinki da shirin samun ciki. Ki kira 7790 don samun shawarwari na musamman.'
    );
  }

  // Handle Implant removal status
  handleGetPregnantImplantRemoval = async (status: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: status,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getImplantRemovalResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Yi ƙarin tambayoyi',
          'Nemo asibiti mafi kusa',
          'Koma zuwa babban menu',
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
        question_asked: 'Kin cire imflant ɗinki?',
        user_response: status,
        widget_used: 'getPregnantImplantRemoval',
        available_options: [
          'Fiye da watanni uku',
          'Ƙasa da watanni uku',
          "A’a, ban cire ba",
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
      'Fiye da watanni uku':
        'Da kyau! Tun da aka cire miki imflant ɗinki (na’urar hana ɗaukar ciki) fiye da watanni uku da suka wuce, yuwuwar samun ciki ta dawo yadda ta ke. Za ki iya ci gaba da ƙoƙarin samun ciki ta hanya ta halatta. Yawancin mata suna samun ciki cikin shekara guda bayan cire imflant.',
      'Ƙasa da watanni uku':
        "Da kyau! An cire miki imflant ɗinki kwanan nan. Yawancin mata suna dawo da yuwuwar samun ciki nan da nan bayan cire imflant, don haka za ki iya fara ƙoƙarin samun ciki yanzu. Amma ki sani, zai iya ɗaukar yan zagayowar jini kafin jikinki ya daidaita gaba ɗaya.",
      "A’a, ban cire ba":
        "Don samun ciki, dole ne a cire imflant ɗinki ta hannun likitan lafiya. Wannan hanya ce mai sauƙi da ake yi a asibiti. Don Allah ki kira 7790 don yin alƙawari (appointment) don cire imflant ɗin.",
    };

    return (
      responses[status] ||
      'Don Allah ki tuntuɓi likitan lafiya game da imflant ɗinki da shirin samun ciki. Ki kira 7790 don samun shawarwari na musamman'
    );
  }

  // Handle injection stopping status
  handleGetPregnantInjectionStop = async (status: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: status,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getInjectionStopResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Yi ƙarin tambayoyi',
          'Nemo asibiti mafi kusa',
          'Koma zuwa babban menu',
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
        question_asked: 'Kin daina karɓar alluran hana ɗaukar ciki?',
        user_response: status,
        widget_used: 'getPregnantInjectionStop',
        available_options: ['Ee', "A'a"],
        step_in_flow: 'getPregnantInjectionStop',
      })
      .catch((err) =>
        console.error('Failed to save injection stop response:', err),
      );
  };

  // Get injection stop specific response
  private getInjectionStopResponse(status: string): string {
    const responses: Record<string, string> = {
      Ee: "Madalla! Kin daina karɓar allurar hana ɗaukar ciki. Ki sani cewa yana iya ɗaukar tsawon watanni 6 zuwa 12, ko ma fiye, kafin yuwuwar samun ciki ta dawo bayan daina allurai kamar Depo-Provera ko Sayana Press. Wannan ba matsala bane, don haka ki yi haƙuri da jikinki yayin da yake dawo daidai.",
      "A'a": "Don samun ciki, ki daina karɓar allurai gaba ɗaya. Ki tuna cewa yuwuwar samun ciki tana iya ɗaukar watanni bayan allurar ƙarshe, don haka kar ki damu idan baki samu ciki nan da nan ba.",
    };

    return (
      responses[status] ||
      '"Don Allah ki tuntuɓi likitan lafiya game da daina allurai da shirin samun ciki. Ki kira 7790 don samun shawarwari na musamman"'
    );
  }

  // Handle pills stopping status
  handleGetPregnantPillsStop = async (status: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: status,
      type: 'user',
      id: uuidv4(),
    };

    const responseMessage = this.createChatBotMessage(
      this.getPillsStopResponse(status),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
          'Yi ƙarin tambayoyi',
          'Nemo asibiti mafi kusa',
          'Koma zuwa babban menu',
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
          'Kin daina shan kwayoyin hana ɗaukar ciki na kullum?',
        user_response: status,
        widget_used: 'getPregnantPillsStop',
        available_options: ['Ee', "A'a"],
        step_in_flow: 'getPregnantPillsStop',
      })
      .catch((err) =>
        console.error('Failed to save pills stop response:', err),
      );
  };

  // Get pills stop specific response
  private getPillsStopResponse(status: string): string {
    const responses: Record<string, string> = {
      Ee: "Madalla! Kin daina shan kwayoyin hana ɗaukar ciki. Yuwuwar samun ciki tana dawowa cikin ƙanƙanin lokaci -yawancin mata suna iya ɗaukar ciki cikin watanni 1 zuwa 3 bayan daina amfani da su. Idan baki fara ba tukuna, ki fara shan bitamin na mata masu juna biyu (prenatal vitamins).",
      "A'a": "Don samun ciki, ki daina shan kwayoyin hana ɗaukar ciki na kullum. Yuwuwar samun ciki tana dawowa da sauri, yawanci cikin wata ɗaya bayan daina shan kwayoyi.",
    };

    return (
      responses[status] ||
      '"Don Allah ki tuntuɓi likitan lafiya game da daina shan kwayoyi da shirin samun ciki. Ki kira 7790 don samun shawarwari na musamman"'
    );
  }

  // Handle next action selection
  handleGetPregnantNextAction = async (action: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: action,
      type: 'user',
      id: uuidv4(),
    };

    if (action === 'Yi ƙarin tambayoyi') {
      const moreQuestionsMessage = this.createChatBotMessage(
        "Ina nan don taimaka miki kan duk wani tambaya da ya shafi samun ciki. Mene ne kike son sani?",
        { delay: 500 },
      );

      const promptMessage = this.createChatBotMessage(
        'Don Allah ki rubuta tambayarki a ƙasa:',
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
            "Ina nan don taimaka miki da duk wata tambaya da kike da ita game da samun ciki. Mene ne kike son sani?",
          chat_step: 'getPregnantUserQuestion',
          widget_name: 'getPregnantUserQuestion',
          message_sequence_number: 11,
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save bot conversation:', err));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: 'Don Allah ki rubuta tambayarki a ƙasa:',
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
          question_asked: 'Me kike son ki yi gaba?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
          ],
          step_in_flow: 'getPregnantNextAction',
        })
        .catch((err) =>
          console.error('Failed to save navigation response:', err),
        );
    } else if (action === 'Nemo asibiti mafi kusa') {
      const clinicMessage = this.createChatBotMessage(
        'Don neman asibiti mafi kusa, don Allah ki rubuta inda kike ko ki shigar da sunan garinki ko unguwarki.',
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
            'Don neman asibiti mafi kusa, don Allah ki rubuta inda kike ko ki shigar da sunan garinki ko unguwarki.',
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
          question_asked: 'Me kike son ki yi gaba?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
          ],
          step_in_flow: 'locationInput',
        })
        .catch((err) =>
          console.error('Failed to save clinic navigation response:', err),
        );
    } else if (action === 'Koma zuwa babban menu') {
      const mainMenuMessage = this.createChatBotMessage(
        'Mene ne kike so in taimaka miki da shi?',
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
          message_text: 'Mene ne kike so in taimaka miki da shi?',
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
          question_asked: 'Me kike son ki yi gaba?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
          ],
          step_in_flow: 'fpm',
        })
        .catch((err) =>
          console.error('Failed to save main menu navigation response:', err),
        );
    } else {
      // Handle unexpected actions - prevent dead ends
      const errorMessage = this.createChatBotMessage(
        "Ban fahimci wannan zaɓin ba. Bari in sake nuna miki zaɓuɓɓukan da ake da su yanzu.",
        { delay: 500 },
      );

      const nextActionMessage = this.createChatBotMessage(
        'Me kike son ki yi gaba?',
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
            "Ban fahimci wannan zaɓin ba. Bari in sake nuna miki zaɓuɓɓukan da ake da su yanzu.",
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          message_sequence_number: this.getNextSequenceNumber(),
          message_delay_ms: 500,
        })
        .catch((err) => console.error('Failed to save bot conversation:', err));

      await this.api
        .createConversation({
          message_type: 'bot',
          message_text: 'Me kike son ki yi gaba?',
          chat_step: 'getPregnantNextAction',
          widget_name: 'getPregnantNextAction',
          widget_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
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
          question_asked: 'Me kike son ki yi gaba?',
          user_response: action,
          widget_used: 'getPregnantNextAction',
          available_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
          ],
          step_in_flow: 'getPregnantNextAction',
        })
        .catch((err) => console.error('Failed to save error response:', err));
    }
  };

  // Handle user questions in get pregnant flow
  handleGetPregnantUserQuestion = async (question: string): Promise<void> => {
    const userMessage: ChatMessage = {
      message: question,
      type: 'user',
      id: uuidv4(),
    };

    // Get response based on question content
    const responseMessage = this.createChatBotMessage(
      this.getQuestionResponse(question),
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
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
        question_asked: 'Mene ne kike son sani game da samun ciki?',
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
      `Na gode da raba bayanai game da wurin da kike: ${location}. Ina binciken asibitoci mafi kusa da ke wurinki. Don samun taimako cikin gaggawa, don Allah ki kira 7790 don yin magana da ƙungiyarmu, wacce za ta ba ki cikakken bayani kan asibitoci mafi kusa da lambar tuntuɓarsu.`,
      { delay: 500 },
    );

    const nextActionMessage = this.createChatBotMessage(
      'Me kike son ki yi gaba?',
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
        message_text: `Na gode da raba bayanai game da wurin da kike: ${location}. Ina binciken asibitoci mafi kusa da ke wurinki. Don samun taimako cikin gaggawa, don Allah ki kira 7790 don yin magana da ƙungiyarmu, wacce za ta ba ki cikakken bayani kan asibitoci mafi kusa da lambar tuntuɓarsu.`,
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        message_sequence_number: this.getNextSequenceNumber(),
        message_delay_ms: 500,
      })
      .catch((err) => console.error('Failed to save bot conversation:', err));

    await this.api
      .createConversation({
        message_type: 'bot',
        message_text: 'Me kike son ki yi gaba?',
        chat_step: 'getPregnantNextAction',
        widget_name: 'getPregnantNextAction',
        widget_options: [
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
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
          'Don Allah ki shigar da sunan garinki ko unguwarki.',
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
      return "Fitowar kwai (Ovulation) yawanci yana faruwa a rana ta 14 a cikin zagayowar jini haila na kwanaki 28.";
    } else if (
      lowerQuestion.includes('nutrition') ||
      lowerQuestion.includes('diet')
    ) {
      return "Yiwuwar samun ciki (fertility) yana da yawa a kwanakin da suka gabaci da lokacin fitowar kwai (ovulation). Ki yi la’akari da bin diddigin zagayowar al'adar ki da amfani da na’urorin gano fitowar kwai (ovulation predictor kits) domin samun lokaci mafi dacewa don ɗaukar ciki.";
    } else if (
      lowerQuestion.includes('exercise') ||
      lowerQuestion.includes('activity')
    ) {
      return 'Takaitaccen motsa jiki (moderate exercise) yana da amfani idan kina ƙoƙarin samun ciki. Ki guji motsa jiki mai tsanani sosai wanda zai iya shafar zagayowar jikinki (menstrual cycle). Yin tafiya, iyo, da yoga su ne zaɓuɓɓuka masu kyau don kiyaye lafiyar jiki yayin shirin samun ciki.';
    } else if (
      lowerQuestion.includes('age') ||
      lowerQuestion.includes('older')
    ) {
      return "Shekaru na iya yin tasiri kan yuwuwar samun ciki (fertility), amma mata da dama suna samun ciki ta hanya a lokuta daban-daban na rayuwa. Idan kina da fiye da shekaru 35 kuma kina ƙoƙarin samun ciki na tsawon watanni 6 ba tare da nasara ba, ko kuma fiye da shekaru 40, ana ba da shawarar ki tuntuɓi ƙwararren likitan haihuwa (fertility specialist) da wuri.";
    } else {
      return "Na gode da tambayarki. Don samun shawarwari na musamman game da samun ciki (conception), ana ba da shawarar ki tuntuɓi likitan lafiya wanda zai iya ba da amsa bisa ga halin da kike ciki. Ki kira 7790 don yin magana da ƙwararren ma’aikacin lafiya.";
    }
  }
}

export default GetPregnantActionProvider;
