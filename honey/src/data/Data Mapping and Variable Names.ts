// =====================================================================
// FRONTEND DATA STRUCTURES & VARIABLE NAMES
// =====================================================================

import { FPM_CONCERN_TYPES } from '@/chatbot/sections/changeFPM/fpmWidgetsConfig';

// =====================================================================
// 1. USER DATA INTERFACE - Maps to 'users' table
// =====================================================================
export interface UserData {
  user_session_id: string; // Generated unique session ID
  selected_language: string | null; // 'English' | 'Hausa' | 'Yoruba'
  selected_gender: string | null; // 'Male 👨' | 'Female 👩' | 'Prefer not to say'
  selected_state: string | null; // Nigerian state name
  selected_lga: string | null; // Local Government Area
  selected_age_group: string | null; // '< 25' | '26-35' | '36-45' | '46-55' | '55 and older'
  selected_marital_status: string | null; // 'Single' | 'In a relationship' | 'Married' | 'Prefer not to say'
  current_step: string; // Current chatbot step
  current_fpm_method: string | null; // Current FPM method being discussed
  current_concern_type: string | null; // Current concern type
  user_intention: string | null; // What user wants to achieve
}

// =====================================================================
// 2. CHAT SESSION INTERFACE - Maps to 'chat_sessions' table
// =====================================================================
export interface ChatSessionData {
  user_session_id: string;
  session_start_time: Date;
  session_end_time?: Date;
  total_messages_count: number;
  session_duration_minutes?: number;
  session_completed: boolean;
  session_outcome?: string; // 'completed' | 'abandoned' | 'transferred_to_human' | 'clinic_referral'
  final_step_reached?: string;
  user_agent?: string;
  ip_address?: string;
  device_type?: string; // 'mobile' | 'desktop' | 'tablet'
}

// =====================================================================
// 3. CONVERSATION MESSAGE INTERFACE - Maps to 'conversations' table
// =====================================================================
export interface ConversationMessage {
  user_session_id: string;
  message_text: string;
  message_type: 'user' | 'bot';
  message_source: 'typed' | 'button_click' | 'widget_selection';
  chat_step: string;
  widget_name?: string;
  selected_option?: string;
  message_delay_ms?: number;
  has_widget: boolean;
  widget_options?: string[];
  message_sequence_number: number;
}

// =====================================================================
// 4. USER RESPONSE INTERFACE - Maps to 'user_responses' table
// =====================================================================
export interface UserResponse {
  user_session_id: string;
  response_category: string; // 'demographic' | 'fpm_selection' | 'concern' | 'preference'
  response_type: string; // Specific type of response
  question_asked: string;
  user_response: string;
  response_value: string; // Normalized value
  widget_used?: string;
  available_options?: string[];
  step_in_flow: string;
  is_initial_response: boolean;
  previous_response_id?: string; // If updating previous response
}

// =====================================================================
// 5. FPM INTERACTION INTERFACE - Maps to 'fpm_interactions' table
// =====================================================================
export interface FPMInteraction {
  user_session_id: string;
  fmp_flow_type: string; // 'prevent_pregnancy' | 'get_pregnant' | 'change_fpm' | 'stop_fpm' | 'fpm_concerns'
  current_fmp_method?: string;
  interested_fmp_method?: string;
  fmp_duration_preference?: string;
  contraception_type?: string; // 'Emergency' | 'Prevent in future'
  emergency_product?: string; // 'Postpill' | 'Postinor-2'
  prevention_duration?: string; // 'Up to 1 year' | '1-2 years' | etc.
  selected_method?: string;
  satisfaction_level?: string;
  switch_reason?: string;
  stop_reason?: string;
  important_factors?: string[];
  kids_in_future?: string; // 'Yes' | 'No'
  timing_preference?: string;
  menstrual_flow_preference?: string;
  sex_enhancement_type?: string; // 'Gels and Lubricants' | 'Hard Erection'
  erectile_dysfunction_option?: string; // 'Lifestyle changes' | 'Natural remedies' | etc.
  lubricant_selected?: string; // 'Fiesta Intim Gel' | 'KY Jelly'
  provided_information?: string;
  next_action?: string;
  clinic_referral_needed: boolean;
  human_agent_requested: boolean;
}

