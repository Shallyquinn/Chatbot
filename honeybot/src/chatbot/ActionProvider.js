// src/ActionProvider.js
import { createChatBotMessage } from "react-chatbot-kit";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage, stateRef, props) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.stateRef = stateRef;

    // Generate a session id if not already generated
    if (!this.stateRef.sessionId) {
      this.setState((prev) => ({ ...prev, sessionId: uuidv4() }));
    }
    // Check for returning user and skip demographic questions if available
    this.checkReturningUser();
  }

  // Check if the user is returning and fetch data from Supabase
  async checkReturningUser() {
    const { sessionId } = this.stateRef;
    const userDetails = await this.getUserDetails(sessionId);
    
    if (userDetails) {
      // Skip demographic collection and move to the next step
      this.setState((prev) => ({
        ...prev,
        name: userDetails.name,
        demographics: userDetails.demographics,
      }));
      this.askForModeOfAssistance();
    } else {
      // Start the conversation from the welcome message
      const welcomeMessage = this.createChatBotMessage(
        "Welcome! I'm Honey, here to assist you. What’s your name?"
      );
      this.addMessageToState(welcomeMessage);
    }
  }

  // Retrieve user details from Supabase (for returning users)
  async getUserDetails(sessionId) {
    const { data, error } = await supabase
      .from('user_demographics')
      .select()
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
    }
    return data;
  }

  // Save the response to Supabase
  async saveResponse(question, answer) {
    const { sessionId } = this.stateRef;
    const { error } = await supabase.from('chat_responses').insert([
      { session_id: sessionId, question, answer },
    ]);
    if (error) {
      console.error("Error saving response:", error);
    }
  }

  // Handle name collection
  handleName = (name) => {
    this.setState((prev) => ({ ...prev, name }));
    this.saveResponse("User Name", name);
    const message = this.createChatBotMessage(`Nice to meet you, ${name}!  I am here to help with family planning, sexual health, and intimacy.`);
    this.addMessageToState(message);
    
    this.askForGender();
  };

  // Ask for gender
  askForGender() {
    const genderMessage = this.createChatBotMessage("What is your gender?", {
      widget: "options",
      payload: { options: ["Male", "Female", "Prefer not to say"], nextStep: "handleGender" },
    });
    this.addMessageToState(genderMessage);
  }

  // Handle gender response
  handleGender = (gender) => {
    this.setState((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, gender },
    }));
    this.saveResponse("Gender", gender);
    this.askForAgeGroup();
  };

  // Ask for age group
  askForAgeGroup() {
    const ageGroupMessage = this.createChatBotMessage(
      "What is your age group? (e.g., <25, 26-35, etc.)",
      {
        widget: "options",
        payload: { options: ["<25", "26-35", "36-45", "46-55", "55 and above"], nextStep: "handleAgeGroup" },
      }
    );
    this.addMessageToState(ageGroupMessage);
  }

  // Handle age group response
  handleAgeGroup = (ageGroup) => {
    this.setState((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, ageGroup },
    }));
    this.saveResponse("Age Group", ageGroup);
    this.askForRelationshipStatus();
  };

  // Ask for relationship status
  askForRelationshipStatus() {
    const relationshipMessage = this.createChatBotMessage(
      "What best describes you? (Single, Married, Prefer not to say)",
      {
        widget: "options",
        payload: { options: ["Single", "Married", "Prefer not to say"], nextStep: "handleRelationshipStatus" },
      }
    );
    this.addMessageToState(relationshipMessage);
  }

  // Handle relationship status response
  handleRelationshipStatus = (status) => {
    this.setState((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, relationshipStatus: status },
    }));
    this.saveResponse("Relationship Status", status);
    this.askForState();
  };

  // Ask for state
  askForState() {
    const stateMessage = this.createChatBotMessage("What state are you chatting from?", {
      widget: "options",
      payload: { options: ["Lagos", "Abuja", "Rivers"], nextStep: "handleState" },
    });
    this.addMessageToState(stateMessage);
  }

  // Handle state response
  handleState = (stateName) => {
    this.setState((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, state: stateName },
    }));
    this.saveResponse("State", stateName);
    this.askForLocalGovernment();
  };

  // Ask for local government based on selected state
  askForLocalGovernment() {
    const lgaMessage = this.createChatBotMessage("Choose the local government you are chatting from:", {
      widget: "options",
      payload: { options: ["LG1", "LG2", "LG3"], nextStep: "handleLocalGovernment" },
    });
    this.addMessageToState(lgaMessage);
  }

  // Handle local government response
  handleLocalGovernment = (localGov) => {
    this.setState((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, localGovernment: localGov },
    }));
    this.saveResponse("Local Government", localGov);
    this.askForModeOfAssistance();
  };

  // Ask for mode of assistance
  askForModeOfAssistance() {
    const modeMessage = this.createChatBotMessage(
      "How would you like to be assisted today?",
      {
        widget: "options",
        payload: {
          options: ["Chat with HoneyBot", "Chat with a live agent"],
          nextStep: "handleMode",
        },
      }
    );
    this.addMessageToState(modeMessage);
  }

  // Handle mode of assistance
  handleMode = (mode) => {
    this.setState((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, mode },
    }));
    this.saveResponse("Mode of Assistance", mode);
    this.askForMainMenuOption();
  };

  // Ask for main menu options
  askForMainMenuOption() {
    const mainMenuMessage = this.createChatBotMessage("What do you want to know today?", {
      widget: "options",
      payload: {
        options: [
          "I want to get pregnant",
          "I want to prevent pregnancy",
          "I want to improve my sex life",
          "I want to change/stop my family planning method",
          "Ask a general question (ChatGPT-powered)",
        ],
        nextStep: "handleMainMenuOption",
      },
    });
    this.addMessageToState(mainMenuMessage);
  }

  // Handle main menu option selection
  handleMainMenuOption = (option) => {
    this.saveResponse("Main Menu Option", option);
    const message = this.createChatBotMessage(`You selected: ${option}. (This is where the flow for "${option}" would be implemented.)`);
    this.addMessageToState(message);
  };

  // Handle general questions by calling a backend service (e.g., Rasa → ChatGPT)
  handleGeneralQuestion = async (question) => {
    this.saveResponse("General Question", question);
    // Call your API here. For demonstration, we simply echo the question.
    const message = this.createChatBotMessage(`You asked: "${question}". (This would be processed via ChatGPT API.)`);
    this.addMessageToState(message);
  };

  // Fallback if no handler matches
  handleFallback = () => {
    const message = this.createChatBotMessage("Sorry, I didn't understand that. Could you please select one of the options?");
    this.addMessageToState(message);
  };

  // Helper function to add a new message to the state
  addMessageToState = (message) => {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };
}

export default ActionProvider;
