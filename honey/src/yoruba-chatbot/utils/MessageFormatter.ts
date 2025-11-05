// MessageFormatter.ts - Format messages with consistent styling and emojis

export interface MethodDetails {
  name: string;
  description: string;
  duration: string;
  effectiveness: number;
  mechanism: string;
  advantages?: string[];
  sideEffects?: string[];
  contraindications?: string[];
  cost?: string;
  availability: string;
  timeToFertilityReturn?: string;
}

export class MessageFormatter {
  /**
   * Format comprehensive method information
   */
  static formatMethodInfo(details: MethodDetails): string {
    const emoji = this.getMethodEmoji(details.name);

    return `
*${details.name.toUpperCase()}* ${emoji}

${details.description}

⏱️ *Duration:* ${details.duration}
✅ *Effectiveness:* ${details.effectiveness}% in preventing pregnancy

*How it works:*
${details.mechanism}

${
  details.advantages && details.advantages.length > 0
    ? `
✨ *Advantages:*
${details.advantages.map((a) => `  • ${a}`).join("\n")}
`
    : ""
}

${
  details.sideEffects && details.sideEffects.length > 0
    ? `
⚠️ *Possible side effects:*
${details.sideEffects.map((s) => `  • ${s}`).join("\n")}
`
    : ""
}

${
  details.contraindications && details.contraindications.length > 0
    ? `
🚫 *Not recommended for:*
${details.contraindications.map((c) => `  • ${c}`).join("\n")}
`
    : ""
}

${
  details.timeToFertilityReturn
    ? `
🕐 *Return to fertility:* ${details.timeToFertilityReturn}
`
    : ""
}

💰 *Cost:* ${details.cost || "Varies by location"}
🏥 *Where to get it:* ${details.availability}
    `.trim();
  }

