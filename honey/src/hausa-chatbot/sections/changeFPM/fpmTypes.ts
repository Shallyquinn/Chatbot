import { ChatMessage, ChatbotState } from '../../types';

export type CreateChatBotMessage = (
  message: string,
  options?: Partial<ChatMessage>,
) => ChatMessage;
export type SetStateFunc = React.Dispatch<React.SetStateAction<ChatbotState>>;

export interface FPMChangeProviderInterface {
  handleFPMChangeSelection: (option: string) => void;
  handleFPMConcernSelection: (option: string) => void;
  handleCurrentFPMSelection: (method: string) => void;
  handleFPMConcernTypeSelection: (concernType: string) => void;
  handleFPMSideEffectSelection: (sideEffect: string) => void;
  handleFPMNextAction: (action: string) => void;
  handleFinalFeedback: (feedback: string) => void;
  // New handlers for switch FP flow
  handleSwitchCurrentFPMSelection: (method: string) => void;
  handleSatisfactionAssessment: (satisfaction: string) => void;
  handleSwitchReason: (reason: string) => void;
  handleMethodRecommendationInquiry: (response: string) => void;
  handleKidsInFuture: (response: string) => void;
  handleTimingSelection: (timing: string) => void;
  handleImportantFactors: (factor: string) => void;
  handleMenstrualFlowPreference: (preference: string) => void;
  // New handlers for stop FP flow
  handleStopFPMSelection: (method: string) => void;
  handleStopReason: (reason: string) => void;
}
