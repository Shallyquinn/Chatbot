// Import all product audio files from assets/Audio pidgin folder
import dailyPillsAudio from "@/assets/Audio pidgin/Daily Pills.mp3";
import diaphragmAudio from "@/assets/Audio pidgin/Diaphragm.mp3";
import hormonalIUSAudio from "@/assets/Audio pidgin/Hormonal IUS.mp3";
import howToUseDiaphragmGelAudio from "@/assets/Audio pidgin/How to Use Diaphragm Gel.mp3";
import implantsAudio from "@/assets/Audio pidgin/Implants.mp3";
import iudAudio from "@/assets/Audio pidgin/IUD.mp3";
import lubricantsAudio from "@/assets/Audio pidgin/Lubricants.mp3";
import mifepakAudio from "@/assets/Audio pidgin/Mifepak.mp3";
import misofemAudio from "@/assets/Audio pidgin/Misofem.mp3";
import penegraAudio from "@/assets/Audio pidgin/Penegra.mp3";
import postpillAudio from "@/assets/Audio pidgin/Postpill.mp3";
import progestaAudio from "@/assets/Audio pidgin/Progesta.mp3";
import removeCondomAudio from "@/assets/Audio pidgin/Remove a Male Condom.mp3";
import sayanaPressAudio from "@/assets/Audio pidgin/Sayana Press.mp3";
import useCondomAudio from "@/assets/Audio pidgin/Use a Male Condom.mp3";

// Export individual audio files
export {
  dailyPillsAudio,
  diaphragmAudio,
  hormonalIUSAudio,
  howToUseDiaphragmGelAudio,
  implantsAudio,
  iudAudio,
  lubricantsAudio,
  mifepakAudio,
  misofemAudio,
  penegraAudio,
  postpillAudio,
  progestaAudio,
  removeCondomAudio,
  sayanaPressAudio,
  useCondomAudio,
};

// Export as object for easy access
export const productAudios = {
  dailyPills: dailyPillsAudio,
  diaphragm: diaphragmAudio,
  hormonalIUS: hormonalIUSAudio,
  howToUseDiaphragmGel: howToUseDiaphragmGelAudio,
  implants: implantsAudio,
  iud: iudAudio,
  lubricants: lubricantsAudio,
  mifepak: mifepakAudio,
  misofem: misofemAudio,
  penegra: penegraAudio,
  postpill: postpillAudio,
  progesta: progestaAudio,
  removeCondom: removeCondomAudio,
  sayanaPress: sayanaPressAudio,
  useCondom: useCondomAudio,
};

// Export audio categories for better organization
export const contraceptivePillsAudio = {
  dailyPills: dailyPillsAudio,
  postpill: postpillAudio,
  mifepak: mifepakAudio,
  misofem: misofemAudio,
};

export const longActingMethodsAudio = {
  implants: implantsAudio,
  iud: iudAudio,
  hormonalIUS: hormonalIUSAudio,
};

export const injectablesAudio = {
  sayanaPress: sayanaPressAudio,
  progesta: progestaAudio,
};

export const barriersAudio = {
  diaphragm: diaphragmAudio,
  howToUseDiaphragmGel: howToUseDiaphragmGelAudio,
  useCondom: useCondomAudio,
  removeCondom: removeCondomAudio,
};

export const sexualHealthAudio = {
  penegra: penegraAudio,
  lubricants: lubricantsAudio,
};

export const instructionalAudio = {
  howToUseDiaphragmGel: howToUseDiaphragmGelAudio,
  useCondom: useCondomAudio,
  removeCondom: removeCondomAudio,
};

// Helper function to get audio by name
export const getProductAudio = (audioName: string): string | undefined => {
  const normalizedName = audioName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const audioMap: { [key: string]: string } = {
    dailypills: dailyPillsAudio,
    daily: dailyPillsAudio,
    pills: dailyPillsAudio,
    diaphragm: diaphragmAudio,
    hormonalius: hormonalIUSAudio,
    hormonal: hormonalIUSAudio,
    ius: hormonalIUSAudio,
    howtousediaphragmgel: howToUseDiaphragmGelAudio,
    diaphragmgel: howToUseDiaphragmGelAudio,
    implants: implantsAudio,
    implant: implantsAudio,
    iud: iudAudio,
    lubricants: lubricantsAudio,
    lubricant: lubricantsAudio,
    lubes: lubricantsAudio,
    mifepak: mifepakAudio,
    misofem: misofemAudio,
    penegra: penegraAudio,
    erection: penegraAudio,
    postpill: postpillAudio,
    emergency: postpillAudio,
    progesta: progestaAudio,
    removecondom: removeCondomAudio,
    removemalecondom: removeCondomAudio,
    sayanapress: sayanaPressAudio,
    sayana: sayanaPressAudio,
    injection: sayanaPressAudio,
    usecondom: useCondomAudio,
    usemalecondom: useCondomAudio,
    condom: useCondomAudio,
  };

  return audioMap[normalizedName];
};

// Helper function to get audio by category
export const getAudioByCategory = (category: string): { [key: string]: string } => {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  const categoryMap: { [key: string]: { [key: string]: string } } = {
    pills: contraceptivePillsAudio,
    contraceptivepills: contraceptivePillsAudio,
    longacting: longActingMethodsAudio,
    implants: longActingMethodsAudio,
    injectables: injectablesAudio,
    injections: injectablesAudio,
    barriers: barriersAudio,
    condoms: barriersAudio,
    sexual: sexualHealthAudio,
    sexualhealth: sexualHealthAudio,
    instructions: instructionalAudio,
    instructional: instructionalAudio,
    howto: instructionalAudio,
  };

  return categoryMap[normalizedCategory] || {};
};

// Helper function to get all audio names
export const getAllAudioNames = (): string[] => {
  return Object.keys(productAudios);
};

// Helper function to search audio by keyword
export const searchAudioByKeyword = (keyword: string): { [key: string]: string } => {
  const normalizedKeyword = keyword.toLowerCase();
  const results: { [key: string]: string } = {};

  Object.entries(productAudios).forEach(([key, audio]) => {
    if (key.toLowerCase().includes(normalizedKeyword)) {
      results[key] = audio;
    }
  });

  return results;
};

export default productAudios;