  /**
   * Get emoji for contraceptive method
   */
  static getMethodEmoji(method: string): string {
    const emojiMap: Record<string, string> = {
      // Long-term methods
      IUD: "🔄",
      IUS: "🔄",
      Implants: "💉",
      Implanon: "💉",
      Jadelle: "💉",

      // Short-term methods
      "Daily Pills": "💊",
      "Daily Contraceptive Pills": "💊",
      Levofem: "💊",
      Dianofem: "💊",
      Desofem: "💊",

      // Injections
      Injections: "💉",
      "Depo-provera": "💉",
      "Sayana Press": "💉",

      // Emergency
      "Emergency Pills": "⚡",
      Postpill: "⚡",
      Postinor: "⚡",
      "Postinor-2": "⚡",

      // Barrier methods
      Condoms: "🛡️",
      "Male Condom": "🛡️",
      "Female Condom": "🛡️",
      Diaphragm: "⭕",

      // Permanent
      "Female Sterilization": "⚕️",
      "Male Sterilization": "⚕️",
      Vasectomy: "⚕️",
      "Tubal Ligation": "⚕️",
    };

    // Try exact match first
    if (emojiMap[method]) {
      return emojiMap[method];
    }

    // Try partial match
    for (const [key, value] of Object.entries(emojiMap)) {
      if (method.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return "📋"; // Default
  }

  /**
   * Format warning message
   */
  static formatWarning(message: string): string {
    return `⚠️ *IMPORTANT:* ${message}`;
  }

  /**
   * Format success message
   */
  static formatSuccess(message: string): string {
    return `✅ ${message}`;
  }

  /**
   * Format info message
   */
  static formatInfo(message: string): string {
    return `ℹ️ ${message}`;
  }

  /**
   * Format urgent/emergency message
   */
  static formatUrgent(message: string): string {
    return `🚨 *URGENT:* ${message}`;
  }

  /**
   * Format tip/advice message
   */
  static formatTip(message: string): string {
    return `💡 *Tip:* ${message}`;
  }

  /**
   * Format clinic information
   */
  static formatClinicInfo(clinic: {
    name: string;
    address: string;
    phone?: string;
    hours?: string;
    services?: string[];
    distance?: string;
  }): string {
    return `
🏥 *${clinic.name}*

📍 *Address:*
${clinic.address}

${clinic.phone ? `📞 *Phone:* ${clinic.phone}\n` : ""}
${clinic.hours ? `🕐 *Hours:* ${clinic.hours}\n` : ""}
${clinic.distance ? `📏 *Distance:* ${clinic.distance}\n` : ""}

${
  clinic.services && clinic.services.length > 0
    ? `
*Services offered:*
${clinic.services.map((s) => `  ✓ ${s}`).join("\n")}
`
    : ""
}
    `.trim();
  }

  /**
   * Format list with numbers or bullets
   */
  static formatList(
    items: string[],
    style: "numbered" | "bullets" | "checkmarks" = "bullets"
  ): string {
    const markers = {
      numbered: (i: number) => `${i + 1}.`,
      bullets: () => "•",
      checkmarks: () => "✓",
    };

    return items
      .map((item, index) => `${markers[style](index)} ${item}`)
      .join("\n");
  }

  /**
   * Format conversation summary
   */
  static formatConversationSummary(summary: {
    topicsExplored: string[];
    decisions: { question: string; answer: string }[];
    recommendations: string[];
    clinicsViewed?: string[];
    duration: string;
  }): string {
    return `
📋 *Your Conversation Summary*

✅ *Topics you explored:*
${this.formatList(summary.topicsExplored, "checkmarks")}

💡 *Your selections:*
${summary.decisions
  .map((d) => `  • ${d.question}\n    → *${d.answer}*`)
  .join("\n")}

${
  summary.clinicsViewed && summary.clinicsViewed.length > 0
    ? `
🏥 *Clinics you viewed:*
${this.formatList(summary.clinicsViewed, "bullets")}
`
    : ""
}

⏱️ *Chat duration:* ${summary.duration}

---

📌 *Recommended next steps:*
${this.formatList(summary.recommendations, "numbered")}
    `.trim();
  }

  /**
   * Format progress indicator
   */
  static formatProgress(
    current: number,
    total: number,
    label?: string
  ): string {
    const percentage = (current / total) * 100;
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    const progressBar = "█".repeat(filled) + "░".repeat(empty);

    return `
${label ? `${label}\n` : ""}${progressBar} ${current}/${total} (${Math.round(
      percentage
    )}%)
    `.trim();
  }

  /**
   * Format time-sensitive message with countdown
   */
  static formatTimeSensitive(
    message: string,
    timeWindow: string,
    urgencyLevel: "high" | "medium" | "low" = "medium"
  ): string {
    const icons = {
      high: "🚨",
      medium: "⚡",
      low: "ℹ️",
    };

    return `
${icons[urgencyLevel]} *TIME-SENSITIVE INFORMATION*

${message}

⏰ *Time window:* ${timeWindow}
    `.trim();
  }

  /**
   * Format method comparison table
   */
  static formatMethodComparison(
    methods: Array<{
      name: string;
      effectiveness: number;
      duration: string;
      cost: string;
    }>
  ): string {
    return `
📊 *Method Comparison*

${methods
  .map(
    (m) => `
*${m.name}* ${this.getMethodEmoji(m.name)}
  Effectiveness: ${m.effectiveness}%
  Duration: ${m.duration}
  Cost: ${m.cost}
`
  )
  .join("\n")}
    `.trim();
  }

  /**
   * Add button usage guidance
   */
  static addButtonGuidance(message: string): string {
    return `${message}\n\n👇 *Please tap one of the buttons below:*`;
  }

  /**
   * Format error message
   */
  static formatError(error: string, suggestion?: string): string {
    return `
❌ ${error}

${suggestion ? `\n💡 *Suggestion:* ${suggestion}` : ""}
    `.trim();
  }

  /**
   * Format demographic confirmation
   */
  static formatDemographicConfirmation(demographics: {
    gender?: string;
    lga?: string;
    ageGroup?: string;
    maritalStatus?: string;
  }): string {
    return `
✅ *Thank you for sharing!*

Your profile:
  • Gender: ${demographics.gender || "Not specified"}
  • Location: ${demographics.lga || "Not specified"}
  • Age group: ${demographics.ageGroup || "Not specified"}
  • Marital status: ${demographics.maritalStatus || "Not specified"}

Now I can assist you better! 😊
    `.trim();
  }

  /**
   * Format welcome message
   */
  static formatWelcome(name?: string): string {
    const greeting = name ? `Hey ${name}!` : "Hello!";

    return `
${greeting} 👋

My name is *Honey*. I am a family planning and pregnancy prevention chatbot. I am here to help with family planning, sexual health, and intimacy.

I can provide you with:
  ✓ Information about family planning methods
  ✓ Answers to your questions
  ✓ Referrals to medical professionals
  ✓ Family planning clinic locations

🔐 *Privacy Promise:*
Any communication happening in this chat is strictly confidential, so you can feel safe sharing personal information.
    `.trim();
  }

  /**
   * Format goodbye message
   */
  static formatGoodbye(includeFollowUp: boolean = true): string {
    const base = `
Thank you for chatting with me! 😊

I hope I was able to help you today.
    `.trim();

    if (includeFollowUp) {
      return `
${base}

Is there anything else you'd like to know, or would you like to:
  🔄 Start a new conversation
  📥 Export this chat
  ❌ End session
      `.trim();
    }

    return base;
  }

  /**
   * Clean and normalize text (remove extra whitespace, etc.)
   */
  static normalize(text: string): string {
    return text
      .trim()
      .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
      .replace(/ {2,}/g, " ") // Max 1 space
      .replace(/\t/g, " "); // Convert tabs to spaces
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Highlight keywords in text
   */
  static highlight(text: string, keywords: string[]): string {
    let highlighted = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi");
      highlighted = highlighted.replace(regex, "*$1*");
    });
    return highlighted;
  }
}

// Export commonly used functions
export const formatMethodInfo =
  MessageFormatter.formatMethodInfo.bind(MessageFormatter);
export const formatWarning =
  MessageFormatter.formatWarning.bind(MessageFormatter);
export const formatSuccess =
  MessageFormatter.formatSuccess.bind(MessageFormatter);
export const formatInfo = MessageFormatter.formatInfo.bind(MessageFormatter);
export const formatClinicInfo =
  MessageFormatter.formatClinicInfo.bind(MessageFormatter);
export const formatList = MessageFormatter.formatList.bind(MessageFormatter);
export const addButtonGuidance =
  MessageFormatter.addButtonGuidance.bind(MessageFormatter);
