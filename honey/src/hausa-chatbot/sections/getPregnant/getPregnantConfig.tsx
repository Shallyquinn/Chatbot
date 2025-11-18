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
          'Bantaba amfani da wata hanyar tsara iyali ba',
          "Na'urar IUD",
          'Alluran roba na hanu(Implants)',
          'Allurai / Depo-provera / Sayana Press',
          'Sayana Press',
          'Kwayan sha na kullum',
          'Kwaroron roba (condom)',
          'Kwayan sha na gaggawa',
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
        options={['Ƙasa da shekara ɗaya', 'Fiye da shekara ɗaya']}
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
          'Eh, fiye da shekara ɗaya',
          'Eh, ƙasa da shekara ɗaya',
          "A’a, ban cire ba",
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
          'Fiye da watanni uku',
          'Ƙasa da watanni uku',
          "A’a, ban cire ba",
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
        options={['Ee', "A'a"]}
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
        options={['Ee', "A'a"]}
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
            'Yi ƙarin tambayoyi',
            'Nemo asibiti mafi kusa',
            'Koma zuwa babban menu',
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
    ' Da kyau! Ina farin cikin ba ki shawarwari kan tsarin iyali.',
    {
      delay: 500,
    },
  ),

  fpmQuestion: createChatBotMessage(
    'Shin a halin yanzu kina amfani da hanyar tsarin iyali ko kin yi amfani da shi kwanan nan?\n\nZaɓi abin da kake amfani da shi a yanzu. Duba jerin zabuka don ganin sauran su.',
    {
      delay: 1000,
      widget: 'getPregnantFPMSelection',
    },
  ),

  // No FPM branch
  noFPMExplanation: createChatBotMessage(
    "Yawancin ma'aurata za su yi ciki cikin shekara guda idan suna yin jima'i akai-akai kuma ba sa amfani da kayan hana haihuwa. Amma wannan yana bambanta tsakanin mutane kuma yana dogara da abubuwa da yawa.",
    {
      delay: 500,
    },
  ),

  tryingDurationQuestion: createChatBotMessage(
    'Na tsawon wani lokaci kike ƙoƙarin samun ciki?',
    {
      delay: 1000,
      widget: 'getPregnantTryingDuration',
    },
  ),

  generalAdvice: createChatBotMessage(
    "Na gane! Babu damuwa, daukar ciki na iya ɗaukar ɗan lokaci kaɗan. Duk da haka, mun fahimci yana iya zama abin takaici.  Ina ba da shawara ka ziyarci ma'aikacin kiwon lafiya don ingantaccen bincike da jagorar likita.",
    {
      delay: 500,
    },
  ),

  // IUD branch
  iudExplanation: createChatBotMessage(
    "Don samun ciki, dole ne a cire na'urar IUD. Dawowar haihuwa (fertility) na iya kasancewa nan da nan, ko kuma yana iya ɗaukar mako ɗaya zuwa biyu kafin ki zama cikin hali na daukar ciki. A mafi yawan lokuta, za ki iya samun ciki a zagayowar farko na al'adarki bayan cire IUD.",
    {
      delay: 500,
    },
  ),

  iudRemovalQuestion: createChatBotMessage(
    "Shin kin cire IUD wato Na'urar hana daukar ciki ta cikin mahaifa fiye da shekara guda kuma har yanzu ba ki iya yin ciki ba?",
    {
      delay: 1000,
      widget: 'getPregnantIUDRemoval',
    },
  ),

  iudMoreThanYear: createChatBotMessage(
    'Na fahimci cewa hakan na iya zama abin takaici, don haka yana da kyau a yi magana da ƙwararren likita kuma a samu shawara mafi dacewa.',
    {
      delay: 500,
    },
  ),

  iudLessThanYear: createChatBotMessage(
    'Mun fahimci cewa wannan na iya zama abin takaici, amma kada ki damu, samun ciki na iya ɗaukar ɗan lokaci. Don Allah ki ziyarci likitan lafiyarki don samun shawara mafi inganci.',
    {
      delay: 500,
    },
  ),

  iudNotRemoved: createChatBotMessage(
    'Muna ba da shawarar ki ziyarci asibitin da kika fara amfani da hanyar hana daukar ciki ko wani asibiti da ke kusa domin cire shi.',
    {
      delay: 500,
    },
  ),

  // Implant branch
  implantExplanation: createChatBotMessage(
    "Don samun ciki, dole ne a cire Implant. Mafi ƙanƙancin lokacin da za a iya samun ciki shi ne cikin mako ɗaya bayan cire sandar (rod), amma yawanci haihuwa tana dawowa gaba ɗaya cikin makonni 3.",
    {
      delay: 500,
    },
  ),

  implantRemovalQuestion: createChatBotMessage(
    "Shin kin cire allurar roban hannu fiye da watanni uku (3) kuma har yanzu ba ki iya daukan ciki ba?",
    {
      delay: 1000,
      widget: 'getPregnantImplantRemoval',
    },
  ),

  implantLongerThan3Months: createChatBotMessage(
    'Na fahimci cewa rashin samun ciki na iya zama abin damuwa. Yana da kyau a yi magana da ƙwararren likita don samun shawara mafi inganci.',
    {
      delay: 500,
    },
  ),

  implantLessThan3Months: createChatBotMessage(
    ' Na san yana iya zama abin takaici, amma babu damuwa, daukar ciki na iya ɗaukar ɗan lokaci. Da fatan za ki ziyarci likitan lafiyarki domin samun cikakken bayani da shawara mafi dacewa.',
    {
      delay: 500,
    },
  ),

  implantNotRemoved: createChatBotMessage(
    'Muna ba da shawarar ki ziyarci asibitin da kika fara amfani da hanyar hana ɗaukar ciki ko wani asibiti da ke kusa domin cire shi.',
    {
      delay: 500,
    },
  ),

  // Injection branch
  injectionExplanation: createChatBotMessage(
    "Don samun ciki, dole ne ki daina karɓar allurar hana ɗaukar ciki.\n\nA mafi yawan lokuta, yana yiwuwa a sami ciki bayan watanni 3, wanda shi ne tsawon lokacin da allurar ke aiki.\n\nAmma yana iya ɗaukar har zuwa watanni 6 kafin tasirin hormone ya ƙare gaba ɗaya, sannan ki fara fitowar kwai (ovulation) da komawa da jinin al’ada yadda ya saba.",
    {
      delay: 500,
    },
  ),

  injectionStopQuestion: createChatBotMessage(
    'Shin kun daina shan allurar fiye da watanni 6 kuma har yanzu ba za ku iya samun ciki ba?',
    {
      delay: 1000,
      widget: 'getPregnantInjectionStop',
    },
  ),

  injectionStoppedYes: createChatBotMessage(
    'Na fahimci cewa rashin samun ciki na iya zama abin takaici. Yana da kyau a yi magana da ƙwararren likita kuma a samu shawara mafi inganci.',
    {
      delay: 500,
    },
  ),

  injectionStoppedNo: createChatBotMessage(
    'Kada ki damu, mata da suka daina amfani da allurar hana haihuwa yawanci suna fuskantar jinkiri na akalla watanni shida kafin su sake samun ciki, amma wannan yana iya ɗaukar lokaci mai tsawo bisa yadda jikin mutum yake.',
    {
      delay: 500,
    },
  ),

  // Pills branch
  pillsExplanation: createChatBotMessage(
    "Don samun ciki, dole ne a daina shan kwayar hana haihuwa. Wannan kwayar tana hana jiki yin ƙwai (ovulation), amma da zarar an daina shan ta, jikin zai fara yin ƙwai kuma. Saboda haka, yana yiwuwa ki samu ciki da zarar kika daina shan kwayar.",
    {
      delay: 500,
    },
  ),

  pillsStopQuestion: createChatBotMessage(
    "Shin kin daina shan kwayar hana daukar ciki fiye da watanni 3 kuma har yanzu ba ki sami ciki ba?",
    {
      delay: 1000,
      widget: 'getPregnantPillsStop',
    },
  ),

  pillsStoppedNo: createChatBotMessage(
    'Na fahimci cewa hakan na iya zama abin damuwa. Amma kar ki damu, mata da suka daina amfani da kwayar hana haihuwa (Pills) ba sa fuskantar jinkiri wajen samun ciki. Ki kira 7790 ki nemi yin magana da jami’ar lafiya (nurse counsellor) idan har kina da wasu damuwa.',
    {
      delay: 500,
    },
  ),

  // Condoms branch
  condomsAdvice: createChatBotMessage(
    "Don samun ciki, dole ne a daina amfani da kwandom (condom). Saboda haka, yana yiwuwa ki samu ciki da zarar kika daina amfani da shi. Mafi yawan ma’aurata suna samun ciki cikin shekara guda idan suna yin jima’i akai-akai ba tare da amfani da wata hanyar hana haihuwa ba. Amma wannan yana bambanta daga mutum zuwa mutum, saboda abubuwa da dama suna iya shafar hakan.",
    {
      delay: 500,
    },
  ),

  // Emergency pills branch
  emergencyPillsAdvice: createChatBotMessage(
    "Don samun ciki, dole ne a daina shan kwayar gaggawa (emergency pill). Saboda haka, yana yiwuwa ki samu ciki da zarar kika daina shan kwayar. Ki lura cewa ba za a yi amfani da kwayar gaggawa a matsayin hanya mai inganci hanyar hana haihuwa ba. Mafi yawan ma’aurata suna samun ciki cikin shekara guda idan suna yin jima’i akai-akai ba tare da wata hanya ta hana haihuwa ba. Amma wannan yana da bambanci bisa ga yanayin jikin kowa.",
    {
      delay: 500,
    },
  ),

  // Sterilisation branches
  femaleSterilisationAdvice: createChatBotMessage(
    'Wani lokaci dashen mata (female sterilisation) yana iya dawowa. Wannan na iya faruwa nan da nan ko bayan wasu shekaru. Don haka, ki ziyarci asibiti don samun karin bayani daga ƙwararren ma’aikacin lafiya game da matsayin dashenki.',
    {
      delay: 500,
    },
  ),

  maleSterilisationAdvice: createChatBotMessage(
    'Haka kuma, wani lokaci dashen maza (male sterilisation) yana iya dawowa. Wannan ma yana iya faruwa nan da nan ko bayan wasu shekaru. Don haka, ka ziyarci asibiti domin samun karin bayani daga ƙwararren ma’aikacin lafiya game da matsayin dashenka.',
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
  askMoreQuestions: createChatBotMessage('Toh, shikenan!', {
    delay: 500,
  }),

  askMoreQuestionsPrompt: createChatBotMessage(
    'Don Allah a lura cewa ni bot ne na tsara iyali (family planning bot), kuma ina iya amsa tambayoyi da suka shafi tsara iyali ne kawai. Menene tambayarka?',
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
