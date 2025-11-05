import React from 'react';
import OptionButtons from '../../../components/OptionButtons';
import { ActionProviderInterface } from '../../ActionProvider';
import { ChatbotState } from '../../types';

/**
 * FPM Change/Stop Widgets Configuration
 *
 * This file contains all widgets and configurations related to changing or stopping
 * family planning methods (FPM). It provides a centralized location for managing
 * FPM-related UI components and their options.
 */

export interface FPMWidgetProps {
  actionProvider: ActionProviderInterface;
  setState: (state: React.SetStateAction<ChatbotState>) => void;
  state: ChatbotState;
}

// =============================================================================
// CONSTANTS - Centralized option lists for easy maintenance
// =============================================================================

/**
 * Family Planning Methods - All 7 methods from CSV
 */
export const FPM_METHODS = [
  'IUD',
  'Implant',
  'Injection / Depo-provera',
  'Sayana Press',
  'Daily Pill',
  'Female sterilisation',
  'Male sterilisation',
] as const;

/**
 * Switch FPM Methods - Methods for switch flow
 */
export const SWITCH_FPM_METHODS = [
  'IUD',
  'Implants',
  'Injections / Depo-provera',
  'Sayana Press',
  'Daily Pills',
  'Female sterilisation',
  'Male sterilisation',
] as const;

/**
 * Stop FPM Methods - Methods for stop flow (includes additional options)
 */
export const STOP_FPM_METHODS = [
  'IUD',
  'Implants',
  'Injections / Depo-provera',
  'Sayana Press',
  'Daily Pills',
  'Condoms',
  'Emergency contraceptive',
  'Female sterilisation',
  'Male sterilisation',
] as const;

/**
 * FPM Concern Types - All 9 concern categories from CSV
 */
export const FPM_CONCERN_TYPES = [
  'Effectiveness',
  'Effect on general health',
  'Convenience',
  'Price',
  'Side effects',
  'Effect on sex life',
  'Privacy in contraception',
  'I want no clinic visits',
  'Effect on fertility',
] as const;

/**
 * Initial FPM Concerns - The three main paths users can take
 */
export const FPM_INITIAL_CONCERNS = [
  'Concerned about FP',
  'Want to switch FP',
  'Want to stop FP',
] as const;

/**
 * Satisfaction Assessment Options
 */
export const SATISFACTION_OPTIONS = [
  'Somewhat satisfied',
  'Not satisfied',
] as const;

/**
 * Switch Reason Options
 */
export const SWITCH_REASON_OPTIONS = [
  'Effectiveness',
  'Effect on general health',
  'Convenience',
  'Price',
  'Side effects',
  'Effect on sex life',
  'Privacy in contraception',
  'I want no clinic visits',
  'Effect on fertility',
] as const;

/**
 * Stop Reason Options
 */
export const STOP_REASON_OPTIONS = [
  'Low Effectiveness',
  'Effect on general health',
  'Convenience',
  'Price',
  'Side effects',
  'Effect on sex life',
  'Privacy in contraception',
  'I want no clinic visits',
  'Effect on fertility',
] as const;

/**
 * Method Recommendation Options
 */
export const METHOD_RECOMMENDATION_OPTIONS = ['Yes', 'No'] as const;

/**
 * Kids in Future Options
 */
export const KIDS_IN_FUTURE_OPTIONS = ['Yes, I want more kids', 'No'] as const;

/**
 * Timing Options
 */
export const TIMING_OPTIONS = [
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  'More than 5 years',
] as const;

/**
 * Important Factors Options
 */
export const IMPORTANT_FACTORS_OPTIONS = [
  'Efficiency in prevention',
  'Should be safe to use',
  'Be easy and convenient',
  'Discreet from others',
  'No pain/cramp/vomit',
  'No weight gain',
  'No effect on sex life',
  'Be able have kids after',
  'Stop without clinic',
  'No effect on menstrual🩸',
] as const;

/**
 * Menstrual Flow Options
 */
export const MENSTRUAL_FLOW_OPTIONS = [
  'No INcrease of🩸flow',
  'No DEcrease of🩸flow',
  'No change in menstrual flow',
  'Lighter or no periods',
  'Regular periods',
] as const;

/**
 * FPM Next Actions - Actions users can take after receiving guidance
 */
export const FPM_NEXT_ACTIONS = [
  'Talk to AI / Human',
  'Ask more questions',
  'Find nearest clinic',
  'End this chat',
] as const;

