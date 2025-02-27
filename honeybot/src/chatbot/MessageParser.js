// src/MessageParser.js
class MessageParser {
    constructor(actionProvider, state) {
      this.actionProvider = actionProvider;
      this.state = state;
    }
  
    parse(message) {
      console.log(message)
      const lowerCaseMsg = message.toLowerCase();
  
      // Simple flow logic based on the conversation stage
  
      // 1. If the user’s name has not been set, treat the input as the name.
      if (!this.state.name) {
        this.actionProvider.handleName(message);
        return;
      }
  
      // 2. If demographics are not yet collected, check for keywords.
      if (!this.state.demographics.gender) {
        // Expecting gender response (Male, Female, Prefer not to say)
        this.actionProvider.handleGender(message);
        return;
      }
  
      // 3. Next steps: age group, relationship status, state, and local government.
      if (!this.state.demographics.ageGroup) {
        this.actionProvider.handleAgeGroup(message);
        return;
      }
      if (!this.state.demographics.relationshipStatus) {
        this.actionProvider.handleRelationshipStatus(message);
        return;
      }
      if (!this.state.demographics.state) {
        this.actionProvider.handleState(message);
        return;
      }
      if (!this.state.demographics.localGovernment) {
        this.actionProvider.handleLocalGovernment(message);
        return;
      }
  
      // 4. Mode of assistance
      if (!this.state.demographics.mode) {
        this.actionProvider.handleMode(message);
        return;
      }
  
      // 5. Main menu option selection (using keywords, or you can implement buttons)
      if (lowerCaseMsg.includes("pregnant")) {
        this.actionProvider.handleMainMenuOption("I want to get pregnant");
        return;
      } else if (lowerCaseMsg.includes("prevent")) {
        this.actionProvider.handleMainMenuOption("I want to prevent pregnancy");
        return;
      } else if (lowerCaseMsg.includes("improve")) {
        this.actionProvider.handleMainMenuOption("I want to improve my sex life");
        return;
      } else if (lowerCaseMsg.includes("change") || lowerCaseMsg.includes("stop")) {
        this.actionProvider.handleMainMenuOption("I want to change/stop my family planning method");
        return;
      } else if (lowerCaseMsg.includes("question")) {
        this.actionProvider.handleGeneralQuestion(message);
        return;
      }
  
      // Default fallback message
      this.actionProvider.handleFallback();
    }
  }
  
  export default MessageParser;
  