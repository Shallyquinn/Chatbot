import React, { JSX } from 'react';
import AudioWidget from './AudioWidget';
import ImageWidget from './ImageWidget';
import VideoLinkWidget from './VideoLinkWidget';
import { MediaWidgetProps } from '../chatbot/config';

// Import all product audios
import { productAudios } from '../assets/productAudios';

// Import all product images
import { productImages } from '../assets/productImages';

// Define the structure for media widget configuration
interface MediaWidgetConfig {
  widgetName: string;
  widgetFunc: (props: MediaWidgetProps) => JSX.Element;
}

// =============================================================================
// AUDIO WIDGETS - Generated from productAudios.ts
// =============================================================================
export const audioWidgets: MediaWidgetConfig[] = [
  {
    widgetName: "dailyPillsAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.dailyPills} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "diaphragmAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.diaphragm} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "hormonalIUSAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.hormonalIUS} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "howToUseDiaphragmGelAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.howToUseDiaphragmGel} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "implantsAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.implants} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "iudAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.iud} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "lubricantsAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.lubricants} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "mifepakAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.mifepak} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "misofemAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.misofem} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "penegraAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.penegra} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "postpillAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.postpill} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "progestaAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.progesta} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "removeCondomAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.removeCondom} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "sayanaPressAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.sayanaPress} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "useCondomAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.useCondom} 
        actionProvider={props.actionProvider}
      />
    ),
  },
  // Legacy audio widgets for backward compatibility
  {
    widgetName: "lubricantAudio",
    widgetFunc: (props: MediaWidgetProps) => (
      <AudioWidget 
        src={productAudios.lubricants} 
        actionProvider={props.actionProvider}
      />
    ),
  },
];

// =============================================================================
// IMAGE WIDGETS - Generated from productImages.ts
// =============================================================================
export const imageWidgets: MediaWidgetConfig[] = [
  {
    widgetName: "desofemImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.desofem} 
        alt="Desofem Contraceptive Pills"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "dianofemImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.dianofem} 
        alt="Dianofem Contraceptive Pills"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "diaphragmImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.diaphragm} 
        alt="Diaphragm Contraceptive Device"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "durexCondomImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.durexCondom} 
        alt="Durex Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "eloiraaImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.eloiraa} 
        alt="Eloiraa Contraceptive Product"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "femaleCondomImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.femaleCondom} 
        alt="Female Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "fiestaCondomImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.fiestaCondom} 
        alt="Fiesta Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "goldCircleCondomImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.goldCircleCondom} 
        alt="Gold Circle Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "implanonImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.implanon} 
        alt="Implanon Contraceptive Implant"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "jadelleImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.jadelle} 
        alt="Jadelle Contraceptive Implant"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "kyJellyImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.kyJelly} 
        alt="KY Jelly Lubricant"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "kissCondomImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.kissCondom} 
        alt="Kiss Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "levofemImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.levofem} 
        alt="Levofem Emergency Contraceptive"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "levoplantImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.levoplant} 
        alt="Levoplant Contraceptive Implant"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "lydiaImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.lydiaResized} 
        alt="Lydia Contraceptive Device"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "postinor2Image",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.postinor2} 
        alt="Postinor 2 Emergency Contraceptive"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "postpillImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.postpill} 
        alt="Postpill Emergency Contraceptive"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "progestaImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.progestaBox} 
        alt="Progesta Injectable Contraceptive"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "sayanaPressImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.sayanaPress} 
        alt="Sayana Press Injectable Contraceptive"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "trojanCondomImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.trojanCondom} 
        alt="Trojan Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  
  {
    widgetName: "fiestaGelImage",
    widgetFunc: (props: MediaWidgetProps) => (
      <ImageWidget 
        src={productImages.fiestaIntimGel}
        alt="Fiesta Intim Gel Product Image"
        actionProvider={props.actionProvider}
      />
    ),
  },
];

