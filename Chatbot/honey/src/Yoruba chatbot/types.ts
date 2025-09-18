// honey/src/chatbot/types.ts
export interface ChatMessage {
  message: string;
  type: "bot" | "user";
  id?: string;
  widget?: string;
  delay?: number;
}

export interface ChatbotState {
  messages: ChatMessage[];
  currentStep: ChatStep;
  selectedState?: string;
  selectedLGA?: string;
  currentFPMMethod?: string;
  currentConcernType?: string;
  userIntention?: string;
  selectedLanguage?: string;
  selectedGender?: string;
  selectedAge?: string;
}

export type ChatStep =
  | "language"
  | "gender"
  | "stateSelection"
  | "lgaSelection"
  | "locationInput"
  | "locationConfirm"
  | "age"
  | "marital"
  | "maritalStatus"
  | "fpm"
  | "contraception"
  | "emergencyProduct"
  | "duration"
  | "preventionDuration"
  | "methodDetails"
  | "sexEnhancement"
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
  | "moreHelp"
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
  | "agentTypeSelection"
  | "generalQuestion"
  | "userQuestion"
  | "waitingForHuman"
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
  | "default";

// FPM-related types for better type safety
export type FPMMethod =
  | "IUD"
  | "Implant"
  | "Injection / Depo-provera"
  | "Sayana Press"
  | "Daily Pill"
  | "Female sterilisation"
  | "Male sterilisation";

export type SwitchFPMMethod =
  | "IUD"
  | "Implants"
  | "Injections / Depo-provera"
  | "Sayana Press"
  | "Daily Pills"
  | "Female sterilisation"
  | "Male sterilisation";

export type StopFPMMethod =
  | "IUD"
  | "Implants"
  | "Injections / Depo-provera"
  | "Sayana Press"
  | "Daily Pills"
  | "Condoms"
  | "Emergency contraceptive"
  | "Female sterilisation"
  | "Male sterilisation";

export type FPMConcernType =
  | "Effectiveness"
  | "Effect on general health"
  | "Convenience"
  | "Price"
  | "Side effects"
  | "Effect on sex life"
  | "Privacy in contraception"
  | "I want no clinic visits"
  | "Effect on fertility";

export type SwitchReasonType =
  | "Effectiveness"
  | "Effect on general health"
  | "Convenience"
  | "Price"
  | "Side effects"
  | "Effect on sex life"
  | "Privacy in contraception"
  | "I want no clinic visits"
  | "Effect on fertility";

export type StopReasonType =
  | "Low Effectiveness"
  | "Effect on general health"
  | "Convenience"
  | "Price"
  | "Side effects"
  | "Effect on sex life"
  | "Privacy in contraception"
  | "I want no clinic visits"
  | "Effect on fertility";

export type FPMInitialConcern =
  | "Concerned about FP"
  | "Want to switch FP"
  | "Want to stop FP";

export type SatisfactionLevel = "Somewhat satisfied" | "Not satisfied";

export type KidsInFutureResponse = "Yes, I want more kids" | "No";

export type TimingOption =
  | "Less than 1 year"
  | "1-2 years"
  | "3-5 years"
  | "More than 5 years";

export type ImportantFactor =
  | "Efficiency in prevention"
  | "Should be safe to use"
  | "Be easy and convenient"
  | "Discreet from others"
  | "No pain/cramp/vomit"
  | "No weight gain"
  | "No effect on sex life"
  | "Be able have kids after"
  | "Stop without clinic"
  | "No effect on menstrual🩸";

export type MenstrualFlowPreference =
  | "No INcrease of🩸flow"
  | "No DEcrease of🩸flow";

export type FPMNextAction =
  | "Talk to AI / Human"
  | "Find nearest clinic"
  | "End this chat";

export type MethodRecommendationResponse = "Yes" | "No";
export type FeedbackOption = "Yes" | "No";

export type MoreHelpOption = "Yes, I want to ask" | "No";

export type HumanAIOption = "Human agent" | "AI chatbot";

// Get Pregnant specific types
export type GetPregnantFPMOption =
  | "No FPM now or recently"
  | "IUD"
  | "Implants"
  | "Injections / Depo-provera"
  | "Sayana Press"
  | "Daily Pills"
  | "Condoms"
  | "Emergency pills"
  | "Female sterilisation"
  | "Male sterilisation";

export type GetPregnantDuration = "Less than 1 year" | "Longer than 1 year";

export type GetPregnantRemovalStatus =
  | "Yes, more than 1 year"
  | "Yes, less than 1 year"
  | "No, I didn't remove";

export type GetPregnantImplantRemovalStatus =
  | "Longer than 3 months"
  | "Less than 3 months"
  | "No, I didn't remove";

export type GetPregnantStopStatus = "Yes" | "No";

export type GetPregnantNextAction =
  | "Ask more questions"
  | "Find nearest clinic"
  | "Back to main menu";