// =====================================================================
// 6. CLINIC REFERRAL INTERFACE - Maps to 'user_clinic_referrals' table
// =====================================================================
export interface ClinicReferral {
  user_session_id: string;
  clinic_id: string;
  referral_reason: string;
  user_concern: string;
  recommended_service: string;
  follow_up_needed: boolean;
}

// =====================================================================
// 7. CONVERSATION ANALYTICS INTERFACE - Maps to 'conversation_analytics' table
// =====================================================================
export interface ConversationAnalytics {
  user_session_id: string;
  steps_completed: string[];
  widgets_interacted_with: string[];
  flows_attempted: string[];
  total_user_messages: number;
  total_bot_messages: number;
  total_button_clicks: number;
  total_typed_responses: number;
  session_abandonment_point?: string;
  information_provided: string[];
  goals_achieved: string[];
  unresolved_concerns: string[];
  satisfaction_rating?: number; // 1-5
  average_response_time_seconds?: number;
  errors_encountered: string[];
}

// =====================================================================
// 8. RESPONSE TYPE CONSTANTS - For consistent categorization
// =====================================================================
export const RESPONSE_CATEGORIES = {
  DEMOGRAPHIC: 'demographic',
  FPM_SELECTION: 'fpm_selection',
  CONCERN: 'concern',
  PREFERENCE: 'preference',
  MEDICAL: 'medical',
  SATISFACTION: 'satisfaction',
  REFERRAL: 'referral',
  SEX_ENHANCEMENT: 'sex_enhancement',
  ERECTILE_DYSFUNCTION: 'erectile_dysfunction',
  LUBRICANT_SELECTION: 'lubricant_selection',
} as const;

export const RESPONSE_TYPES = {
  // Demographic responses
  LANGUAGE_SELECTION: 'language_selection',
  GENDER_SELECTION: 'gender_selection',
  STATE_SELECTION: 'state_selection',
  LGA_SELECTION: 'lga_selection',
  AGE_SELECTION: 'age_selection',
  MARITAL_STATUS_SELECTION: 'marital_status_selection',

  // FPM related responses
  FPM_METHOD_SELECTION: 'fpm_method_selection',
  CONTRACEPTION_TYPE_SELECTION: 'contraception_type_selection',
  EMERGENCY_PRODUCT_SELECTION: 'emergency_product_selection',
  PREVENTION_DURATION_SELECTION: 'prevention_duration_selection',
  CURRENT_FPM_SELECTION: 'current_fpm_selection',

  // Concern/preference responses
  FPM_CONCERN_SELECTION: 'fpm_concern_selection',
  FPM_CONCERN_TYPES_SELECTION: 'fpm_concern_types_selection',
  SATISFACTION_ASSESSMENT: 'satisfaction_assessment',
  SWITCH_REASON_SELECTION: 'switch_reason_selection',
  STOP_REASON_SELECTION: 'stop_reason_selection',
  IMPORTANT_FACTORS_SELECTION: 'important_factors_selection',
  TIMING_SELECTION: 'timing_selection',
  MENSTRUAL_FLOW_PREFERENCE: 'menstrual_flow_preference',

  // Sex enhancement responses - NEW
  SEX_ENHANCEMENT_TYPE_SELECTION: 'sex_enhancement_type_selection',
  LUBRICANT_SELECTION: 'lubricant_selection',
  ERECTILE_DYSFUNCTION_OPTION_SELECTION:
    'erectile_dysfunction_option_selection',

  // Action responses
  AGENT_TYPE_SELECTION: 'agent_type_selection',
  NEXT_ACTION_SELECTION: 'next_action_selection',
  MORE_HELP_SELECTION: 'more_help_selection',
  CLINIC_REFERRAL_REQUEST: 'clinic_referral_request',
  FPM_NEXT_ACTION_SELECTION: 'fpm_next_action_selection', // NEW
  SEX_ENHANCEMENT_NEXT_ACTION_SELECTION:
    'sex_enhancement_next_action_selection', // NEW
} as const;