/**
 * Feedback Options - Simple yes/no feedback
 */
export const FEEDBACK_OPTIONS = ['Yes', 'No'] as const;

/**
 * More Help Options - Continue or end conversation
 */
export const MORE_HELP_OPTIONS = ['Yes, I want to ask', 'No'] as const;

/**
 * Human/AI Selection Options
 */
export const HUMAN_AI_OPTIONS = ['Human agent', 'AI chatbot'] as const;

// =============================================================================
// WIDGET DEFINITIONS - All FPM Change/Stop related widgets
// =============================================================================

/**
 * FPM Initial Concern Selection Widget
 * First step in the FPM change/stop flow
 */
export const fpmConcernOptionsWidget = {
  widgetName: 'fpmConcernOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...FPM_INITIAL_CONCERNS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleFPMConcernSelection(option)
      }
    />
  ),
};

/**
 * Current FPM Method Selection Widget
 * Allows users to select their current family planning method
 */
export const currentFPMOptionsWidget = {
  widgetName: 'currentFPMOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...FPM_METHODS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleCurrentFPMSelection(option)
      }
    />
  ),
};

/**
 * Switch FPM Method Selection Widget
 * For switch flow with different method options
 */
export const switchFPMOptionsWidget = {
  widgetName: 'switchFPMOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...SWITCH_FPM_METHODS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) => {
        // Store method and proceed to satisfaction assessment
        props.actionProvider.handleSwitchCurrentFPMSelection(option);
      }}
    />
  ),
};

/**
 * Stop FPM Method Selection Widget
 * For stop flow with additional method options
 */
export const stopFPMOptionsWidget = {
  widgetName: 'stopFPMOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...STOP_FPM_METHODS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleStopFPMSelection(option)
      }
    />
  ),
};

/**
 * Satisfaction Assessment Widget
 * For switch flow to assess current method satisfaction
 */
export const satisfactionOptionsWidget = {
  widgetName: 'satisfactionOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...SATISFACTION_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleSatisfactionAssessment(option)
      }
    />
  ),
};

/**
 * Switch Reason Selection Widget
 * For switch flow to understand why user wants to switch
 */
export const switchReasonOptionsWidget = {
  widgetName: 'switchReasonOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...SWITCH_REASON_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleSwitchReason(option)
      }
    />
  ),
};

/**
 * Stop Reason Selection Widget
 * For stop flow to understand why user wants to stop
 */
export const stopReasonOptionsWidget = {
  widgetName: 'stopReasonOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...STOP_REASON_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleStopReason(option)
      }
    />
  ),
};

/**
 * Method Recommendation Inquiry Widget
 * For switch flow to ask if user wants method recommendations
 */
export const methodRecommendationOptionsWidget = {
  widgetName: 'methodRecommendationOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...METHOD_RECOMMENDATION_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMethodRecommendationInquiry(option)
      }
    />
  ),
};

/**
 * Kids in Future Options Widget
 * For switch flow method recommendation assessment
 */
export const kidsInFutureOptionsWidget = {
  widgetName: 'kidsInFutureOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...KIDS_IN_FUTURE_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleKidsInFuture(option)
      }
    />
  ),
};

/**
 * Timing Options Widget
 * For switch flow when user wants kids in future
 */
export const timingOptionsWidget = {
  widgetName: 'timingOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...TIMING_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleTimingSelection(option)
      }
    />
  ),
};

/**
 * Important Factors Options Widget
 * For switch flow to determine most important factor
 */
export const importantFactorsOptionsWidget = {
  widgetName: 'importantFactorsOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...IMPORTANT_FACTORS_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleImportantFactors(option)
      }
    />
  ),
};

/**
 * Menstrual Flow Options Widget
 * For switch flow when menstrual effects are important
 */
export const menstrualFlowOptionsWidget = {
  widgetName: 'menstrualFlowOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...MENSTRUAL_FLOW_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMenstrualFlowPreference(option)
      }
    />
  ),
};

/**
 * FPM Concern Type Selection Widget
 * Specific concerns users have about their current method
 */
export const fpmConcernTypeOptionsWidget = {
  widgetName: 'fpmConcernTypeOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...FPM_CONCERN_TYPES]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleFPMConcernTypeSelection(option)
      }
    />
  ),
};

/**
 * FPM Next Action Options Widget
 * Actions users can take after receiving FPM guidance
 */
