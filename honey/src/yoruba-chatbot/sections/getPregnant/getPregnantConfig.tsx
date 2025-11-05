// src/chatbot/sections/getPregnant/getPregnantConfig.tsx
import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import OptionButtons from '../../../components/OptionButtons';
import { WidgetProps } from '../../config';

export interface GetPregnantWidgetProps extends WidgetProps {
  actionProvider: WidgetProps['actionProvider'] & {
    handleGetPregnantFPMSelection: (option: string) => void;
    handleGetPregnantTryingDuration: (option: string) => void;
    handleGetPregnantIUDRemoval: (option: string) => void;
    handleGetPregnantImplantRemoval: (option: string) => void;
    handleGetPregnantInjectionStop: (option: string) => void;
    handleGetPregnantPillsStop: (option: string) => void;
    handleGetPregnantNextAction: (option: string) => void;
  };
}

// Get Pregnant specific widgets configuration
export const getPregnantWidgets = [
  {
    widgetName: 'getPregnantFPMSelection',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          'No FPM now or recently',
          'IUD',
          'Implants',
          'Injections/ Depo-provera',
          'Sayana Press',
          'Daily Pills',
          'Condoms',
          'Emergency pills',
          'Female sterilisation',
          'Male sterilisation',
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantFPMSelection(option)
        }
      />
    ),
  },
  {
    widgetName: 'getPregnantTryingDuration',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={['Less than 1 year', 'Longer than 1 year']}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantTryingDuration(option)
        }
      />
    ),
  },
  {
    widgetName: 'getPregnantIUDRemoval',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          'Yes, more than 1 year',
          'Yes, less than 1 year',
          "No, I didn't remove",
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantIUDRemoval(option)
        }
      />
    ),
  },
  {
    widgetName: 'getPregnantImplantRemoval',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          'Longer than 3 months',
          'Less than 3 months',
          "No, I didn't remove",
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantImplantRemoval(option)
        }
      />
    ),
  },
  {
    widgetName: 'getPregnantInjectionStop',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={['Yes', 'No']}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantInjectionStop(option)
        }
      />
    ),
  },
  {
    widgetName: 'getPregnantPillsStop',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={['Yes', 'No']}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantPillsStop(option)
        }
      />
    ),
  },
  {
    widgetName: 'getPregnantNextAction',
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          'Ask more questions',
          'Find nearest clinic',
          'Back to main menu',
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantNextAction(option)
        }
      />
    ),
  },
];

