// src/chatbot/sections/preventPregnancy/types.ts
// This file defines types specific to the preventPregnancy section
// Note: Common types like ChatMessage, ChatbotState are imported from ../../types

import { MediaWidgetProps } from "../../../components/mediaWidgetsConfig";

// =============================================================================
// CONTRACEPTIVE METHOD DETAILS
// =============================================================================

export interface ContraceptiveMethodDetails {
  description: string;
  imageWidget?: string;
  imagePrompt?: string;
  audioWidget?: string;
  audioPrompt?: string;
}

// =============================================================================
// PRODUCT AND EMERGENCY TYPES
// =============================================================================

export type EmergencyProduct = "postpill" | "postinor2";

export type ContraceptionType = "Emergency" | "Prevent in future";

// =============================================================================
// DURATION AND METHOD TYPES
// =============================================================================

export type PreventionDuration =
  | "short_term"
  | "medium_term"
  | "long_term"
  | "extended_term"
  | "permanent";

export type ContraceptiveMethod =
  | "daily_pills"
  | "diaphragm"
  | "female_condom"
  | "male_condom"
  | "injectables"
  | "implants"
  | "iud"
  | "ius"
  | "tubal_ligation"
  | "vasectomy";

// =============================================================================
// WIDGET PROPS
// =============================================================================

export interface MediaWidgetConfig {
  widgetName: string;
  props?: MediaWidgetProps;
}
