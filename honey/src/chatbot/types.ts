export interface ChatMessage {
    message: string;
    type: 'bot' | 'user';
    id?: string;
    widget?: string;
    delay?: number;
  }
  
  export interface ChatbotState {
    messages: ChatMessage[];
    currentStep: ChatStep;
  }
  
  export type ChatStep =
    | 'language'
    | 'gender'
    | 'locationInput'
    | 'locationConfirm'
    | 'age'
    | 'marital'
    | 'fpm'
    | 'contraception'
    | 'emergencyProduct'
    | 'duration'
    | 'methodDetails'
    | 'sexEnhancement'
    | 'lubricantSelection'
    | 'nextAction'
    | 'default';