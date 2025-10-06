// Import all product images from assets
import desofem from '@/assets/images/desofem.png';
import dianofem from '@/assets/images/dianofem.jpg';
import diaphragm from '@/assets/images/diaphragm.jpeg';
import durexCondom from '@/assets/images/durex-condom.jpg';
import eloiraa from '@/assets/images/eloiraa.jpg';
import femaleCondom from '@/assets/images/female-condom.jpeg';
import fiestaCondom from '@/assets/images/fiesta-condom.png';
import fiestaIntimGel from '@/assets/images/fiesta-intim-gel.jpg';
import goldCircleCondom from '@/assets/images/gold-circle-condom.png';
import implanon from '@/assets/images/implanon.jpg';
import jadelle from '@/assets/images/jadelle.jpg';
import kyJelly from '@/assets/images/k-y_gel.jpg';
import kissCondom from '@/assets/images/kiss-condom.jpeg';
import levofem from '@/assets/images/levofem.jpg';
import levoplant from '@/assets/images/levoplant.png';
import lydiaResized from '@/assets/images/lydia-t-dkt-resized-product-images.jpg';
import postinor2 from '@/assets/images/postinor_2.jpg';
import postpill from '@/assets/images/postpill.jpeg';
import progestaBox from '@/assets/images/progesta-box-1.png';
import sayanaPress from '@/assets/images/sayana-press.jpg';
import trojanCondom from '@/assets/images/trojan-condom.jpeg';

// Export individual images
export {
  desofem,
  dianofem,
  diaphragm,
  durexCondom,
  eloiraa,
  femaleCondom,
  fiestaCondom,
  goldCircleCondom,
  implanon,
  jadelle,
  kyJelly,
  fiestaIntimGel,
  kissCondom,
  levofem,
  levoplant,
  lydiaResized,
  postinor2,
  postpill,
  progestaBox,
  sayanaPress,
  trojanCondom,
};

// Export as object for easy access
export const productImages = {
  desofem,
  dianofem,
  diaphragm,
  durexCondom,
  eloiraa,
  femaleCondom,
  fiestaCondom,
  goldCircleCondom,
  implanon,
  jadelle,
  kyJelly,
  fiestaIntimGel,
  kissCondom,
  levofem,
  levoplant,
  lydiaResized,
  postinor2,
  postpill,
  progestaBox,
  sayanaPress,
  trojanCondom,
};

// Export product categories for better organization
export const contraceptivePills = {
  desofem,
  dianofem,
  levofem,
  postinor2,
  postpill,
};

export const condoms = {
  durexCondom,
  femaleCondom,
  fiestaCondom,
  goldCircleCondom,
  kissCondom,
  trojanCondom,
};

export const implants = {
  implanon,
  jadelle,
  levoplant,
};

export const injectables = {
  sayanaPress,
  progestaBox,
};

export const barriers = {
  diaphragm,
  femaleCondom,
};

export const lubricantsAndGels = {
  kyJelly,
  eloiraa,
  fiestaIntimGel,
};

// Helper function to get image by name
export const getProductImage = (productName: string): string | undefined => {
  const normalizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const imageMap: { [key: string]: string } = {
    desofem: desofem,
    dianofem: dianofem,
    diaphragm: diaphragm,
    durexcondom: durexCondom,
    durex: durexCondom,
    eloiraa: eloiraa,
    femalecondom: femaleCondom,
    fiestacondom: fiestaCondom,
    fiesta: fiestaCondom,
    fiestaIntimGel: fiestaIntimGel,
    fiestaIntim: fiestaIntimGel,
    fiestagel: fiestaIntimGel,
    goldcirclecondom: goldCircleCondom,
    goldcircle: goldCircleCondom,
    implanon: implanon,
    jadelle: jadelle,
    kyJelly: kyJelly,
    ky: kyJelly,
    kisscondom: kissCondom,
    kiss: kissCondom,
    levofem: levofem,
    levoplant: levoplant,
    lydia: lydiaResized,
    postinor2: postinor2,
    postinor: postinor2,
    postpill: postpill,
    progestabox: progestaBox,
    progesta: progestaBox,
    sayanapress: sayanaPress,
    sayana: sayanaPress,
    trojancondom: trojanCondom,
    trojan: trojanCondom,
  };

  return imageMap[normalizedName];
};

export default productImages;
