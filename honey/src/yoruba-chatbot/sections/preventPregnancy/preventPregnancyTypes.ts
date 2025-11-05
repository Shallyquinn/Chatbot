// src/chatbot/sections/preventPregnancy/preventPregnancyTypes.ts
import { ChatMessage, ChatbotState } from '../../types';
import React from 'react';

export type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>,
) => ChatMessage;

export type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

// Method information interface
export interface ProductDetail {
  description: string;
  advantages?: string[];
  usage?: string;
  hasAudioOption?: boolean;
  hasVideoOption?: boolean;
  audioPrompt?: string;
  videoPrompt?: string;
  procedure?: string;
  recovery?: string;
}

export interface MethodInfo {
  name: string;
  description: string;
  whoCanUse?: string[];
  whoCannotUse?: string[];
  advantages?: string[];
  disadvantages?: string[];
  sideEffects?: string[];
  requiresMedicalCheck?: boolean;
  products?: string[];
  hasAudioOption?: boolean;
  hasVideoOption?: boolean;
  imageWidget?: string;
  imagePrompt?: string;
  audioWidget?: string;
  audioPrompt?: string;
  productDetails?: { [key: string]: ProductDetail };
}

export interface PreventPregnancyProviderInterface {
  // Main flow handlers
  handleEmergencyContraception: () => void;
  handleEmergencyProductSelection: (product: EmergencyProduct) => Promise<void>;
  handleFuturePreventionFlow: () => void;
  handleDurationSelection: (duration: PreventionDuration) => void;
  handleMethodSelection: (method: ContraceptiveMethod) => void;
  handleDailyPillsSelection: () => void;
  handleInjectableSelection: () => void;
  handleImplantSelection: () => void;
  handleIUDSelection: () => void;
  handleIUSSelection: () => void;
  handleTubalLigationSelection: () => void;
  handleVasectomySelection: () => void;
  handleMedicalCheck: () => void;
  handleAudioOption: () => void;
  handleVideoOption: () => void;
  handleClinicReferral: () => void;
  handleOtherMethodsRequest: () => void;
  handleMethodOptionsSelection: (method: string) => void;

  // Task 5: Product information flow handlers
  handleProductDetailSelection: (choice: string) => void;
  handleLearnOtherMethods: (answer: string) => void;

  // Product selection handlers
  // Removed duplicate declaration

  // Common action handlers
}

// Main types
export type ContraceptionType = "Emergency" | "Prevent in future";

// Duration options - Using display labels as actual type values (matches WhatsApp)
export type PreventionDuration =
  | "Up to 1 year"
  | "1 - 2 years"
  | "3 - 4 years"
  | "5 - 10 years"
  | "Permanently"
  | "Not sure";

// Natural language normalization function is defined below after array constants

// Method categories
export type ContraceptiveMethod =
  | "Emergency pills"
  | "Daily pills"
  | "Diaphragm"
  | "Female condom"
  | "Male condom"
  | "Injectables"
  | "Implants"
  | "IUS"
  | "IUD"
  | "Tubal ligation"
  | "Vasectomy";

// Product types
export type EmergencyProduct = "Postpill" | "Postinor2";

// Duration-based method categories
export const SHORT_TERM_METHODS: ContraceptiveMethod[] = [
  "Daily pills",
  "Diaphragm",
  "Female condom",
  "Male condom",
];

export const MEDIUM_TERM_METHODS: ContraceptiveMethod[] = [
  "Injectables",
  "IUD",
  "IUS",
];

export const LONG_TERM_METHODS: ContraceptiveMethod[] = [
  "Implants",
  "IUD",
  "IUS",
];

export const PERMANENT_METHODS: ContraceptiveMethod[] = [
  "Tubal ligation",
  "Vasectomy",
];

