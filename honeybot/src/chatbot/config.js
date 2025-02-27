// src/config.js
import { createChatBotMessage } from 'react-chatbot-kit';
import CustomButton from '../components/Options';
import { supabase } from '../supabaseClient';

// Function to save name and demographics to Supabase
const saveToSupabase = async (name, demographics) => {
  const { data, error } = await supabase
    .from('user_demographics')
    .upsert([{ name, ...demographics }], { onConflict: ['name'] });

  if (error) {
    console.error('Error saving to Supabase:', error);
  }
};

// Function to get user details (for returning users)
const getUserDetails = async (sessionId) => {
  const { data, error } = await supabase
    .from('user_demographics')
    .select()
    .eq('session_id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
  }
  return data;
};

// Define demographic options
const genderOptions = ['Male', 'Female', 'Prefer not to say'];
const ageGroupOptions = ['<25', '26-35', '36-45', '46-55', '55 and above'];
const stateOptions = ['Lagos', 'Abuja', 'Rivers', 'Ogun'];  // Add all Nigerian states
const lgaOptions = {
  Lagos: ['Ikeja', 'Victoria Island', 'Lekki'],
  Abuja: ['Central Area', 'Garki', 'Wuse'],
  // Add LGAs for other states
};

// Welcome message and name collection
const botWelcomeMessage = createChatBotMessage(
  "Welcome! I'm Honey, here to assist you. What’s your name?"
);

const config = {
  botName: "Honey",
  initialMessages: [botWelcomeMessage],
  customStyles: {
    botMessageBox: {
      backgroundColor: "green",
    },
    chatButton: {
      backgroundColor: "blue",
    },
  },
  widgets: [
    {
      widgetName: "options",
      widgetFunc: (props) => <CustomButton {...props} />,
      props: {
        options: genderOptions.map((option) => ({
          text: option,
          callback: (response) => {
            // Save response and move to next question
            saveToSupabase(response, { gender: option });
          },
        })),
      },
    },
    {
      widgetName: "ageGroup",
      widgetFunc: (props) => <CustomButton {...props} />,
      props: {
        options: ageGroupOptions.map((option) => ({
          text: option,
          callback: (response) => {
            // Save response and move to next question
            saveToSupabase(response, { ageGroup: option });
          },
        })),
      },
    },
    {
      widgetName: "state",
      widgetFunc: (props) => <CustomButton {...props} />,
      props: {
        options: stateOptions.map((state) => ({
          text: state,
          callback: (response) => {
            // Save response and move to LGA question
            saveToSupabase(response, { state: state });
          },
        })),
      },
    },
    {
      widgetName: "lga",
      widgetFunc: (props) => <CustomButton {...props} />,
      props: {
        options: (state) => lgaOptions[state]?.map((lga) => ({
          text: lga,
          callback: (response) => {
            // Save LGA and move to the next step
            saveToSupabase(response, { lga: response });
          },
        })),
      },
    },
    // Additional widgets for mode of assistance, main menu, etc. can follow a similar pattern
  ],
  state: {
    name: "",
    demographics: {},
    sessionId: "",
  },
  actionProvider: {
    // Define actions for the next steps of conversation (mode of assistance, etc.)
  },
  messageParser: (message) => {
    // Process and handle incoming messages here
  },
};

export default config;
