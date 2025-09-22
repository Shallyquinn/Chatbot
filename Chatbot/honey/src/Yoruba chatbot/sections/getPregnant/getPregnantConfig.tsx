// src/chatbot/sections/getPregnant/getPregnantConfig.tsx
import React from "react";
import { createChatBotMessage } from "react-chatbot-kit";
import OptionButtons from "../../../components/OptionButtons";
import { WidgetProps } from "../../config";

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
    widgetName: "getPregnantFPMSelection",
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          " Rárá, emi ko tii máa lo ọkánkán ni isisinyi àti pé mi o tii lòó ri rárá",
          "IUD", 
          "Implants",
          "Injections/ Depo-provera",
          "Sayana Press",
          "Òògùn idena oyún olojoojumọ ",
          "Kọ́ndọ̀mù", 
          "Òògùn idena oyun onipajawiri",
          "Female sterilisation",
          "Male sterilisation"
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantFPMSelection(option)
        }
      />
    ),
  },
  {
    widgetName: "getPregnantTryingDuration", 
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={["Kere ju odun kan", "O gun ju ọdun kan lọ"]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantTryingDuration(option)
        }
      />
    ),
  },
  {
    widgetName: "getPregnantIUDRemoval",
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          "Beeni, ju ọdun kan lọ",
          "Rárá, tí o to ọdun kan", 
          "Rárá, mi ò yọ́"
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantIUDRemoval(option)
        }
      />
    ),
  },
  {
    widgetName: "getPregnantImplantRemoval",
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          "Ju oṣù mẹta",
          "Ti o to oṣù mẹta",
          "Rárá, mo yin lo"
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantImplantRemoval(option)
        }
      />
    ),
  },
  {
    widgetName: "getPregnantInjectionStop",
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={["Beeni", "Bẹẹkọ"]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantInjectionStop(option)
        }
      />
    ),
  },
  {
    widgetName: "getPregnantPillsStop", 
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={["Beeni", "Bẹẹkọ"]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantPillsStop(option)
        }
      />
    ),
  },
  {
    widgetName: "getPregnantNextAction",
    widgetFunc: ({ actionProvider }: GetPregnantWidgetProps) => (
      <OptionButtons
        options={[
          "Béèrè ìbéèrè míì síi",
          "Wa ile iwosan to sunmọ", 
          "Pada si akojọ aṣayan akọkọ"
        ]}
        actionProvider={actionProvider}
        handleClick={(option: string) =>
          actionProvider.handleGetPregnantNextAction(option)
        }
      />
    ),
  }
];

