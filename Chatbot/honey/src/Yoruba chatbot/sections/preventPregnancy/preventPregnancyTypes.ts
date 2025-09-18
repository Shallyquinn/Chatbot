// src/chatbot/sections/preventPregnancy/preventPregnancyTypes.ts

import { ChatMessage, ChatbotState } from "../../types";

export type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>
) => ChatMessage;
export type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

export interface PreventPregnancyProviderInterface {
  handleContraceptionTypeSelection: (type: string) => void;
  handleEmergencyProductSelection: (product: string) => void;
  handlePreventionDurationSelection: (duration: string) => void;
  handleMethodOptionsSelection: (method: string) => void;
  handlePreventPregnancyInitiation: () => void;
}

// Contraception types
export type ContraceptionType = "Emergency" | "Prevent in future";

// Emergency products
export type EmergencyProduct = "Postpill" | "Postinor-2";

// Prevention durations
export type PreventionDuration = 
  | "Up to 1 year"
  | "1 - 2 years" 
  | "3 - 4 years"
  | "5 - 10 years"
  | "Permanently";

// Available contraceptive methods
export type ContraceptiveMethod = 
  | "Daily pills"
  | "Diaphragm"
  | "Female condom"
  | "Male condom"
  | "Injectables"
  | "IUD"
  | "IUS"
  | "Implants"
  | "Injection / Depo-provera"
  | "Sayana Press"
  | "Daily Pill"
  | "Daily Pills"
  | "Daily pill"
  | "Female sterilisation"
  | "Male sterilisation";
// Duration-based method categories
export const METHOD_OPTIONS: ContraceptiveMethod[] = [
    "IUD",
    "Implants",
    "Injection / Depo-provera", 
    "Sayana Press",
    "Daily Pill",
    "Female sterilisation",
    "Male sterilisation"
];
// Duration-based method categories
export const SHORT_TERM_METHODS: ContraceptiveMethod[] = [
  "Daily pills",
  "Diaphragm", 
  "Female condom",
  "Male condom"
];

export const MEDIUM_TERM_METHODS: ContraceptiveMethod[] = [
  "Injectables",
  "IUD",
  "IUS"
];

export const LONG_TERM_METHODS: ContraceptiveMethod[] = [
  "Implants",
  "IUD",
  "IUS"
];

export const PERMANENT_METHODS: ContraceptiveMethod[] = [
  "Female sterilisation",
  "Male sterilisation"
];

// Options arrays for widgets
export const CONTRACEPTION_TYPE_OPTIONS: ContraceptionType[] = [
  "Emergency",
  "Prevent in future"
];

export const EMERGENCY_PRODUCT_OPTIONS: EmergencyProduct[] = [
  "Postpill",
  "Postinor-2"
];

export const PREVENTION_DURATION_OPTIONS: PreventionDuration[] = [
  "Up to 1 year",
  "1 - 2 years",
  "3 - 4 years",
  "5 - 10 years",
  "Permanently"
];

// Method options based on duration selection
export const getMethodOptionsForDuration = (duration: PreventionDuration): ContraceptiveMethod[] => {
  switch (duration) {
    case "Up to 1 year":
      return SHORT_TERM_METHODS;
    case "1 - 2 years":
      return [...SHORT_TERM_METHODS, "Injectables"];
    case "3 - 4 years":
      return [...MEDIUM_TERM_METHODS, "Implants"];
    case "5 - 10 years":
      return LONG_TERM_METHODS;
    case "Permanently":
      return PERMANENT_METHODS;
    default:
      return SHORT_TERM_METHODS;
  }
};