// Get Pregnant specific messages
export const getPregnantMessages = {
  // Initial messages
  introduction: createChatBotMessage(
    'This is great! I am happy to give you advice on family planning.',
    {
      delay: 500,
    },
  ),

  fpmQuestion: createChatBotMessage(
    'Are you currently using a family planning method (FPM) or did you recently use one?\n\nPlease select from the options your current or recently used method. Scroll to see all options',
    {
      delay: 1000,
      widget: 'getPregnantFPMSelection',
    },
  ),

  // No FPM branch
  noFPMExplanation: createChatBotMessage(
    "Most couples will get pregnant within a year if they have regular sex and don't use contraception. But this is very individual and dependent on many factors.",
    {
      delay: 500,
    },
  ),

  tryingDurationQuestion: createChatBotMessage(
    'How long have you been trying to get pregnant?',
    {
      delay: 1000,
      widget: 'getPregnantTryingDuration',
    },
  ),

  generalAdvice: createChatBotMessage(
    'I see! No worries, getting pregnant might take some more time. However, I understand it might be frustrating. I recommend visiting your health care provider for proper medical assessment and guidance',
    {
      delay: 500,
    },
  ),

  // IUD branch
  iudExplanation: createChatBotMessage(
    'To get pregnant the IUD needs to be removed Return to fertility is immediate, or it may take a week or two to become fertile.* *In most cases, you can become pregnant in the first cycle after removal.',
    {
      delay: 500,
    },
  ),

  iudRemovalQuestion: createChatBotMessage(
    'Have you already removed the IUD for more than a year and still can not get pregnant?',
    {
      delay: 1000,
      widget: 'getPregnantIUDRemoval',
    },
  ),

  iudMoreThanYear: createChatBotMessage(
    'I understand it could be frustrating, so it might be good to talk to a specialist and get more detailed advice.',
    {
      delay: 500,
    },
  ),

  iudLessThanYear: createChatBotMessage(
    'We understand it might be frustrating, but no worries, getting pregnant might take some more time. Kindly visit your health care provider and get more detailed advice.',
    {
      delay: 500,
    },
  ),

  iudNotRemoved: createChatBotMessage(
    'We recommend you visiting the clinic where you adopted the method or a nearby cinic to remove it.',
    {
      delay: 500,
    },
  ),

  // Implant branch
  implantExplanation: createChatBotMessage(
    'To get pregnant the Implant needs to be removed The earliest possible time to get pregnant is within 1 week of having the rod removed, but usually fertility is fully restored within 3 weeks.',
    {
      delay: 500,
    },
  ),

  implantRemovalQuestion: createChatBotMessage(
    'Have you already removed the implant for more than 3 months and still can not get pregnant?',
    {
      delay: 1000,
      widget: 'getPregnantImplantRemoval',
    },
  ),

  implantLongerThan3Months: createChatBotMessage(
    'I understand not being able to get pregnant might be frustrating. It is good to talk to a specialist and get more detailed advice',
    {
      delay: 500,
    },
  ),

  implantLessThan3Months: createChatBotMessage(
    'We understand it might be frustrating, but no worries, getting pregnant might take some more time. Kindly visit your health care provider and get more detailed advice.',
    {
      delay: 500,
    },
  ),

  implantNotRemoved: createChatBotMessage(
    'We recommend you visiting the clinic where you adopted the method or a nearby cinic to remove it.',
    {
      delay: 500,
    },
  ),

  // Injection branch
  injectionExplanation: createChatBotMessage(
    "To get pregnant you need to stop taking the injection.\n\nIn most cases, it's possible to become pregnant after 3 months which is the duration of the injection.\n\nBut it can take up to six month for the complete effect of the hormone to wear off and to begin ovulating and having regular periods again",
    {
      delay: 500,
    },
  ),

  injectionStopQuestion: createChatBotMessage(
    'Have you stopped taking the injection for more than 6 months and still can not get pregnant?',
    {
      delay: 1000,
      widget: 'getPregnantInjectionStop',
    },
  ),

  injectionStoppedYes: createChatBotMessage(
    'I understand not being able to get pregnant might be frustrating. It is good to talk to a specialist and get more detailed advice.',
    {
      delay: 500,
    },
  ),

  injectionStoppedNo: createChatBotMessage(
    'No worries, women who stop using the injection usually experience at least 6 months of delay before pregnancy but depending on your body it may be longer.',
    {
      delay: 500,
    },
  ),

  // Pills branch
  pillsExplanation: createChatBotMessage(
    "To get pregnant you need to stop taking the pill. The pill stops your body from ovulating, but as soon as you stop taking the pill, Your ovulation will start again . So, it's possible to get pregnant as soon as you stop the pill.",
    {
      delay: 500,
    },
  ),

  pillsStopQuestion: createChatBotMessage(
    'Have you stopped taking the pill for more than 3 months and still can not get pregnant?',
    {
      delay: 1000,
      widget: 'getPregnantPillsStop',
    },
  ),

  pillsStoppedNo: createChatBotMessage(
    'I understand that it might be frustrating. But no worries, women who stop using the Pills experience no delay in getting pregnant. Call 7790 and requestto speak to a nurse counsellor if you still have concerns.',
    {
      delay: 500,
    },
  ),

  // Condoms branch
  condomsAdvice: createChatBotMessage(
    "To get pregnant you need to stop using condoms. So, it's possible to get pregnant as soon as you stop using the condoms. Most couples will get pregnant within a year if they have regular sex and don't use contraception. But this is very individual and dependent on many factors.",
    {
      delay: 500,
    },
  ),

  // Emergency pills branch
  emergencyPillsAdvice: createChatBotMessage(
    "To get pregnant you need to stop taking emergency pills. So, it's possible to get pregnant as soon as you stop the pill. Note that you can not use emergency pill as the main family planning method. Most couples will get pregnant within a year if they have regular sex and don't use contraception. But this is very individual and dependent on many factors.",
    {
      delay: 500,
    },
  ),

  // Sterilisation branches
  femaleSterilisationAdvice: createChatBotMessage(
    'Sometimes female sterilisation is reversible. It can be immediately after or even several years later. Kindly visit your health provider and get more advice regarding the status of your sterilisation',
    {
      delay: 500,
    },
  ),

  maleSterilisationAdvice: createChatBotMessage(
    'Sometimes male sterilisation is reversible. It can be immediately after or even several years later. Kindly visit your health provider and get more advice regarding the status of your sterilisation.',
    {
      delay: 500,
    },
  ),

  // Next action question
  nextActionQuestion: createChatBotMessage('What would you like to do next?', {
    delay: 1000,
    widget: 'getPregnantNextAction',
  }),

  // Ask more questions response
  askMoreQuestions: createChatBotMessage('Okay!', {
    delay: 500,
  }),

  askMoreQuestionsPrompt: createChatBotMessage(
    'Please note that I am a family planning bot and can only respond to questions relating to family planning. What is your question?',
    {
      delay: 1000,
    },
  ),
};

// Initial messages for get pregnant flow
export const getPregnantInitialMessages = [
  getPregnantMessages.introduction,
  getPregnantMessages.fpmQuestion,
];
