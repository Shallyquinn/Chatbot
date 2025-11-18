// src/chatbot/sections/preventPregnancy/index.ts

export {
  preventPregnancyWidgets,
  contraceptionTypeOptionsWidget,
  emergencyProductOptionsWidget,
  preventionDurationOptionsWidget,
  shortTermMethodsWidget,
  mediumTermMethodsWidget,
  longTermMethodsWidget,
  extendedLongTermMethodsWidget,
  permanentMethodsWidget,
  learnMoreMethodsWidget,
  flowEndOptionsWidget, // Phase 3.2: Navigation widget
  comparisonActionsWidget, // Phase 3.3: Comparison widget
} from "./preventPregnancyWidgetsConfig";

export { default as PreventPregnancyActionProvider } from "./preventPregnancyActionProvider";
export type { PreventPregnancyProviderInterface } from "./preventPregnancyTypes";

export {
  CONTRACEPTION_TYPE_OPTIONS,
  EMERGENCY_PRODUCT_OPTIONS,
  PREVENTION_DURATION_OPTIONS,
  SHORT_TERM_METHODS,
  MEDIUM_TERM_METHODS,
  LONG_TERM_METHODS,
  PERMANENT_METHODS,
  getMethodOptionsForDuration,
} from "./preventPregnancyTypes";
