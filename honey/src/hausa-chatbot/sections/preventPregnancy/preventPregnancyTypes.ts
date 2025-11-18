// src/chatbot/sections/preventPregnancy/preventPregnancyTypes.ts
import { ChatMessage, ChatbotState } from "../../types";
import React from "react";

export type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>
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

// Duration options - Using Hausa display labels as actual type values
export type PreventionDuration =
  | "Har zuwa shekara 1"
  | "Shekara 1 zuwa 2"
  | "Shekara 3 zuwa 4"
  | "Shekara 5 zuwa 10"
  | "Na dindindin"
  | "Ban sani ba";

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
    case "Har zuwa shekara 1":
      return SHORT_TERM_METHODS;
    case "Shekara 1 zuwa 2":
      return [...SHORT_TERM_METHODS, "Injectables", "Implants"];
    case "Shekara 3 zuwa 4":
      return MEDIUM_TERM_METHODS;
    case "Shekara 5 zuwa 10":
      return LONG_TERM_METHODS;
    case "Na dindindin":
      return PERMANENT_METHODS;
    case "Ban sani ba":
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

// Duration options for display (using Hausa labels - these ARE the type values now)
export const PREVENTION_DURATION_OPTIONS: PreventionDuration[] = [
  "Har zuwa shekara 1",
  "Shekara 1 zuwa 2",
  "Shekara 3 zuwa 4",
  "Shekara 5 zuwa 10",
  "Na dindindin",
  "Ban sani ba",
];

/**
 * Natural language normalization function for duration input
 * Maps user-typed variations to standard PreventionDuration values (Hausa)
 * @param userInput - The raw user input string
 * @returns The normalized PreventionDuration value, or null if unrecognized
 */
export function normalizeDurationInput(
  userInput: string
): PreventionDuration | null {
  const normalized = userInput.toLowerCase().trim();

  // Direct matches (case-insensitive)
  const directMatches: Record<string, PreventionDuration> = {
    "har zuwa shekara 1": "Har zuwa shekara 1",
    "shekara 1 zuwa 2": "Shekara 1 zuwa 2",
    "shekara 3 zuwa 4": "Shekara 3 zuwa 4",
    "shekara 5 zuwa 10": "Shekara 5 zuwa 10",
    "na dindindin": "Na dindindin",
    "ban sani ba": "Ban sani ba",
    "ban sani": "Ban sani ba",
  };

  if (directMatches[normalized]) {
    return directMatches[normalized];
  }

  // Natural language variations for spontaneous typing
  if (
    normalized.includes("gajere") ||
    normalized.includes("1 shekara") ||
    normalized.includes("kadan")
  ) {
    return "Har zuwa shekara 1";
  }
  if (
    normalized.includes("1-2") ||
    normalized.includes("shekara biyu") ||
    normalized.includes("matsakaici")
  ) {
    return "Shekara 1 zuwa 2";
  }
  if (
    normalized.includes("3-4") ||
    normalized.includes("dogon lokaci") ||
    normalized.includes("shekara hudu")
  ) {
    return "Shekara 3 zuwa 4";
  }
  if (
    normalized.includes("5-10") ||
    normalized.includes("sosai") ||
    normalized.includes("shekara goma")
  ) {
    return "Shekara 5 zuwa 10";
  }
  if (
    normalized.includes("dindindin") ||
    normalized.includes("har abada") ||
    normalized.includes("kullum")
  ) {
    return "Na dindindin";
  }
  if (
    normalized.includes("ban sani") ||
    normalized.includes("ban san") ||
    normalized.includes("shakka")
  ) {
    return "Ban sani ba";
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
