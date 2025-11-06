// ConfusionDetector.ts - Detects when users are confused and need help

export interface ConfusionPattern {
  pattern: RegExp;
  weight: number; // Higher = more likely confused
  reason: string;
}

export interface ConfusionDetectionResult {
  isConfused: boolean;
  confidence: number; // 0-1
  reason: string;
  suggestedAction: "restart" | "guide" | "clarify" | "none";
}

export class ConfusionDetector {
  private static confusionPatterns: ConfusionPattern[] = [
    // Greeting patterns (user trying to restart)
    {
      pattern: /^(hi|hello|hey|heya|sup|yo)$/i,
      weight: 0.8,
      reason: "User attempted greeting",
    },

    // Very short/minimal responses
    {
      pattern: /^(hmn|hm|hmm|uh|uhm|ok|k)$/i,
      weight: 0.7,
      reason: "Minimal response",
    },
    { pattern: /^.{1,2}$/i, weight: 0.6, reason: "Very short response" },

    // Simple yes/no when not expected
    {
      pattern: /^(yes|no|yep|nope|yeah|nah)$/i,
      weight: 0.5,
      reason: "Simple yes/no",
    },

    // Numbers when buttons expected
    { pattern: /^[0-9]+$/, weight: 0.9, reason: "Number instead of button" },
    { pattern: /^[1-9]\s*\./, weight: 0.9, reason: "Numbered list response" },

    // Confusion expressions
    {
      pattern: /^(what|huh|idk|dunno|confused)/i,
      weight: 0.95,
      reason: "Explicit confusion",
    },
    { pattern: /\?{2,}/, weight: 0.8, reason: "Multiple question marks" },

    // Help requests
    {
      pattern: /(help|assist|stuck|lost|back|restart)/i,
      weight: 0.9,
      reason: "Help requested",
    },

    // Repeated same input
    { pattern: /^(.+?)\1{2,}$/, weight: 0.7, reason: "Repeated text" },
  ];

  /**
   * Detect if user is confused based on their message and context
   */
  static detect(
    userMessage: string,
    currentStep: string,
    expectedInputType: "button" | "text" | "location",
    previousInputs: string[] = []
  ): ConfusionDetectionResult {
    const message = userMessage.trim();

    // Check for repeated inputs (user stuck in loop)
    const isRepeated =
      previousInputs.slice(-3).filter((input) => input === message).length > 1;
    if (isRepeated) {
      return {
        isConfused: true,
        confidence: 0.9,
        reason: "User repeated same input",
        suggestedAction: "clarify",
      };
    }

    // Check confusion patterns
    let totalWeight = 0;
    let matchedReasons: string[] = [];

    for (const { pattern, weight, reason } of this.confusionPatterns) {
      if (pattern.test(message)) {
        totalWeight += weight;
        matchedReasons.push(reason);
      }
    }

    // Higher weight if expecting button but got free text
    if (expectedInputType === "button" && message.length > 3) {
      // Check if message doesn't match any valid option
      const buttonSteps = [
        "contraception",
        "emergencyProduct",
        "duration",
        "demographics",
      ];
      if (buttonSteps.some((step) => currentStep.includes(step))) {
        totalWeight += 0.6;
        matchedReasons.push("Free text in button step");
      }
    }

    // Calculate confidence (normalize to 0-1)
    const confidence = Math.min(1, totalWeight);
    const isConfused = confidence > 0.5;

    // Determine suggested action
    let suggestedAction: ConfusionDetectionResult["suggestedAction"] = "none";
    if (confidence > 0.8) {
      suggestedAction = "restart";
    } else if (confidence > 0.6) {
      suggestedAction = "clarify";
    } else if (confidence > 0.5) {
      suggestedAction = "guide";
    }

    return {
      isConfused,
      confidence,
      reason: matchedReasons.join(", "),
      suggestedAction,
    };
  }

  /**
   * Get help message based on confusion type
   */
  static getHelpMessage(
    detectionResult: ConfusionDetectionResult,
    currentStep: string
  ): string {
    switch (detectionResult.suggestedAction) {
      case "restart":
        return "I notice you might want to start over. Let me help! 😊\n\nWould you like to return to the main menu?";

      case "clarify":
        return "I'm here to help! 👋\n\nPlease use the buttons below to make your selection. This helps me understand your needs better.";

      case "guide":
        if (
          currentStep.includes("button") ||
          currentStep.includes("selection")
        ) {
          return "👇 Please tap one of the buttons below to continue. I can't process free text at this step.";
        }
        return "I didn't quite understand that. Could you please try again?";

      default:
        return "Is there something I can help clarify? 😊";
    }
  }

  /**
   * Track confusion events per session
   */
  static trackConfusion(
    sessionId: string,
    detectionResult: ConfusionDetectionResult
  ): void {
    const storageKey = `confusion_events_${sessionId}`;
    const existing = localStorage.getItem(storageKey);
    const events = existing ? JSON.parse(existing) : [];

    events.push({
      timestamp: new Date().toISOString(),
      confidence: detectionResult.confidence,
      reason: detectionResult.reason,
      action: detectionResult.suggestedAction,
    });

    localStorage.setItem(storageKey, JSON.stringify(events));

    // If too many confusion events, trigger intervention
    if (events.length >= 3) {
      console.warn(
        `High confusion rate detected for session ${sessionId}. Consider showing help.`
      );
    }
  }

  /**
   * Check if button step requires strict validation
   */
  static isStrictButtonStep(currentStep: string): boolean {
    const strictSteps = [
      "gender",
      "lga",
      "ageGroup",
      "maritalStatus",
      "contraception",
      "emergencyProduct",
      "duration",
      "methodSelection",
    ];

    return strictSteps.some((step) => currentStep.includes(step));
  }

  /**
   * Validate if user input matches expected button options
   */
  static validateButtonInput(
    userInput: string,
    validOptions: string[]
  ): { isValid: boolean; closestMatch?: string } {
    const normalizedInput = userInput.toLowerCase().trim();

    // Exact match
    const exactMatch = validOptions.find(
      (option) => option.toLowerCase() === normalizedInput
    );
    if (exactMatch) {
      return { isValid: true };
    }

    // Fuzzy match (check if input is contained in any option)
    const fuzzyMatch = validOptions.find(
      (option) =>
        option.toLowerCase().includes(normalizedInput) ||
        normalizedInput.includes(option.toLowerCase())
    );

    if (fuzzyMatch) {
      return { isValid: true, closestMatch: fuzzyMatch };
    }

    // No match found
    return { isValid: false };
  }

  /**
   * Get confusion statistics for analytics
   */
  static getConfusionStats(sessionId: string): {
    totalEvents: number;
    avgConfidence: number;
    topReasons: string[];
  } {
    const storageKey = `confusion_events_${sessionId}`;
    const existing = localStorage.getItem(storageKey);

    if (!existing) {
      return { totalEvents: 0, avgConfidence: 0, topReasons: [] };
    }

    const events = JSON.parse(existing);
    const totalEvents = events.length;
    const avgConfidence =
      events.reduce((sum: number, e: any) => sum + e.confidence, 0) /
      totalEvents;

    // Count reasons
    const reasonCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      const reasons = e.reason.split(", ");
      reasons.forEach((reason: string) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    });

    const topReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason);

    return { totalEvents, avgConfidence, topReasons };
  }
}

// Export utility functions for easy use
export const detectConfusion = ConfusionDetector.detect;
export const getHelpMessage = ConfusionDetector.getHelpMessage;
export const isStrictButtonStep = ConfusionDetector.isStrictButtonStep;
export const validateButtonInput = ConfusionDetector.validateButtonInput;
