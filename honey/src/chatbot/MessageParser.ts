// src/chatbot/MessageParser.ts
import ActionProvider from "./ActionProvider";
import { ChatbotState, ChatMessage } from "./types";
import { v4 as uuidv4 } from "uuid";

class MessageParser {
  actionProvider: ActionProvider;
  state: ChatbotState;

  // Intent mappings for natural language understanding
  private readonly INTENT_MAPPINGS = {
    emergency: [
      "emergency",
      "emergenc",
      "urgent",
      "now",
      "asap",
      "right now",
      "immediately",
    ],
    prevent: ["prevent", "future", "later", "plan ahead", "planning"],
    negative: [
      "no",
      "nope",
      "nah",
      "not now",
      "skip",
      "pass",
      "never mind",
      "cancel",
    ],
    positive: ["yes", "yeah", "yep", "sure", "ok", "okay", "fine", "alright"],
    human: [
      "human",
      "agent",
      "person",
      "talk to someone",
      "real person",
      "staff",
      "representative",
    ],
    clinic: [
      "clinic",
      "location",
      "near me",
      "nearby",
      "find clinic",
      "where",
      "address",
    ],
  };

  constructor(actionProvider: ActionProvider, state: ChatbotState) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  /**
   * Normalize user input for consistent processing
   */
  private normalizeInput(input: string): string {
    return input.toLowerCase().trim().replace(/\s+/g, " ");
  }

  /**
   * Check if input matches any intent patterns
   */
  private matchIntent(
    input: string,
    intent: keyof typeof this.INTENT_MAPPINGS
  ): boolean {
    const normalized = this.normalizeInput(input);
    return this.INTENT_MAPPINGS[intent].some(
      (pattern) => normalized.includes(pattern) || pattern.includes(normalized)
    );
  }

  /**
   * Fuzzy match input against available options
   */
  private fuzzyMatch(input: string, options: string[]): string | null {
    const normalized = this.normalizeInput(input);

    // Exact match
    const exactMatch = options.find(
      (opt) => this.normalizeInput(opt) === normalized
    );
    if (exactMatch) return exactMatch;

    // Partial match (input contains option or option contains input)
    const partialMatch = options.find((opt) => {
      const normalizedOpt = this.normalizeInput(opt);
      return (
        normalizedOpt.includes(normalized) || normalized.includes(normalizedOpt)
      );
    });
    if (partialMatch) return partialMatch;

    // Simple Levenshtein distance for typos (max distance of 2)
    const closeMatch = options.find((opt) => {
      const normalizedOpt = this.normalizeInput(opt);
      const distance = this.levenshteinDistance(normalized, normalizedOpt);
      return distance <= 2 && distance > 0;
    });
    if (closeMatch) return closeMatch;

    return null;
  }

