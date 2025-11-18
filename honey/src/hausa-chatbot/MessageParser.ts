// src/chatbot/MessageParser.ts
import ActionProvider from "./ActionProvider";
import { ChatbotState, ChatMessage } from "./types";
import { v4 as uuidv4 } from "uuid";
// Phase 3: Import utilities for confusion detection and message formatting
import { ConfusionDetector } from "./utils/ConfusionDetector";
import { MessageFormatter } from "./utils/MessageFormatter";

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

  /**
   * Save user message with detected intent to server
   * Tracks message parsing for analytics and debugging
   */
  private async saveUserMessage(
    message: string,
    currentStep: string,
    detectedIntent?: string
  ): Promise<void> {
    try {
      // Ensure chat session exists
      await this.actionProvider.ensureChatSession();

      // Get next sequence number from action provider
      const messageSequenceNumber = this.actionProvider.getNextSequenceNumber();

      // Log parsed message to conversations table
      await this.actionProvider.api.createConversation({
        message_text: message,
        message_type: "user",
        chat_step: `parsed_${currentStep}`,
        message_sequence_number: messageSequenceNumber,
        detected_intent: detectedIntent,
        widget_name: undefined,
        message_delay_ms: 0,
      });

      console.log(
        `MessageParser: Saved user message for step "${currentStep}" with intent "${
          detectedIntent || "none"
        }"`
      );
    } catch (error) {
      console.error("MessageParser: Failed to save user message:", error);
      // Don't throw - allow parsing to continue even if logging fails
    }
  }

  /**
   * Send user question to AI model (Replit integration)
   * Maps 'message' to 'text' as expected by Replit API
   */
  private async sendToAIModel(text: string): Promise<string> {
    try {
      const REPLIT_API_ENDPOINT =
        "https://firsthand-composed-piracy-honeyandbananac.replit.app/answer/";

      console.log("Sending question to AI model:", text);

      const response = await fetch(REPLIT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memory: {
            user: text, // ← Using 'memory.user' as expected by Replit API
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("AI model response:", data);

      // Handle special outputs from Replit API
      const responseText =
        data.response ||
        "I received your question but could not generate a response.";

      // Check for special outputs
      if (responseText === "NO ANSWER") {
        return 'I\'m sorry, I can only answer questions about family planning and sexual health. Please ask a related question or type "human" to speak with an agent.';
      }

      if (responseText === "COMPLETE") {
        return "Thank you for chatting with me! If you have more questions later, I'm here to help. Have a great day!";
      }

      return responseText;
    } catch (error) {
      console.error("Failed to get AI response:", error);
      return "I'm sorry, I'm having trouble processing your question right now. Please try again or type \"human\" to speak with an agent.";
    }
  }

  /**
   * Handle AI-powered questions using Replit model
   * Creates user message, gets AI response, and updates chat
   */
  private async handleAIQuestion(
    text: string,
    currentStep: string
  ): Promise<void> {
    // Create user message
    const userMessage: ChatMessage = {
      message: text,
      type: "user",
      id: uuidv4(),
    };

    // Add user message to chat immediately
    this.actionProvider.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // Show loading indicator
    const loadingMessage = this.actionProvider.createChatBotMessage(
      "Thinking...",
      { loading: true }
    );

    this.actionProvider.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }));

    try {
      // Log user question to database
      await this.actionProvider.ensureChatSession();
      await this.actionProvider.api
        .createConversation({
          message_text: text,
          message_type: "user",
          chat_step: currentStep,
          message_sequence_number: this.actionProvider.getNextSequenceNumber(),
          detected_intent: "ai_question",
          widget_name: undefined,
          message_delay_ms: 0,
        })
        .catch((err) => console.error("Failed to log user question:", err));

      // Get AI response
      const aiResponse = await this.sendToAIModel(text);

      // Remove loading message and add AI response
      const responseMessage =
        this.actionProvider.createChatBotMessage(aiResponse);

      this.actionProvider.setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages.filter((m) => m !== loadingMessage),
          responseMessage,
        ],
      }));

      // Log AI response to database
      await this.actionProvider.api
        .createConversation({
          message_text: aiResponse,
          message_type: "bot",
          chat_step: currentStep,
          message_sequence_number: this.actionProvider.getNextSequenceNumber(),
          widget_name: undefined,
          message_delay_ms: 0,
        })
        .catch((err) => console.error("Failed to log AI response:", err));

      // Track analytics
      await this.actionProvider.api
        .createResponse({
          response_category: "AIQuestion",
          response_type: "ai_generated",
          question_asked: text,
          user_response: aiResponse,
          widget_used: "ai_model",
          step_in_flow: currentStep,
        })
        .catch((err) =>
          console.error("Failed to log response analytics:", err)
        );
    } catch (error) {
      console.error("Error handling AI question:", error);

      // Remove loading message and show error
      const errorMessage = this.actionProvider.createChatBotMessage(
        "I'm sorry, I couldn't process your question. Please try again or type \"human\" to speak with an agent."
      );

      this.actionProvider.setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages.filter((m) => m !== loadingMessage),
          errorMessage,
        ],
      }));
    }
  }

  parse(message: string): void {
    // Map 'message' to 'text' for Replit API compatibility
    const text = message;

    const lowerCase = message.toLowerCase();

    // Get current step from the action provider's state
    const currentStep = this.actionProvider.state?.currentStep;

    console.log(
      "MessageParser - Current step:",
      currentStep,
      "Message:",
      message
    );

    // Phase 3: Confusion Detection - Check if user needs help before processing
    if (currentStep && ConfusionDetector.isStrictButtonStep(currentStep)) {
      const previousInputs = this.state.messages
        .filter((msg: ChatMessage) => msg.type === 'user')
        .slice(-3)
        .map((msg: ChatMessage) => msg.message);

      const confusionResult = ConfusionDetector.detect(
        message,
        currentStep,
        'button',
        previousInputs
      );

      if (confusionResult.isConfused && confusionResult.confidence > 0.6) {
        // User is confused - provide contextual help
        const helpMessage = ConfusionDetector.getHelpMessage(confusionResult, currentStep);
        const formattedHelp = MessageFormatter.formatWarning(helpMessage);
        
        this.actionProvider.showHelpMessage(formattedHelp);
        
        // Track confusion for analytics (use userSessionId from localStorage)
        const userSessionId = localStorage.getItem('userSessionId') || 'default-session';
        ConfusionDetector.trackConfusion(userSessionId, confusionResult);
        
        console.log('Confusion detected:', confusionResult.reason, 'Confidence:', confusionResult.confidence);
        return; // Stop processing - wait for corrected input
      }
    }

    // Detect intent for logging purposes
    let detectedIntent: string | undefined;
    if (lowerCase.includes("prevent pregnancy")) {
      detectedIntent = "prevent_pregnancy";
    } else if (lowerCase.includes("change") && lowerCase.includes("fpm")) {
      detectedIntent = "change_fpm";
    } else if (lowerCase.includes("improve sex life")) {
      detectedIntent = "sex_enhancement";
    } else if (lowerCase === "human" || lowerCase.includes("agent")) {
      detectedIntent = "human_agent_request";
    } else if (lowerCase === "clinic" || lowerCase.includes("clinic")) {
      detectedIntent = "clinic_location";
    } else if (
      lowerCase === "demographics" ||
      (lowerCase.includes("update") && lowerCase.includes("info"))
    ) {
      detectedIntent = "demographics_update";
    }

    // Save user message with detected intent for analytics
    this.saveUserMessage(message, currentStep || "default", detectedIntent);

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
      case "sexEnhancementNextAction": // Handles both nextAction and sexEnhancementNextAction steps
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
        // Send to AI model for free-form questions
        this.handleAIQuestion(text, currentStep || "userQuestion");
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
        if (lowerCase.includes("inganta rayuwar jima'i (sex life)")) {
          this.actionProvider.handleSexLifeImprovement();
        } else if (lowerCase.includes("yadda ake ɗaukar ciki")) {
          this.actionProvider.handlePlanningMethodSelection(
            "Yadda ake ɗaukar ciki"
          );
        } else if (lowerCase.includes("sauya") && lowerCase.includes("fpm")) {
          this.actionProvider.handleFPMChangeSelection(
            "Sauya/dakatar da hanyar Tsarin Iyali da ake amfani dashi a yanzu "
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
          lowerCase === "language" ||
          lowerCase === "harshe" // Hausa word for "language"
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
            "Ban gane ba. Zaka iya:\n" +
              "• Rubuta 'menu' don ganin zaɓuɓɓukan asali\n" +
              "• Rubuta 'demographics' don sabunta bayananku\n" +
              "• Rubuta 'human' don magana da wakili\n" +
              "• Zaɓi zaɓi daga maɓallan da ake samu"
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
