// SmartMessageTimer.ts - Calculate optimal message delays based on reading time and importance

export type MessageType =
  | "intro"
  | "info"
  | "warning"
  | "question"
  | "confirmation"
  | "error";

export interface TimingResult {
  delay: number;
  readingTime: number;
  totalWaitTime: number;
}

export class SmartMessageTimer {
  // Reading speed constants (words per minute)
  private static readonly READING_SPEED_WPM = 225;
  private static readonly MIN_DELAY_MS = 500;
  private static readonly MAX_DELAY_MS = 5000;

  /**
   * Calculate reading time based on message length
   * Average reading speed: 200-250 words per minute (we use 225)
   */
  static calculateReadingTime(message: string): number {
    const wordCount = this.countWords(message);
    const baseReadingTime = (wordCount / this.READING_SPEED_WPM) * 60 * 1000;

    // Add extra time for special content
    const listItems = this.countListItems(message);
    const emojis = this.countEmojis(message);
    const formattedText = this.countFormattedText(message);
    const codeBlocks = this.countCodeBlocks(message);

    // Time adjustments
    const listTime = listItems * 150; // 150ms per list item
    const emojiTime = emojis * 50; // 50ms per emoji
    const formatTime = formattedText * 100; // 100ms per formatted section
    const codeTime = codeBlocks * 500; // 500ms per code block

    const totalReadingTime =
      baseReadingTime + listTime + emojiTime + formatTime + codeTime;

    // Ensure minimum 1s for any message
    return Math.max(1000, Math.min(10000, totalReadingTime));
  }

  /**
   * Get delay before showing message based on type
   */
  static getDelayForMessageType(type: MessageType): number {
    const delays: Record<MessageType, number> = {
      intro: 500,
      info: 800,
      warning: 1200, // Longer for important warnings
      question: 600,
      confirmation: 400,
      error: 700,
    };
    return delays[type];
  }

  /**
   * Calculate optimal delay sequence for multiple messages
   */
  static calculateMessageSequence(
    messages: Array<{ text: string; type: MessageType }>
  ): TimingResult[] {
    let cumulativeDelay = 0;

    return messages.map(({ text, type }, index) => {
      const delay =
        index === 0 ? this.getDelayForMessageType(type) : cumulativeDelay;
      const readingTime = this.calculateReadingTime(text);
      const totalWaitTime = delay + readingTime;

      // Next message should appear after user has had time to read this one
      cumulativeDelay = totalWaitTime + this.getDelayForMessageType(type);

      return {
        delay,
        readingTime,
        totalWaitTime,
      };
    });
  }

  /**
   * Adjust delay based on conversation urgency
   */
  static adjustForUrgency(
    baseDelay: number,
    urgency: "low" | "medium" | "high" | "emergency"
  ): number {
    const multipliers = {
      low: 1.2, // Slower, more relaxed pace
      medium: 1.0, // Normal pace
      high: 0.8, // Faster, more urgent
      emergency: 0.5, // Very fast, immediate attention needed
    };

    const adjusted = baseDelay * multipliers[urgency];
    return Math.max(this.MIN_DELAY_MS, Math.min(this.MAX_DELAY_MS, adjusted));
  }

  /**
   * Get typing indicator duration (simulated typing time)
   */
  static getTypingIndicatorDuration(messageLength: number): number {
    // Simulate realistic typing speed: ~40 characters per second
    const typingSpeed = 40;
    const duration = (messageLength / typingSpeed) * 1000;

    // Minimum 500ms, maximum 3s
    return Math.max(500, Math.min(3000, duration));
  }

  /**
   * Calculate delay for follow-up question after showing info
   */
  static getFollowUpDelay(previousMessageLength: number): number {
    const readingTime = this.calculateReadingTime(
      "x ".repeat(previousMessageLength / 2)
    );
    // Give 50% of reading time before asking follow-up
    return Math.max(1000, readingTime * 0.5);
  }

  // Helper methods