// =====================================================================
// 9. COMPLETE WIDGET NAME MAPPING - FIXED ALL MISMATCHES
// =====================================================================
export const WIDGET_NAMES = {
  // Demographic widgets
  LANGUAGE_OPTIONS: 'languageOptions',
  GENDER_OPTIONS: 'genderOptions',
  STATE_OPTIONS: 'stateOptions',
  LGA_OPTIONS: 'lgaOptions',
  AGE_OPTIONS: 'ageOptions',
  MARITAL_STATUS_OPTIONS: 'maritalStatusOptions',

  // Main FPM widget
  FPM_OPTIONS: 'fpmOptions',

  // Prevent pregnancy widgets
  CONTRACEPTION_TYPE_OPTIONS: 'contraceptionTypeOptions',
  EMERGENCY_PRODUCT_OPTIONS: 'emergencyProductOptions',
  PREVENTION_DURATION_OPTIONS: 'preventionDurationOptions',
  METHOD_OPTIONS: 'methodOptions',

  // Get pregnant widgets
  GET_PREGNANT_FPM_OPTIONS: 'getPregnantFPMOptions',
  GET_PREGNANT_TRYING_DURATION_OPTIONS: 'getPregnantTryingDurationOptions',

  // Sex enhancement widgets - FIXED
  SEX_ENHANCEMENT_OPTIONS: 'sexEnhancementOptions',
  LUBRICANT_OPTIONS: 'lubricantOptions',
  ERECTILE_DYSFUNCTION_OPTIONS: 'erectileDysfunctionOptions', // NEW
  SEX_ENHANCEMENT_NEXT_ACTION_OPTIONS: 'sexEnhancementNextActionOptions', // FIXED
  NEXT_ACTION_OPTIONS: 'nextActionOptions', // Deprecated

  // FPM Change/Stop widgets
  FPM_CONCERN_OPTIONS: 'fpmConcernOptions',
  CURRENT_FPM_OPTIONS: 'currentFPMOptions',
  SWITCH_FPM_OPTIONS: 'switchFPMOptions',
  STOP_FPM_OPTIONS: 'stopFPMOptions',
  FPM_CONCERN_TYPE_OPTIONS: 'fpmConcernTypeOptions', // FIXED
  SATISFACTION_OPTIONS: 'satisfactionOptions',
  SWITCH_REASON_OPTIONS: 'switchReasonOptions',
  STOP_REASON_OPTIONS: 'stopReasonOptions',
  METHOD_RECOMMENDATION_OPTIONS: 'methodRecommendationOptions',
  KIDS_IN_FUTURE_OPTIONS: 'kidsInFutureOptions',
  TIMING_OPTIONS: 'timingOptions',
  IMPORTANT_FACTORS_OPTIONS: 'importantFactorsOptions',
  MENSTRUAL_FLOW_OPTIONS: 'menstrualFlowOptions',
  FPM_NEXT_ACTION_OPTIONS: 'fpmNextActionOptions',

  // General widgets
  AGENT_TYPE_OPTIONS: 'agentTypeOptions',
  MORE_HELP_OPTIONS: 'moreHelpOptions',
  FEEDBACK_OPTIONS: 'feedbackOptions',
  HUMAN_AI_OPTIONS: 'humanAIOptions',
} as const;