  /**
   * Calculate Levenshtein distance for typo tolerance
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  parse(message: string): void {
    const lowerCase = message.toLowerCase();
    const normalized = this.normalizeInput(message);

    // Get current step from the action provider's state
    const currentStep = this.actionProvider.state?.currentStep;

    console.log(
      "MessageParser - Current step:",
      currentStep,
      "Message:",
      message
    );

    switch (currentStep) {
      //Demographic steps
      case "language":
        this.actionProvider.handleLanguageSelection(message);
        break;
      case "gender":
        this.actionProvider.handleGenderSelection(message);
        break;
      case "stateSelection":
        this.actionProvider.handleStateSelection(message);
        break;
      case "lgaSelection":
        this.actionProvider.handleLGASelection(message);
        break;
      case "locationInput":
        this.actionProvider.handleLocationInput(message);
        break;
      case "locationConfirm":
        this.actionProvider.handleLocationConfirmation(message);
        break;
      case "age":
        this.actionProvider.handleAgeSelection(message);
        break;
      case "maritalStatus":
        this.actionProvider.handleMaritalStatusSelection(message);
        break;
      // Main FPM Selection
      case "fpm":
        this.actionProvider.handlePlanningMethodSelection(message);
        break;
      //prevent pregnancy flow
      case "contraception":
        this.actionProvider.handleContraceptionTypeSelection(message);
        break;
      case "emergencyProduct":
        this.actionProvider.handleEmergencyProductSelection(message);
        break;
      case "duration":
        this.actionProvider.handlePreventionDurationSelection(message);
        break;
      case "preventionDuration":
        this.actionProvider.handlePreventionDurationSelection(message);
        break;
      case "methodDetails":
        this.actionProvider.handleMethodOptionsSelection(message);
        break;
      case "sexEnhancement":
        this.actionProvider.handleSexEnhancementOptions(message);
        break;
      case "lubricantSelection":
        this.actionProvider.handleLubricantOptions(message);
        break;
      case "erectileDysfunction":
        this.actionProvider.handleErectileDysfunctionOptions(message);
        break;
      case "nextAction":
      case "sexEnhancementNextActionOptions":
        this.actionProvider.handleSexEnhancementNextAction(message);
        break;
      case "sexEnhancementNextAction": // Deprecated but keep for backwards compatibility
        this.actionProvider.handleSexEnhancementNextAction(message);
        break;
      // New FPM Change/Stop related steps
      case "fpmConcern":
        this.actionProvider.handleFPMConcernSelection(message);
        break;
      case "currentFPM":
        this.actionProvider.handleCurrentFPMSelection(message);
        break;
      case "fpmConcernType":
        this.actionProvider.handleFPMConcernTypeSelection(message);
        break;
      case "fpmNextAction":
        this.actionProvider.handleFPMNextAction(message);
        break;
      case "feedback":
        this.actionProvider.handleFinalFeedback(message);
        break;
      case "moreHelp":
        this.actionProvider.handleMoreHelpOptions(message);
        break;
      case "humanAISelection":
      case "agentTypeSelection":
        this.actionProvider.handleAgentTypeSelection(message);
        break;
      // Switch FP flow steps
      case "switchCurrentFPM":
        this.actionProvider.handleSwitchCurrentFPMSelection(message);
        break;
      case "satisfactionAssessment":
        this.actionProvider.handleSatisfactionAssessment(message);
        break;
      case "switchReason":
        this.actionProvider.handleSwitchReason(message);
        break;
      case "methodRecommendation":
        this.actionProvider.handleMethodRecommendationInquiry(message);
        break;
      case "kidsInFuture":
        this.actionProvider.handleKidsInFuture(message);
        break;
      case "timing":
        this.actionProvider.handleTimingSelection(message);
        break;
      case "importantFactors":
        this.actionProvider.handleImportantFactors(message);
        break;
      case "menstrualFlow":
        this.actionProvider.handleMenstrualFlowPreference(message);
        break;

      // Stop FP flow steps
      case "stopCurrentFPM":
        this.actionProvider.handleStopFPMSelection(message);
        break;
      case "stopReason":
        this.actionProvider.handleStopReason(message);
        break;

      // Get Pregnant related steps
      case "getPregnantIntro":
      case "getPregnantFPMSelection":
        this.actionProvider.handleGetPregnantFPMSelection(message);
        break;
      case "getPregnantTryingDuration":
        this.actionProvider.handleGetPregnantTryingDuration(message);
        break;
      case "getPregnantIUDRemoval":
        this.actionProvider.handleGetPregnantIUDRemoval(message);
        break;
      case "getPregnantImplantRemoval":
        this.actionProvider.handleGetPregnantImplantRemoval(message);
        break;
      case "getPregnantInjectionStop":
        this.actionProvider.handleGetPregnantInjectionStop(message);
        break;
      case "getPregnantPillsStop":
        this.actionProvider.handleGetPregnantPillsStop(message);
        break;
      case "getPregnantNextAction":
        this.actionProvider.handleGetPregnantNextAction(message);
        break;
      case "getPregnantUserQuestion":
        this.actionProvider.handleGetPregnantUserQuestion(message);
        break;
      // General question related steps
      case "generalQuestion":
        this.actionProvider.handleAgentTypeSelection(message);
        break;
      case "userQuestion":
        this.actionProvider.handleUserQuestion(message);
        break;
      case "waitingForHuman": {
        // For now, just acknowledge message while waiting for human
        const userMessage: ChatMessage = {
          message,
          type: "user",
          id: uuidv4(),
        };
        const acknowledgment = this.actionProvider.createChatBotMessage(
          "Your message has been received. A human agent will respond shortly."
        );
        this.actionProvider.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, userMessage, acknowledgment],
        }));
        break;
      }
      default:
        console.log(`Unhandled step: ${this.state.currentStep}`);
        // In default state, try to find a match for known user inputs
        if (lowerCase.includes("improve sex life")) {
          this.actionProvider.handleSexLifeImprovement();
        } else if (lowerCase.includes("prevent pregnancy")) {
          this.actionProvider.handlePlanningMethodSelection(
            "How to prevent pregnancy"
          );
        } else if (lowerCase.includes("change") && lowerCase.includes("fpm")) {
          this.actionProvider.handleFPMChangeSelection(
            "Change/stop current FPM"
          );
        } else if (lowerCase === "human" || lowerCase.includes("agent")) {
          // Handle direct request for a human agent
          const userMessage: ChatMessage = {
            message,
            type: "user",
            id: uuidv4(),
          };
          const humanMessage = this.actionProvider.createChatBotMessage(
            "You'll be connected to a human agent shortly. Please note that there might be a wait time depending on availability."
          );
          this.actionProvider.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage, humanMessage],
            currentStep: "waitingForHuman",
          }));
        } else if (lowerCase === "clinic") {
          // Handle direct request for clinic information
          const userMessage: ChatMessage = {
            message,
            type: "user",
            id: uuidv4(),
          };

          const clinicMessage = this.actionProvider.createChatBotMessage(
            "To find the nearest clinic, please share your location or enter your city/area name."
          );
          this.actionProvider.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage, clinicMessage],
            currentStep: "locationInput",
          }));
        } else if (
          lowerCase === "demographics" ||
          (lowerCase.includes("update") &&
            (lowerCase.includes("info") ||
              lowerCase.includes("details") ||
              lowerCase.includes("demographics")))
        ) {
          // Handle demographics update request
          this.actionProvider.handleDemographicsUpdate();
        } else if (
          lowerCase === "menu" ||
          lowerCase === "honey" ||
          lowerCase === "human" ||
          lowerCase === "language"
        ) {
          // Handle other keyword navigation
          this.actionProvider.handleKeywordNavigation(message);
        } else {
          console.warn(
            "Unhandled step or message:",
            this.state.currentStep,
            message
          );
          // Generic response for unhandled messages
          const userMessage: ChatMessage = {
            message,
            type: "user",
            id: uuidv4(),
          };

          const genericResponse = this.actionProvider.createChatBotMessage(
            "I'm not sure I understand. You can:\n" +
              "• Type 'menu' to see main options\n" +
              "• Type 'demographics' to update your information\n" +
              "• Type 'human' to speak with an agent\n" +
              "• Select an option from the available buttons"
          );
          this.actionProvider.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage, genericResponse],
          }));
        }
        break;
    }
  }
}

export default MessageParser;
