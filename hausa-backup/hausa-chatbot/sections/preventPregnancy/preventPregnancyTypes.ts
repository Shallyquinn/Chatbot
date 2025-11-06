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

  // Product selection handlers
  // Removed duplicate declaration

  // Common action handlers
}

// Main types
export type ContraceptionType = 'Emergency' | 'Prevent in future';

// Duration options
export type PreventionDuration =
  | 'short_term' // Up to 1 year
  | 'medium_term' // 1-2 years
  | 'long_term' // 3-4 years
  | 'extended_term' // 5-10 years
  | 'permanent'; // Permanent methods

// Method categories
export type ContraceptiveMethod =
  | 'emergency_pills'
  | 'daily_pills'
  | 'diaphragm'
  | 'female_condom'
  | 'male_condom'
  | 'injectables'
  | 'implants'
  | 'ius'
  | 'iud'
  | 'tubal_ligation'
  | 'vasectomy';

// Product types
export type EmergencyProduct = 'postpill' | 'postinor2';

// Duration-based method categories
export const SHORT_TERM_METHODS: ContraceptiveMethod[] = [
  'daily_pills',
  'diaphragm',
  'female_condom',
  'male_condom',
];

export const MEDIUM_TERM_METHODS: ContraceptiveMethod[] = [
  'injectables',
  'iud',
  'ius',
];

export const LONG_TERM_METHODS: ContraceptiveMethod[] = [
  'implants',
  'iud',
  'ius',
];

export const PERMANENT_METHODS: ContraceptiveMethod[] = [
  'tubal_ligation',
  'vasectomy',
];

export const getMethodOptionsForDuration = (
  duration: PreventionDuration,
): ContraceptiveMethod[] => {
  switch (duration) {
    case 'short_term':
      return SHORT_TERM_METHODS;
    case 'medium_term':
      return [...SHORT_TERM_METHODS, 'injectables'];
    case 'long_term':
      return MEDIUM_TERM_METHODS;
    case 'extended_term':
      return LONG_TERM_METHODS;
    case 'permanent':
      return PERMANENT_METHODS;
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
  'Emergency',
  'Prevent in future'
];

export const EMERGENCY_PRODUCT_OPTIONS: EmergencyProduct[] = [
  'postpill',
  'postinor2',
];

export const PREVENTION_DURATION_OPTIONS: PreventionDuration[] = [
  'short_term',
  'medium_term',
  'long_term',
  'extended_term',
  'permanent',
];

export const METHOD_OPTIONS: ContraceptiveMethod[] = [
  'emergency_pills',
  'daily_pills',
  'diaphragm',
  'female_condom',
  'male_condom',
  'injectables',
  'implants',
  'ius',
  'iud',
  'tubal_ligation',
  'vasectomy',
];