// =====================================================================
// 10. STEP NAME MAPPING - FIXED ALL MISMATCHES
// =====================================================================
export const STEP_NAMES = {
  // Demographic steps
  LANGUAGE: 'language',
  GENDER: 'gender',
  STATE: 'state',
  LGA: 'lga',
  AGE: 'age',
  MARITAL_STATUS: 'maritalStatus',

  // Main FPM step
  FPM: 'fpm',

  // Prevent pregnancy steps
  CONTRACEPTION: 'contraception',
  EMERGENCY_PRODUCT: 'emergencyProduct',
  PREVENTION_DURATION: 'preventionDuration',
  METHOD_OPTIONS: 'methodOptions',

  // Get pregnant steps
  GET_PREGNANT_FPM: 'getPregnantFPM',
  GET_PREGNANT_TRYING_DURATION: 'getPregnantTryingDuration',
  GET_PREGNANT_IUD_REMOVAL: 'getPregnantIUDRemoval',
  GET_PREGNANT_IMPLANT_REMOVAL: 'getPregnantImplantRemoval',
  GET_PREGNANT_INJECTION_STOP: 'getPregnantInjectionStop',
  GET_PREGNANT_PILLS_STOP: 'getPregnantPillsStop',
  GET_PREGNANT_NEXT_ACTION: 'getPregnantNextAction',
  GET_PREGNANT_USER_QUESTION: 'getPregnantUserQuestion',

  // Sex enhancement steps - FIXED
  SEX_ENHANCEMENT: 'sexEnhancement',
  LUBRICANT_SELECTION: 'lubricantSelection',
  ERECTILE_DYSFUNCTION: 'erectileDysfunction', // NEW
  SEX_ENHANCEMENT_NEXT_ACTION: 'sexEnhancementNextAction', // FIXED
  NEXT_ACTION: 'nextAction', // Deprecated

  // FPM Change/Stop steps
  FPM_CONCERN: 'fpmConcern',
  CURRENT_FPM: 'currentFPM',
  FPM_CONCERN_TYPE: 'fpmConcernType', // FIXED - This was the main issue
  FPM_NEXT_ACTION: 'fpmNextAction',
  SWITCH_CURRENT_FPM: 'switchCurrentFPM',
  SATISFACTION_ASSESSMENT: 'satisfactionAssessment',
  SWITCH_REASON: 'switchReason',
  METHOD_RECOMMENDATION: 'methodRecommendation',
  KIDS_IN_FUTURE: 'kidsInFuture',
  TIMING: 'timing',
  IMPORTANT_FACTORS: 'importantFactors',
  MENSTRUAL_FLOW_PREFERENCE: 'menstrualFlowPreference',
  STOP_CURRENT_FPM: 'stopCurrentFPM',
  STOP_REASON: 'stopReason',

  // General steps
  AGENT_TYPE_SELECTION: 'agentTypeSelection',
  HUMAN_AI_SELECTION: 'humanAISelection',
  USER_QUESTION: 'userQuestion',
  MORE_HELP: 'moreHelp',
  FEEDBACK: 'feedback',
  DEFAULT: 'default',
} as const;

// =====================================================================
// 11. COMPLETE EXAMPLE DATA STRUCTURES FOR EACH USER INTERACTION
// =====================================================================

// Example: Language Selection
export const createLanguageResponse = (
  language: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.DEMOGRAPHIC,
  response_type: RESPONSE_TYPES.LANGUAGE_SELECTION,
  question_asked: 'Please choose the language you want to chat with.',
  user_response: language,
  response_value: language.toLowerCase(),
  widget_used: WIDGET_NAMES.LANGUAGE_OPTIONS,
  available_options: ['English', 'Hausa', 'Yoruba'],
  step_in_flow: STEP_NAMES.LANGUAGE,
  is_initial_response: true,
});

// Example: Gender Selection
export const createGenderResponse = (
  gender: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.DEMOGRAPHIC,
  response_type: RESPONSE_TYPES.GENDER_SELECTION,
  question_asked: 'What is your gender?',
  user_response: gender,
  response_value: gender.replace(/[👨👩]/gu, '').trim(), // Remove emojis for normalized value
  widget_used: WIDGET_NAMES.GENDER_OPTIONS,
  available_options: ['Male 👨', 'Female 👩', 'Prefer not to say'],
  step_in_flow: STEP_NAMES.GENDER,
  is_initial_response: true,
});

// Example: FPM Method Selection
export const createFPMMethodResponse = (
  method: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.FPM_SELECTION,
  response_type: RESPONSE_TYPES.FPM_METHOD_SELECTION,
  question_asked: 'What do you want to know?',
  user_response: method,
  response_value: method,
  widget_used: WIDGET_NAMES.FPM_OPTIONS,
  available_options: [
    'How to get pregnant',
    'How to prevent pregnancy',
    'How to improve sex life',
    'Change/stop current FPM',
    'Ask a general question',
  ],
  step_in_flow: STEP_NAMES.FPM,
  is_initial_response: true,
});