  private static countWords(text: string): number {
    // Remove markdown and special characters for accurate word count
    const cleaned = text
      .replace(/[*_~`#]/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned.split(/\s+/).filter((word) => word.length > 0).length;
  }

  private static countListItems(text: string): number {
    // Count bullet points, numbers, checkmarks
    const patterns = [/^\s*[•\-\*]/gm, /^\s*\d+\./gm, /^\s*[✓✔]/gm];

    return patterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private static countEmojis(text: string): number {
    // Match emoji characters (Unicode ranges)
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
  }

  private static countFormattedText(text: string): number {
    // Count bold, italic, code sections
    const patterns = [
      /\*\*[^*]+\*\*/g, // Bold
      /\*[^*]+\*/g, // Italic
      /`[^`]+`/g, // Inline code
      /__[^_]+__/g, // Underline
    ];

    return patterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private static countCodeBlocks(text: string): number {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = text.match(codeBlockRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Create a timing config object for chatbot messages
   */
  static createTimingConfig(
    text: string,
    type: MessageType,
    urgency: "low" | "medium" | "high" | "emergency" = "medium"
  ) {
    const baseDelay = this.getDelayForMessageType(type);
    const delay = this.adjustForUrgency(baseDelay, urgency);
    const readingTime = this.calculateReadingTime(text);
    const typingDuration = this.getTypingIndicatorDuration(text.length);

    return {
      delay,
      readingTime,
      typingDuration,
      metadata: {
        wordCount: this.countWords(text),
        hasLists: this.countListItems(text) > 0,
        hasEmojis: this.countEmojis(text) > 0,
        hasFormatting: this.countFormattedText(text) > 0,
        urgency,
      },
    };
  }

  /**
   * Suggest optimal pacing for a conversation flow
   */
  static suggestConversationPacing(messages: string[]): {
    totalDuration: number;
    averageDelay: number;
    recommendation: string;
  } {
    const totalReadingTime = messages.reduce(
      (sum, msg) => sum + this.calculateReadingTime(msg),
      0
    );
    const totalDelay = messages.length * 800; // Average delay
    const totalDuration = totalReadingTime + totalDelay;
    const averageDelay = totalDelay / messages.length;

    let recommendation: string;
    if (totalDuration < 10000) {
      recommendation = "Good pacing - conversation moves smoothly";
    } else if (totalDuration < 30000) {
      recommendation = "Moderate pacing - users may need breaks";
    } else {
      recommendation = "Slow pacing - consider breaking into smaller chunks";
    }

    return {
      totalDuration,
      averageDelay,
      recommendation,
    };
  }

  /**
   * Format duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Analyze message timing and provide insights
   */
  static analyzeMessageTiming(message: string): {
    wordCount: number;
    estimatedReadTime: string;
    recommendedDelay: number;
    complexity: "simple" | "moderate" | "complex";
  } {
    const wordCount = this.countWords(message);
    const readingTime = this.calculateReadingTime(message);
    const hasLists = this.countListItems(message) > 0;
    const hasFormatting = this.countFormattedText(message) > 0;

    let complexity: "simple" | "moderate" | "complex";
    if (wordCount < 20 && !hasLists && !hasFormatting) {
      complexity = "simple";
    } else if (wordCount < 50) {
      complexity = "moderate";
    } else {
      complexity = "complex";
    }

    const recommendedDelay =
      complexity === "simple" ? 500 : complexity === "moderate" ? 800 : 1200;

    return {
      wordCount,
      estimatedReadTime: this.formatDuration(readingTime),
      recommendedDelay,
      complexity,
    };
  }
}

// Export convenience functions
export const calculateReadingTime =
  SmartMessageTimer.calculateReadingTime.bind(SmartMessageTimer);
export const getDelayForMessageType =
  SmartMessageTimer.getDelayForMessageType.bind(SmartMessageTimer);
export const createTimingConfig =
  SmartMessageTimer.createTimingConfig.bind(SmartMessageTimer);
export const formatDuration =
  SmartMessageTimer.formatDuration.bind(SmartMessageTimer);
