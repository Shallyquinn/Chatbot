# DKT-chatbot
This repository houses the source code for "DKT Chatbot Service" built with React, developed by Data Science Nigeria (DSN), and designed to provide seamless interaction and intuitive user experiences for Family plaanning and Reproductive Health . 

The document below outlines the steps to set up and run the project locally.

## Prerequisites
Before you begin, ensure you have the following installed:

- Node.js (latest stable version)
- Git
- Visual Studio Code (VS Code)

# Getting Started
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To run the chatbot, you need to clone the repository and install needed dependencies.

## Clone the Repository
To get a local copy of this repository, follow these steps:

Open your terminal in VS Code and run the following command to clone the repository from the template branch:

`git clone` <https://github.com/Shallyquinn/DKT-chatbot.git>

### Navigate into the cloned directory

Run `cd DKT-chatbot`

## Install Dependencies

In the project's directory install npm dependencies by running `npm install`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development server mode.

While launching the Chatbot in your default web browser at:
http://localhost:3000

The page will reload when you make changes and save.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

# Break Down of Functionalities

## Welcome Page
When the application starts  from `App.js`, there is a tripple flow of events: a chatbot initialization, a header rendering and an initial message.

### Chatbot Initialization
The chatbot is instantiated by 3 major javascript files:

- `config.js` which configures the components you get to see first on launching the chatbot
- `ActionProvider.js` which handles the interactions and the logic behind the chatbot.
- `MessageParser.js` which effortlessly interprets user inputs to trigger appropriate actions from the `ActionProvider`
  

### Header Rendering
There ia a bold display of the rmnchn-chatbot bot name and description

### Initial Message
From  `config.js`, the chatbot displays the first message **`Hello. What's your name?`**

The `CustomizedInputBase widget` renders a text input for the user to enter their name.

# Login 
A user is prompter to enter his or her name on log in

## The `CustomizedInputBase component`
Captures the input of the user. 

Uses `handleInputChange` to input the changes of the user.

`handleSend` submits the name of the user when the `Enter` key is pressed or the `Send` button is clicked.

 `addNameToState` in ActionProvider.js adds the name of the user to the chatbot's state.
 
## The `loginForm`
This function in ActionProvider.js triggers the SignIn widget `SignIn.js` which then displays a form with 2 fields for **Phone number** and log in **PIN**.

Upon clicking the Login button, the chatbot:
Hides the login form and displays options for the next steps  using `showButtons` in `ActionProvider.js`:
- Button Flow
- Conversational Chat
- Chat with a CSV
- Prediction Model

# Chatbot Flow
You can either access the application through click-on buttons or through a conversational flow.

## Button 

# Customize DKT Chatbot Service 