// NEW: Sex Enhancement Type Selection
export const createSexEnhancementTypeResponse = (
  type: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.SEX_ENHANCEMENT,
  response_type: RESPONSE_TYPES.SEX_ENHANCEMENT_TYPE_SELECTION,
  question_asked: 'What would you like to focus on?',
  user_response: type,
  response_value: type,
  widget_used: WIDGET_NAMES.SEX_ENHANCEMENT_OPTIONS,
  available_options: ['Gels and Lubricants', 'Hard Erection'],
  step_in_flow: STEP_NAMES.SEX_ENHANCEMENT,
  is_initial_response: true,
});

// NEW: Lubricant Selection
export const createLubricantSelectionResponse = (
  lubricant: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.SEX_ENHANCEMENT,
  response_type: RESPONSE_TYPES.LUBRICANT_SELECTION,
  question_asked: 'Here are some recommended lubricant options:',
  user_response: lubricant,
  response_value: lubricant,
  widget_used: WIDGET_NAMES.LUBRICANT_OPTIONS,
  available_options: ['Fiesta Intim Gel', 'KY Jelly'],
  step_in_flow: STEP_NAMES.LUBRICANT_SELECTION,
  is_initial_response: true,
});

// NEW: Erectile Dysfunction Option Selection
export const createErectileDysfunctionOptionResponse = (
  option: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.SEX_ENHANCEMENT,
  response_type: RESPONSE_TYPES.ERECTILE_DYSFUNCTION_OPTION_SELECTION,
  question_asked: 'Here are some options to consider:',
  user_response: option,
  response_value: option,
  widget_used: WIDGET_NAMES.ERECTILE_DYSFUNCTION_OPTIONS,
  available_options: [
    'Lifestyle changes',
    'Natural remedies',
    'When to see a doctor',
    'Get professional help',
  ],
  step_in_flow: STEP_NAMES.ERECTILE_DYSFUNCTION,
  is_initial_response: true,
});

// FIXED: FPM Concern Type Selection
export const createFPMConcernTypeResponse = (
  concernType: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.CONCERN,
  response_type: RESPONSE_TYPES.FPM_CONCERN_TYPE_SELECTION,
  question_asked: 'What specific concern do you have with this method?',
  user_response: concernType,
  response_value: concernType,
  widget_used: WIDGET_NAMES.FPM_CONCERN_TYPE_OPTIONS,
  available_options: [
    'Effectiveness',
    'Effect on general health',
    'Convenience',
    'Price',
    'Side effects',
    'Effect on sex life',
    'Privacy in contraception',
    'I want no clinic visits',
    'Effect on fertility',
  ],
  step_in_flow: STEP_NAMES.FPM_CONCERN_TYPE,
  is_initial_response: true,
});

// Example: Emergency Product Selection
export const createEmergencyProductResponse = (
  product: string,
  sessionId: string,
): UserResponse => ({
  user_session_id: sessionId,
  response_category: RESPONSE_CATEGORIES.FPM_SELECTION,
  response_type: RESPONSE_TYPES.EMERGENCY_PRODUCT_SELECTION,
  question_asked:
    'For emergency contraception, here are the available options:',
  user_response: product,
  response_value: product,
  widget_used: WIDGET_NAMES.EMERGENCY_PRODUCT_OPTIONS,
  available_options: ['Postpill', 'Postinor-2'],
  step_in_flow: STEP_NAMES.EMERGENCY_PRODUCT,
  is_initial_response: true,
});

// =====================================================================
// 10. HELPER FUNCTIONS FOR DATA CREATION
// =====================================================================

// Create conversation message
export const createConversationMessage = (
  text: string,
  type: 'user' | 'bot',
  sessionId: string,
  step: string,
  sequence: number,
  source: 'typed' | 'button_click' | 'widget_selection' = 'typed',
  widgetName?: string,
  selectedOption?: string,
  hasWidget: boolean = false,
  widgetOptions?: string[],
): ConversationMessage => ({
  user_session_id: sessionId,
  message_text: text,
  message_type: type,
  message_source: source,
  chat_step: step,
  widget_name: widgetName,
  selected_option: selectedOption,
  has_widget: hasWidget,
  widget_options: widgetOptions,
  message_sequence_number: sequence,
});

