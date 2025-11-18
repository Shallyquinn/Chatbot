// honey/src/chatbot/types.ts
export interface ChatMessage {
  message: string;
  type: "bot" | "user";
  id?: string;
  widget?: string;
  delay?: number;
  loading?: boolean;
  withAvatar?: boolean;
  widgetData?: Record<string, unknown>;
  tag?: string;
  timestamp?: string; // ISO timestamp string for when the message was sent
}

export type GreetingStep =
  | "initial_welcome"
  | "introduction"
  | "capabilities"
  | "confidentiality"
  | "gender"
  | "location"
  | "location_confirmation"
  | "age"
  | "marital_status"
  | "setup_complete"
  | "main_navigation"
  | "complete";

export type EmergencyProduct = "Postpill" | "Postinor-2";

export type PreventionDuration =
  | "short term"
  | "medium term"
  | "long term"
  | "extended term"
  | "permanent";

export type ContraceptiveMethod =
  | "Daily pills"
  | "Diaphragm"
  | "Female condom"
  | "Male condom"
  | "Injectables"
  | "Implants"
  | "IUS"
  | "IUD"
  | "Vasectomy"
  | "Tubal_ligation";

export type ContraceptionType = "emergency" | "prevention";

export interface MethodInfo {
  description: string;
  imageWidget?: string;
  imagePrompt?: string;
  audioWidget?: string;
  audioPrompt?: string;
}

export interface ChatbotState {
  messages: ChatMessage[];
  currentStep: ChatStep;
  greetingStep: GreetingStep;
  selectedState?: string;
  selectedLGA?: string;
  currentFPMMethod?: string;
  currentConcernType?: string;
  userIntention?: string;
  selectedLanguage?: string;
  selectedGender?: string;
  selectedAge?: string;
  selectedAgeGroup?: string;
  selectedMaritalStatus?: string;
  isSessionInitialized?: boolean;
  isReturningUser?: boolean;
  // Agent-related fields
  conversationId?: string;
  escalationStatus?: "QUEUED" | "ASSIGNED" | "COMPLETED" | "OUTSIDE_HOURS" | "outside_hours" | null;
  queuePosition?: number;
  assignedAgent?: string | null;
  agentId?: string | null;
  agentWebSocket?: WebSocket | null;
  queueUpdateInterval?: NodeJS.Timeout | null;
  fpmInteractionData?: FPMInteractionData;
  // Task 5: Prevent pregnancy flow tracking
  preventPregnancy?: {
    selectedProduct?: string;
    selectedDuration?: string;
  };
}

export type DemographicTag =
  | "language_selection"
  | "gender_selection"
  | "state_selection"
  | "lga_selection"
  | "age_selection"
  | "marital_status_selection";

export type ChatStep =
  | "language"
  | "gender"
  | "location"
  | "location_confirmation"
  | "location_retry"
  | "age"
  | "marital_status"
  | "main_navigation"
  | "agentTypeSelection"
  | "contraception"
  | "sexEnhancement"
  | "userQuestion"
  | "moreHelp"
  | "waitingForHuman"
  | "waitingForAgent"
  | "agentActive"
  | "agentSelection"
  | "stateSelection"
  | "lgaSelection"
  | "locationInput"
  | "locationConfirm"
  | "marital"
  | "maritalStatus"
  | "fpm"
  | "emergencyProduct"
  | "duration"
  | "preventionDuration"
  | "methodDetails"
  | "lubricantSelection"
  | "erectileDysfunction"
  | "sexEnhancementNextAction"
  | "nextAction"
  // FPM Change/Stop related steps
  | "fpmConcern"
  | "currentFPM"
  | "fpmConcernType"
  | "fpmNextAction"
  | "feedback"
  | "humanAISelection"
  // Switch FP flow steps
  | "switchCurrentFPM"
  | "satisfactionAssessment"
  | "switchReason"
  | "methodRecommendation"
  | "kidsInFuture"
  | "timing"
  | "importantFactors"
  | "menstrualFlow"
  // Stop FP flow steps
  | "stopCurrentFPM"
  | "stopReason"
  // General question related steps
  | "generalQuestion"
  // Get Pregnant related steps
  | "getPregnantIntro"
  | "getPregnantFPMSelection"
  | "getPregnantTryingDuration"
  | "getPregnantIUDRemoval"
  | "getPregnantImplantRemoval"
  | "getPregnantInjectionStop"
  | "getPregnantPillsStop"
  | "getPregnantNextAction"
  | "getPregnantUserQuestion"
  | "clinicReferral"
  // Task 5: Product information flow steps
  | "productDetailChoice"
  | "learnOtherMethods"
  | "flowEnd"
  | "default";

export interface ActionProviderInterface {
  handleEmergencyProductSelection(product: EmergencyProduct): void;
  handlePreventionDurationSelection(duration: string): void;
  handleMethodOptionsSelection(method: string): void;
  handleContraceptionTypeSelection(type: string): void;
}

