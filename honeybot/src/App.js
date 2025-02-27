// src/App.js
import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";

function App() {
  return (
    <div className="App">
      <header>
        <h1>Honey Chatbot</h1>
      </header>
      <main>
        <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
      </main>
    </div>
  );
}

export default App;