export const getMethodOptionsForDuration = (
  duration: PreventionDuration
): ContraceptiveMethod[] => {
  switch (duration) {
    case "Up to 1 year":
      return SHORT_TERM_METHODS;
    case "1 - 2 years":
      return [...SHORT_TERM_METHODS, "Injectables", "Implants"];
    case "3 - 4 years":
      return MEDIUM_TERM_METHODS;
    case "5 - 10 years":
      return LONG_TERM_METHODS;
    case "Permanently":
      return PERMANENT_METHODS;
    case "Not sure":
      // When not sure, return all methods grouped by category
      return [];
    default:
      return [
        ...SHORT_TERM_METHODS,
        ...MEDIUM_TERM_METHODS,
        ...LONG_TERM_METHODS,
        ...PERMANENT_METHODS,
      ];
  }
};

// Options arrays for widgets
export const CONTRACEPTION_TYPE_OPTIONS: ContraceptionType[] = [
  "Emergency",
  "Prevent in future",
];

export const EMERGENCY_PRODUCT_OPTIONS: EmergencyProduct[] = [
  "Postpill",
  "Postinor2",
];

// Duration options for display (using WhatsApp labels - these ARE the type values now)
export const PREVENTION_DURATION_OPTIONS: PreventionDuration[] = [
  "Up to 1 year",
  "1 - 2 years",
  "3 - 4 years",
  "5 - 10 years",
  "Permanently",
  "Not sure",
];

/**
 * Natural language normalization function for duration input
 * Maps user-typed variations to standard PreventionDuration values
 * @param userInput - The raw user input string
 * @returns The normalized PreventionDuration value, or null if unrecognized
 */
export function normalizeDurationInput(
  userInput: string
): PreventionDuration | null {
  const normalized = userInput.toLowerCase().trim();

  // Direct matches (case-insensitive)
  const directMatches: Record<string, PreventionDuration> = {
    "up to 1 year": "Up to 1 year",
    "1 - 2 years": "1 - 2 years",
    "3 - 4 years": "3 - 4 years",
    "5 - 10 years": "5 - 10 years",
    permanently: "Permanently",
    "not sure": "Not sure",
    "don't know": "Not sure",
    unsure: "Not sure",
  };

  if (directMatches[normalized]) {
    return directMatches[normalized];
  }

  // Natural language variations for spontaneous typing
  if (
    normalized.includes("short") ||
    normalized.includes("1 year") ||
    normalized.includes("less than 1")
  ) {
    return "Up to 1 year";
  }
  if (
    normalized.includes("1-2") ||
    normalized.includes("couple") ||
    normalized.includes("medium")
  ) {
    return "1 - 2 years";
  }
  if (
    normalized.includes("3-4") ||
    normalized.includes("long term") ||
    normalized.includes("longer")
  ) {
    return "3 - 4 years";
  }
  if (
    normalized.includes("5-10") ||
    normalized.includes("very long") ||
    normalized.includes("extended")
  ) {
    return "5 - 10 years";
  }
  if (
    normalized.includes("permanent") ||
    normalized.includes("forever") ||
    normalized.includes("never")
  ) {
    return "Permanently";
  }
  if (
    normalized.includes("not sure") ||
    normalized.includes("unsure") ||
    normalized.includes("don't know") ||
    normalized.includes("uncertain")
  ) {
    return "Not sure";
  }

  return null; // No match found
}

export const METHOD_OPTIONS: ContraceptiveMethod[] = [
  "Emergency pills",
  "Daily pills",
  "Diaphragm",
  "Female condom",
  "Male condom",
  "Injectables",
  "Implants",
  "IUS",
  "IUD",
  "Tubal ligation",
  "Vasectomy",
];

// "Not sure" category options (from WhatsApp script)
export const NOT_SURE_CATEGORIES = [
  "3-10 years",
  "3 months",
  "Flexible methods",
  "Permanent methods",
];

export type NotSureCategory = (typeof NOT_SURE_CATEGORIES)[number];