// Get Pregnant specific messages
export const getPregnantMessages = {
  // Initial messages
  introduction: createChatBotMessage("Eleyi jẹ nla! Inu mi dun lati fun ọ ni imọran lori eto idile.", {
    delay: 500,
  }),
  
  fpmQuestion: createChatBotMessage(
    "Are you currently using a family planning method (FPM) or did you recently use one?\n\nPlease select from the options your current or recently used method. Scroll to see all options", 
    {
      delay: 1000,
      widget: 'getPregnantFPMSelection',
    }
  ),

  // No FPM branch
  noFPMExplanation: createChatBotMessage(
    " Pupọ julọ awọn tọkọtaya yoo loyun laarin ọdun kan ti wọn ba ni ibalopọ deede ti wọn ko si lo idena oyun.  Ṣugbọn eyi yatọ laarin awọn ẹni-kọọkan ati pé o da lori ọpọlọpọ awọn okunfa.", 
    {
      delay: 500,
    }
  ),
  
  tryingDurationQuestion: createChatBotMessage(" A ti igba wo lo ti n gbìyànjú lati loyun?", {
    delay: 1000,
    widget: 'getPregnantTryingDuration',
  }),

  generalAdvice: createChatBotMessage(
    "O ye wa wí pé eleyi lè fa idaamu, ṣugbọn ma ṣe fòyà, o kan le pẹ diẹ lati loyun padà.O le pe asoju ìpè lórí 7790 láti gbọ alaye kikun síi. Se o fẹ béèrè àwọn ìbéèrè síi?", 
    {
      delay: 500,
    }
  ),

  // IUD branch
  iudExplanation: createChatBotMessage(
    "To get pregnant the IUD needs to be removed Return to fertility is immediate, or it may take a week or two to become fertile.* *In most cases, you can become pregnant in the first cycle after removal.", 
    {
      delay: 500,
    }
  ),
  
  iudRemovalQuestion: createChatBotMessage(
    "Have you already removed the IUD for more than a year and still can not get pregnant?", 
    {
      delay: 1000,
      widget: 'getPregnantIUDRemoval',
    }
  ),

  iudMoreThanYear: createChatBotMessage(
    "I understand it could be frustrating, so it might be good to talk to a specialist and get more detailed advice.", 
    {
      delay: 500,
    }
  ),

  iudLessThanYear: createChatBotMessage(
    "O ye wa wí pé eleyi lè fa idaamu, ṣugbọn ma ṣe fòyà, o kan le pẹ diẹ lati loyun padà. O le pe asoju ìpè lórí 7790 láti gbọ alaye kikun síi.", 
    {
      delay: 500,
    }
  ),

  iudNotRemoved: createChatBotMessage(
    "Jọwọ ṣabẹwo si ile-iwosan nibiti o ti gba ilana yii tabi ile-iwosan ti o wa nitosi re lati yọ kuro.", 
    {
      delay: 500,
    }
  ),

  // Implant branch
  implantExplanation: createChatBotMessage(
    "To get pregnant the Implant needs to be removed The earliest possible time to get pregnant is within 1 week of having the rod removed, but usually fertility is fully restored within 3 weeks.", 
    {
      delay: 500,
    }
  ),
  
  implantRemovalQuestion: createChatBotMessage(
    "Se o ti yọ ìlànà ifètò ṣọmọ bibi alapa fun osu meta oo de ti loyun?", 
    {
      delay: 1000,
      widget: 'getPregnantImplantRemoval',
    }
  ),

  implantLongerThan3Months: createChatBotMessage(
    "I understand not being able to get pregnant might be frustrating. It is good to talk to a specialist and get more detailed advice", 
    {
      delay: 500,
    }
  ),

  implantLessThan3Months: createChatBotMessage(
    "O ye mi wí pé eleyi lè fa idaamu fún ọ, o dára ki o gba imọran kíkún síi láti ọwọ ọjọgbọn oníṣègùn.", 
    {
      delay: 500,
    }
  ),

  implantNotRemoved: createChatBotMessage(
    "Jọwọ ṣabẹwo si ile-iwosan nibiti o ti gba ilana yii tabi ile-iwosan ti o wa nitosi re lati yọ kuro.", 
    {
      delay: 500,
    }
  ),

  // Injection branch
  injectionExplanation: createChatBotMessage(
    "To get pregnant you need to stop taking the injection.\n\nIn most cases, it's possible to become pregnant after 3 months which is the duration of the injection.\n\nBut it can take up to six month for the complete effect of the hormone to wear off and to begin ovulating and having regular periods again", 
    {
      delay: 500,
    }
  ),
  
  injectionStopQuestion: createChatBotMessage(
    "Ṣé o ti dáwọ́ lílò oògùn náà dúró ju oṣù mẹfa lọ, ṣùgbọ́n o ṣi kò lè lóyún?", 
    {
      delay: 1000,
      widget: 'getPregnantInjectionStop',
    }
  ),

  injectionStoppedYes: createChatBotMessage(
    "O ye mi wí pé eleyi lè fa idaamu fún ọ, o dára ki o gba imọran kíkún síi láti ọwọ ọjọgbọn oníṣègùn.", 
    {
      delay: 500,
    }
  ),

  injectionStoppedNo: createChatBotMessage(
    "No worries, women who stop using the injection usually experience at least 6 months of delay before pregnancy but depending on your body it may be longer.", 
    {
      delay: 500,
    }
  ),

  // Pills branch
  pillsExplanation: createChatBotMessage(
    "To get pregnant you need to stop taking the pill. The pill stops your body from ovulating, but as soon as you stop taking the pill, Your ovulation will start again . So, it's possible to get pregnant as soon as you stop the pill.", 
    {
      delay: 500,
    }
  ),
  
  pillsStopQuestion: createChatBotMessage(
    "Ṣé o ti dáwọ́ lílò oògùn náà dúró ju oṣù mẹta lọ, ṣùgbọ́n o ṣi kò lè lóyún?", 
    {
      delay: 1000,
      widget: 'getPregnantPillsStop',
    }
  ),

  pillsStoppedNo: createChatBotMessage(
    "I understand that it might be frustrating. But no worries, women who stop using the Pills experience no delay in getting pregnant. Call 7790 and requestto speak to a nurse counsellor if you still have concerns.", 
    {
      delay: 500,
    }
  ),

  // Condoms branch
  condomsAdvice: createChatBotMessage(
    "To get pregnant you need to stop using condoms. So, it's possible to get pregnant as soon as you stop using the condoms. Most couples will get pregnant within a year if they have regular sex and don't use contraception. But this is very individual and dependent on many factors.", 
    {
      delay: 500,
    }
  ),

  // Emergency pills branch
  emergencyPillsAdvice: createChatBotMessage(
    "To get pregnant you need to stop taking emergency pills. So, it's possible to get pregnant as soon as you stop the pill. Note that you can not use emergency pill as the main family planning method. Most couples will get pregnant within a year if they have regular sex and don't use contraception. But this is very individual and dependent on many factors.", 
    {
      delay: 500,
    }
  ),

  // Sterilisation branches
  femaleSterilisationAdvice: createChatBotMessage(
    "Nígbà miiran ìlànà adena oyún nini obinrin se e yipada.O le jẹ lẹsẹkẹsẹ lẹhin tabi paapaa ọpọlọpọ ọdun nigba mii.Jọwọ ṣe abẹwo si olupese ìlera rẹ fun imọran.", 
    {
      delay: 500,
    }
  ),

  maleSterilisationAdvice: createChatBotMessage(
    "Nigba miiran ìlànà adena ọmọ bíbí ti  okunrin se e yipada. O le jẹ lẹsẹkẹsẹ lẹhin tabi paapaa ọpọlọpọ ọdun nigba mii.Jọwọ ṣe abẹwo si olupese ilera rẹ fun imọran.", 
    {
      delay: 500,
    }
  ),

  // Next action question
  nextActionQuestion: createChatBotMessage("Kí ni o fẹ́ ṣe ní tẹ̀síwájú?", {
    delay: 1000,
    widget: 'getPregnantNextAction',
  }),

  // Ask more questions response
  askMoreQuestions: createChatBotMessage("O dara!", {
    delay: 500,
  }),
  
  askMoreQuestionsPrompt: createChatBotMessage(
    "Jọwọ mọ wipe mo je Oludamọran Ifeto ṣọmọ bíbí àti pé ibeere ti o jẹ mọ Ifeto ṣọmọ bíbí nikan ni mo le dá. Kin ni ìbéèrè rẹ?", 
    {
      delay: 1000,
    }
  ),
};

// Initial messages for get pregnant flow
export const getPregnantInitialMessages = [
  getPregnantMessages.introduction,
  getPregnantMessages.fpmQuestion,
];