export const fpmNextActionOptionsWidget = {
  widgetName: 'fpmNextActionOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...FPM_NEXT_ACTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleFPMNextAction(option)
      }
    />
  ),
};

/**
 * Feedback Options Widget
 * Collects user feedback on service quality
 */
export const feedbackOptionsWidget = {
  widgetName: 'feedbackOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...FEEDBACK_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleFinalFeedback(option)
      }
    />
  ),
};

/**
 * More Help Options Widget
 * Determines if user wants additional assistance
 */
export const moreHelpOptionsWidget = {
  widgetName: 'moreHelpOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...MORE_HELP_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleMoreHelpOptions(option)
      }
    />
  ),
};

/**
 * Human/AI Selection Widget
 * Allows users to choose between human agent or AI chatbot
 */
export const humanAIOptionsWidget = {
  widgetName: 'humanAIOptions',
  widgetFunc: (props: FPMWidgetProps) => (
    <OptionButtons
      options={[...HUMAN_AI_OPTIONS]}
      actionProvider={props.actionProvider}
      handleClick={(option: string) =>
        props.actionProvider.handleAgentTypeSelection(option)
      }
    />
  ),
};

// =============================================================================
// WIDGET COLLECTION - All FPM widgets grouped for easy import
// =============================================================================

/**
 * Complete collection of FPM Change/Stop widgets
 * Import this array to get all FPM-related widgets
 */
export const fpmChangeStopWidgets = [
  fpmConcernOptionsWidget,
  currentFPMOptionsWidget,
  switchFPMOptionsWidget,
  stopFPMOptionsWidget,
  satisfactionOptionsWidget,
  switchReasonOptionsWidget,
  stopReasonOptionsWidget,
  methodRecommendationOptionsWidget,
  kidsInFutureOptionsWidget,
  timingOptionsWidget,
  importantFactorsOptionsWidget,
  menstrualFlowOptionsWidget,
  fpmConcernTypeOptionsWidget,
  fpmNextActionOptionsWidget,
  feedbackOptionsWidget,
  moreHelpOptionsWidget,
  humanAIOptionsWidget,
];

// =============================================================================
// UTILITY FUNCTIONS - Helper functions for FPM operations
// =============================================================================

/**
 * Validates if a given method is a valid FPM method
 */
export const isValidFPMMethod = (
  method: string,
): method is (typeof FPM_METHODS)[number] => {
  return FPM_METHODS.includes(method as (typeof FPM_METHODS)[number]);
};

/**
 * Validates if a given concern is a valid FPM concern type
 */
export const isValidFPMConcern = (
  concern: string,
): concern is (typeof FPM_CONCERN_TYPES)[number] => {
  return FPM_CONCERN_TYPES.includes(
    concern as (typeof FPM_CONCERN_TYPES)[number],
  );
};

/**
 * Gets the total number of method-concern combinations
 */
export const getTotalFPMCombinations = (): number => {
  return FPM_METHODS.length * FPM_CONCERN_TYPES.length;
};

/**
 * Generates a list of all possible method-concern combinations
 */
export const getAllFPMCombinations = (): Array<{
  method: string;
  concern: string;
}> => {
  const combinations: Array<{ method: string; concern: string }> = [];

  FPM_METHODS.forEach((method) => {
    FPM_CONCERN_TYPES.forEach((concern) => {
      combinations.push({ method, concern });
    });
  });

  return combinations;
};

// =============================================================================
// EXPORTS - Default export for easy importing
// =============================================================================

export default {
  widgets: fpmChangeStopWidgets,
  constants: {
    FPM_METHODS,
    SWITCH_FPM_METHODS,
    STOP_FPM_METHODS,
    FPM_CONCERN_TYPES,
    FPM_INITIAL_CONCERNS,
    SATISFACTION_OPTIONS,
    SWITCH_REASON_OPTIONS,
    STOP_REASON_OPTIONS,
    METHOD_RECOMMENDATION_OPTIONS,
    KIDS_IN_FUTURE_OPTIONS,
    TIMING_OPTIONS,
    IMPORTANT_FACTORS_OPTIONS,
    MENSTRUAL_FLOW_OPTIONS,
    FPM_NEXT_ACTIONS,
    FEEDBACK_OPTIONS,
    MORE_HELP_OPTIONS,
    HUMAN_AI_OPTIONS,
  },
  utils: {
    isValidFPMMethod,
    isValidFPMConcern,
    getTotalFPMCombinations,
    getAllFPMCombinations,
  },
};