// =============================================================================
// VIDEO WIDGETS - Instructional and Product Videos
// =============================================================================
export const videoWidgets: MediaWidgetConfig[] = [
  {
    widgetName: "fiestaGelVideo",
    widgetFunc: (props: MediaWidgetProps) => (
      <VideoLinkWidget 
        url="https://www.youtube.com/watch?v=VtrXlRVaP-c&list=PL0mGkrTWmp4sWe4izabrqUhEVSuQAb-Hd&index=7&pp=iAQB" 
        text="Watch Fiesta Gel Tutorial"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "condomUsageVideo",
    widgetFunc: (props: MediaWidgetProps) => (
      <VideoLinkWidget 
        url="https://www.youtube.com/watch?v=example-condom-usage" 
        text="Watch How to Use Condom"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "diaphragmUsageVideo",
    widgetFunc: (props: MediaWidgetProps) => (
      <VideoLinkWidget 
        url="https://www.youtube.com/watch?v=example-diaphragm-usage" 
        text="Watch Diaphragm Usage Guide"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "implantInsertionVideo",
    widgetFunc: (props: MediaWidgetProps) => (
      <VideoLinkWidget 
        url="https://www.youtube.com/watch?v=example-implant-insertion" 
        text="Watch Implant Insertion Guide"
        actionProvider={props.actionProvider}
      />
    ),
  },
  {
    widgetName: "injectableUsageVideo",
    widgetFunc: (props: MediaWidgetProps) => (
      <VideoLinkWidget 
        url="https://www.youtube.com/watch?v=example-injectable-usage" 
        text="Watch Injectable Usage Guide"
        actionProvider={props.actionProvider}
      />
    ),
  },
];

// =============================================================================
// COMBINED MEDIA WIDGETS - All audio, image, and video widgets
// =============================================================================
export const mediaWidgets: MediaWidgetConfig[] = [
  ...audioWidgets,
  ...imageWidgets,
  ...videoWidgets,
];

// =============================================================================
// CATEGORY-BASED EXPORTS FOR EASY ACCESS
// =============================================================================

// Contraceptive Pills Media
export const contraceptivePillsMedia = mediaWidgets.filter(widget => 
  ['desofemImage', 'dianofemImage', 'levofemImage', 'postinor2Image', 'postpillImage', 'dailyPillsAudio', 'postpillAudio'].includes(widget.widgetName)
);

// Condoms Media
export const condomsMedia = mediaWidgets.filter(widget => 
  ['durexCondomImage', 'femaleCondomImage', 'fiestaCondomImage', 'goldCircleCondomImage', 'kissCondomImage', 'trojanCondomImage', 'useCondomAudio', 'removeCondomAudio', 'condomUsageVideo'].includes(widget.widgetName)
);

// Implants Media
export const implantsMedia = mediaWidgets.filter(widget => 
  ['implanonImage', 'jadelleImage', 'levoplantImage', 'implantsAudio', 'implantInsertionVideo'].includes(widget.widgetName)
);

// Injectables Media
export const injectablesMedia = mediaWidgets.filter(widget => 
  ['sayanaPressImage', 'progestaImage', 'sayanaPressAudio', 'progestaAudio', 'injectableUsageVideo'].includes(widget.widgetName)
);

// Barrier Methods Media
export const barrierMethodsMedia = mediaWidgets.filter(widget => 
  ['diaphragmImage', 'diaphragmAudio', 'howToUseDiaphragmGelAudio', 'diaphragmUsageVideo'].includes(widget.widgetName)
);

// Sexual Health Media
export const sexualHealthMedia = mediaWidgets.filter(widget => 
  ['kyGelImage', 'kyJellyImage', 'fiestaGelImage', 'penegraAudio', 'lubricantsAudio', 'lubricantAudio', 'fiestaGelVideo'].includes(widget.widgetName)
);

// Emergency Contraception Media
export const emergencyContraceptionMedia = mediaWidgets.filter(widget => 
  ['levofemImage', 'postinor2Image', 'postpillImage', 'mifepakAudio', 'misofemAudio', 'postpillAudio'].includes(widget.widgetName)
);

// Instructional Media
export const instructionalMedia = mediaWidgets.filter(widget => 
  ['howToUseDiaphragmGelAudio', 'useCondomAudio', 'removeCondomAudio', 'condomUsageVideo', 'diaphragmUsageVideo', 'implantInsertionVideo', 'injectableUsageVideo'].includes(widget.widgetName)
);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Get widget by name
export const getMediaWidgetByName = (name: string): MediaWidgetConfig | undefined => {
  return mediaWidgets.find(widget => widget.widgetName === name);
};

// Get widgets by category
export const getMediaWidgetsByCategory = (category: string): MediaWidgetConfig[] => {
  const categoryMap: { [key: string]: MediaWidgetConfig[] } = {
    contraceptivePills: contraceptivePillsMedia,
    condoms: condomsMedia,
    implants: implantsMedia,
    injectables: injectablesMedia,
    barrierMethods: barrierMethodsMedia,
    sexualHealth: sexualHealthMedia,
    emergencyContraception: emergencyContraceptionMedia,
    instructional: instructionalMedia,
    audio: audioWidgets,
    image: imageWidgets,
    video: videoWidgets,
  };

  return categoryMap[category] || [];
};

// Get all widget names
export const getAllMediaWidgetNames = (): string[] => {
  return mediaWidgets.map(widget => widget.widgetName);
};

// Search widgets by keyword
export const searchMediaWidgets = (keyword: string): MediaWidgetConfig[] => {
  const normalizedKeyword = keyword.toLowerCase();
  return mediaWidgets.filter(widget => 
    widget.widgetName.toLowerCase().includes(normalizedKeyword)
  );
};

export default mediaWidgets;