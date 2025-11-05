// src/chatbot/sections/preventPregnancy/preventPregnancyTypes.ts

import { ChatMessage, ChatbotState } from '../../types';

export type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>,
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
export type ContraceptionType = 'Emergency' | 'Prevent in future';

// Emergency products
export type EmergencyProduct = 'Postpill' | 'Postinor-2';

// Prevention durations
export type PreventionDuration =
  | 'Titi di ọdun kan'
  | 'Odun kan si meji'
  | 'Mẹta si mẹrin ọdun'
  | 'ọdun marun si mẹwa'
  | 'Titilai';

// Available contraceptive methods
export type ContraceptiveMethod =
  | 'Daily pills'
  | 'Diaphragm'
  | 'Female condom'
  | 'Male condom'
  | 'Injectables'
  | 'IUD'
  | 'IUS'
  | 'Implants'
  | 'Injection / Depo-provera'
  | 'Sayana Press'
  | 'Daily Pill'
  | 'Daily Pills'
  | 'Daily pill'
  | 'Female sterilisation'
  | 'Male sterilisation';
// Duration-based method categories
export const METHOD_OPTIONS: ContraceptiveMethod[] = [
  'IUD',
  'Implants',
  'Injection / Depo-provera',
  'Sayana Press',
  'Daily Pill',
  'Female sterilisation',
  'Male sterilisation',
];
// Duration-based method categories
export const SHORT_TERM_METHODS: ContraceptiveMethod[] = [
  'Daily pills',
  'Diaphragm',
  'Female condom',
  'Male condom',
];

export const MEDIUM_TERM_METHODS: ContraceptiveMethod[] = [
  'Injectables',
  'IUD',
  'IUS',
];

export const LONG_TERM_METHODS: ContraceptiveMethod[] = [
  'Implants',
  'IUD',
  'IUS',
];

export const PERMANENT_METHODS: ContraceptiveMethod[] = [
  'Female sterilisation',
  'Male sterilisation',
];

// Options arrays for widgets
export const CONTRACEPTION_TYPE_OPTIONS: ContraceptionType[] = [
  'Emergency',
  'Prevent in future',
];

export const EMERGENCY_PRODUCT_OPTIONS: EmergencyProduct[] = [
  'Postpill',
  'Postinor-2',
];

export const PREVENTION_DURATION_OPTIONS: PreventionDuration[] = [
  'Titi di ọdun kan',
  'Odun kan si meji',
  'Mẹta si mẹrin ọdun',
  'ọdun marun si mẹwa',
  'Titilai',
];

// Method options based on duration selection
export const getMethodOptionsForDuration = (
  duration: PreventionDuration,
): ContraceptiveMethod[] => {
  switch (duration) {
    case 'Titi di ọdun kan':
      return SHORT_TERM_METHODS;
    case 'Odun kan si meji':
      return [...SHORT_TERM_METHODS, 'Injectables'];
    case 'Mẹta si mẹrin ọdun':
      return [...MEDIUM_TERM_METHODS, 'Implants'];
    case 'ọdun marun si mẹwa':
      return LONG_TERM_METHODS;
    case 'Titilai':
      return PERMANENT_METHODS;
    default:
      return SHORT_TERM_METHODS;
  }
};
