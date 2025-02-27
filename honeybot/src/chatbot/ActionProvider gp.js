import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from 'uuid';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.userId = uuidv4(); // Assign a unique user ID for this session
  }

  async saveUserChoice(choice) {
    const { error } = await supabase.from('user_interaction').insert([
      { user_id: this.userId, choice }
    ]);
    if (error) console.error("Error saving user choice:", error);
  }

  handleStartFlow() {
    const message = this.createChatBotMessage("Are you currently using a family planning method or did you recently use one?", {
      widget: "familyPlanningOptions"
    });
    this.updateChatbotState(message);
  }

  handleUserChoice(choice, nextStep) {
    this.saveUserChoice(choice);
    const message = this.createChatBotMessage(choice, {
      widget: nextStep
    });
    this.updateChatbotState(message);
  }

  handleFeedback(input) {
    this.saveUserChoice(`Feedback: ${input}`);
    const message = this.createChatBotMessage("Thank you for your feedback!");
    this.updateChatbotState(message);
  }

  updateChatbotState(message) {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }));
  }
}

export default ActionProvider;