// FPM-related types for better type safety
export type FPMMethod =
  | 'IUD'
  | 'Implant'
  | 'Injection / Depo-provera'
  | 'Sayana Press'
  | 'Daily Pill'
  | 'Female sterilisation'
  | 'Male sterilisation';

export type SwitchFPMMethod =
  | 'IUD'
  | 'Implants'
  | 'Injections / Depo-provera'
  | 'Sayana Press'
  | 'Daily Pills'
  | 'Female sterilisation'
  | 'Male sterilisation';

export type StopFPMMethod =
  | 'IUD'
  | 'Implants'
  | 'Injections / Depo-provera'
  | 'Sayana Press'
  | 'Daily Pills'
  | 'Condoms'
  | 'Emergency contraceptive'
  | 'Female sterilisation'
  | 'Male sterilisation';

export type FPMConcernType =
  | 'Effectiveness'
  | 'Effect on general health'
  | 'Convenience'
  | 'Price'
  | 'Side effects'
  | 'Effect on sex life'
  | 'Privacy in contraception'
  | 'I want no clinic visits'
  | 'Effect on fertility';

export type SwitchReasonType =
  | 'Effectiveness'
  | 'Effect on general health'
  | 'Convenience'
  | 'Price'
  | 'Side effects'
  | 'Effect on sex life'
  | 'Privacy in contraception'
  | 'I want no clinic visits'
  | 'Effect on fertility';

export type StopReasonType =
  | 'Low Effectiveness'
  | 'Effect on general health'
  | 'Convenience'
  | 'Price'
  | 'Side effects'
  | 'Effect on sex life'
  | 'Privacy in contraception'
  | 'I want no clinic visits'
  | 'Effect on fertility';

export type FPMInitialConcern =
  | 'Concerned about FP'
  | 'Want to switch FP'
  | 'Want to stop FP';

export type SatisfactionLevel = 'Somewhat satisfied' | 'Not satisfied';

export type KidsInFutureResponse = 'Yes, I want more kids' | 'No';

export type TimingOption =
  | 'Less than 1 year'
  | '1-2 years'
  | '3-5 years'
  | 'More than 5 years';

export type ImportantFactor =
  | 'Efficiency in prevention'
  | 'Should be safe to use'
  | 'Be easy and convenient'
  | 'Discreet from others'
  | 'No pain/cramp/vomit'
  | 'No weight gain'
  | 'No effect on sex life'
  | 'Be able have kids after'
  | 'Stop without clinic'
  | 'No effect on menstrual🩸';

export type MenstrualFlowPreference =
  | 'No INcrease of🩸flow'
  | 'No DEcrease of🩸flow';

export type FPMNextAction =
  | 'Talk to AI / Human'
  | 'Find nearest clinic'
  | 'End this chat';

export type MethodRecommendationResponse = 'Yes' | 'No';
export type FeedbackOption = 'Yes' | 'No';

export type MoreHelpOption = 'Yes, I want to ask' | 'No';

export type HumanAIOption = 'Human agent' | 'AI chatbot';

// Get Pregnant specific types
export type GetPregnantFPMOption =
  | 'No FPM now or recently'
  | 'IUD'
  | 'Implants'
  | 'Injections / Depo-provera'
  | 'Sayana Press'
  | 'Daily Pills'
  | 'Condoms'
  | 'Emergency pills'
  | 'Female sterilisation'
  | 'Male sterilisation';

export type GetPregnantDuration = 'Less than 1 year' | 'Longer than 1 year';

export type GetPregnantRemovalStatus =
  | 'Yes, more than 1 year'
  | 'Yes, less than 1 year'
  | "No, I didn't remove";

// Agent-related types
export interface AgentMessageData {
  type: 'AGENT_JOINED' | 'AGENT_MESSAGE' | 'AGENT_DISCONNECTED';
  agentId?: string;
  agentName?: string;
  message?: string;
}

export interface QueueUpdateData {
  position: number;
  estimatedWaitTime: string;
  status: string;
}

export interface EscalationResult {
  status: 'ASSIGNED' | 'QUEUED' | 'COMPLETED';
  agentId?: string;
  agentName?: string;
  position?: number;
  estimatedWaitTime?: string;
}

export interface ConversationMessage {
  message_text: string;
  message_type: 'user' | 'bot' | 'agent';
  chat_step: string;
  message_sequence_number: number;
  widget_name?: string;
}

export interface FPMInteractionData {
  currentMethod?: string;
  concernType?: string;
  duration?: string;
  removal?: string;
  [key: string]: string | number | boolean | undefined;
}
export type GetPregnantImplantRemovalStatus =
  | 'Longer than 3 months'
  | 'Less than 3 months'
  | "No, I didn't remove";

export type GetPregnantStopStatus = 'Yes' | 'No';

export type GetPregnantNextAction =
  | 'Ask more questions'
  | 'Find nearest clinic'
  | 'Back to main menu';