// Create FPM interaction
export const createFPMInteraction = (
  sessionId: string,
  flowType: string,
  data: Partial<FPMInteraction>,
): FPMInteraction => ({
  user_session_id: sessionId,
  fmp_flow_type: flowType,
  clinic_referral_needed: false,
  human_agent_requested: false,
  ...data,
});

// Update user data
export const updateUserData = (
  currentData: UserData,
  updates: Partial<UserData>,
): UserData => ({
  ...currentData,
  ...updates,
});

// =====================================================================
// 13. WIDGET VALIDATION AND STEP CONSISTENCY CHECKS
// =====================================================================

// Validate widget name consistency
export const validateWidgetName = (widgetName: string): boolean => {
  return Object.values(WIDGET_NAMES).includes(widgetName as any);
};

// Validate step name consistency
export const validateStepName = (stepName: string): boolean => {
  return Object.values(STEP_NAMES).includes(stepName as any);
};

// Get widget options by widget name
export const getWidgetOptions = (widgetName: string): string[] => {
  const widgetOptionsMap: Record<string, string[]> = {
    [WIDGET_NAMES.LANGUAGE_OPTIONS]: ['English', 'Hausa', 'Yoruba'],
    [WIDGET_NAMES.GENDER_OPTIONS]: [
      'Male 👨',
      'Female 👩',
      'Prefer not to say',
    ],
    [WIDGET_NAMES.SEX_ENHANCEMENT_OPTIONS]: [
      'Gels and Lubricants',
      'Hard Erection',
    ],
    [WIDGET_NAMES.LUBRICANT_OPTIONS]: ['Fiesta Intim Gel', 'KY Jelly'],
    [WIDGET_NAMES.ERECTILE_DYSFUNCTION_OPTIONS]: [
      'Lifestyle changes',
      'Natural remedies',
      'When to see a doctor',
      'Get professional help',
    ],
    [WIDGET_NAMES.SEX_ENHANCEMENT_NEXT_ACTION_OPTIONS]: [
      'Chat with AI /Human',
      'Learn other methods',
      'Back to main menu',
      'Get more sex life tips',
    ],
    [WIDGET_NAMES.FPM_CONCERN_TYPE_OPTIONS]: [
      'Effectiveness',
      'Effect on general health',
      'Convenience',
      'Price',
      'Side effects',
      'Effect on sex life',
      'Privacy in contraception',
      'I want no clinic visits',
      'Effect on fertility',
    ],
    [WIDGET_NAMES.FPM_OPTIONS]: [
      'How to get pregnant',
      'How to prevent pregnancy',
      'How to improve sex life',
      'Change/stop current FPM',
      'Ask a general question',
    ],
    // Add more as needed...
  };

  return widgetOptionsMap[widgetName] || [];
};
// =====================================================================
// 14. DATABASE OPERATION INTERFACES
// =====================================================================

export interface DatabaseOperations {
  // User operations
  createOrUpdateUser: (userData: UserData) => Promise<void>;
  getUserBySessionId: (sessionId: string) => Promise<UserData | null>;

  // Session operations
  createChatSession: (sessionData: ChatSessionData) => Promise<string>;
  updateChatSession: (
    sessionId: string,
    updates: Partial<ChatSessionData>,
  ) => Promise<void>;

  // Conversation operations
  addConversationMessage: (message: ConversationMessage) => Promise<void>;
  getConversationHistory: (sessionId: string) => Promise<ConversationMessage[]>;

  // Response operations
  addUserResponse: (response: UserResponse) => Promise<void>;
  getUserResponses: (
    sessionId: string,
    category?: string,
  ) => Promise<UserResponse[]>;

  // FPM operations
  addFPMInteraction: (interaction: FPMInteraction) => Promise<void>;
  getFPMInteractions: (sessionId: string) => Promise<FPMInteraction[]>;

  // Clinic operations
  createClinicReferral: (referral: ClinicReferral) => Promise<void>;
  getClinicsByLocation: (state: string, lga: string) => Promise<any[]>;

  // Analytics operations
  updateAnalytics: (analytics: ConversationAnalytics) => Promise<void>;
  getAnalytics: (sessionId: string) => Promise<ConversationAnalytics | null>;

  // Validation operations
  validateWidget: (widgetName: string) => boolean;
  validateStep: (stepName: string) => boolean;
}
