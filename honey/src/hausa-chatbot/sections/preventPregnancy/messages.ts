import { MethodInfo, ContraceptiveMethod } from './preventPregnancyTypes';

export const EMERGENCY_INFO = {
  description:
    'To avoid pregnancy after unprotected sex, you can take emergency contraceptive pills. Emergency contraceptive pills are taken immediately after unprotected sex to prevent pregnancy. Emergency pills are very effective when taken within 24 to 72 hours after unprotected sex. You are advised to not take it more than 3 times in a month. If you are ovulating, you should use an alternative contraceptive plan (condoms). Please note that they are not effective if you are already pregnant.',
  products: {
    intro:
      'Let me tell you some of the effective and available emergency contraceptive pills. Postpill can be taken within 5 days after sex, while Postinor2 is effective within 3 days. Which product do you want to learn about?',
    postpill: {
      info: 'Postpill is a one-dose emergency contraceptive pill by DKT. It contains 1.5 mg Levongestrel. POSTPILL should be taken orally as soon as possible within 24 hours but can still be taken within 5 days (120 hours) of unprotected sex. You can buy Postpill at any pharmacy or health store around you.',
      timeLimit:
        "If more than 120 hours (5 days) have passed since unprotected sex, it won't be effective. In such a situation, kindly consult a healthcare provider as soon as possible to explore other options.",
    },
    postinor: {
      info: "Postinor is an Emergency Contraceptive Pill (ECP) that safely prevents unwanted pregnancy within 72 hours after unprotected sexual intercourse. It doesn't work if you are already pregnant and will not harm an already established pregnancy. The sooner you take POSTINOR, the more effective it is. You can buy Postinor at any pharmacy or health store around you.",
      timeLimit:
        "If more than 72 hours (3 days) have passed since unprotected sex, it won't be effective. In such a situation, kindly consult a healthcare provider as soon as possible to explore other options. It's essential not to delay seeking medical advice in such cases to address any potential risks.",
    },
  },
};

export enum EmergencyProduct {
  Postpill = 'postpill',
  Postinor = 'postinor',
}

export const METHOD_INFO: Partial<Record<ContraceptiveMethod, MethodInfo>> = {
  daily_pills: {
    name: 'Daily Contraceptive Pills',
    description:
      'Daily pills are combined oral contraceptive (COC) pills for pregnancy prevention, dermatological and gynecological conditions, and management of menstrual irregularities (heavy bleeding, painful menstruation, premenstrual syndrome). They work by thickening the mucus around the cervix, which makes it difficult for sperm to enter the uterus and reach any eggs that may have been released. Daily pills are either a 21-day pack (Dianofem and Desofem) or a 28-day pack (Levofem). One pill is taken each day at about the same time for 21 days. Depending on your pack, you will either have a 7-day break (as in the 21-day pack) or you will take the pill that contains Iron for 7 days (the 28-day pack).',
    whoCanUse: [
      'You can use daily pills if you want a short-term contraceptive method',
      'If you are a breastfeeding mother (from six months after birth)',
      'If you have irregular menstrual cycle',
      "If you don't have migrainous headaches",
      'If you are taking antibiotics, antifungal or antiparasitic medications',
    ],
    whoCannotUse: [
      'If you are a breastfeeding mother from 6 weeks to 6 months postpartum',
      'If you are a smoker and over 35 years old',
      'If you have any of the following medical conditions:',
      'Blood Pressure',
      'Venous thromboembolism',
      'Stroke',
      'Heart Disease',
      'Liver Disease',
      'Breast Cancer',
      'Diabetes',
      'Sickle-cell Anaemia',
    ],
    advantages: [
      'They are very effective if used correctly',
      'Very safe for the majority of women',
      'Return to fertility is very fast',
      'They regularize the menstrual cycle, reduce heavy menstrual flow, and reduce menstrual and ovulation pain',
      'They are simple and easy to use',
    ],
    disadvantages: [
      'They must be taken daily which might be difficult to comply with',
      'They might cause mild and temporary side effects which usually goes away after some weeks such as:',
      'Mild headache',
      'Nausea or vomiting',
      'Spotting or bleeding at intervals',
      'Breast tenderness and soreness to touch',
      'Mood changes',
    ],
    requiresMedicalCheck: true,
    products: ['levofem', 'desofem', 'dianofem'],
    hasAudioOption: true,
  },
  diaphragm: {
    name: 'Diaphragm',
    description:
      "A diaphragm or cap is a type of barrier contraceptive device inserted into the vagina before sex to cover the cervix so that sperm can't get into the womb (uterus). You need to use spermicide with it (spermicides kill sperm). The diaphragm must be left in place for at least 6 hours after sex. The diaphragm is a vaginal barrier contraceptive that is woman-controlled, nonhormonal, and appropriate for women who cannot or do not want to use hormonal contraceptive methods, intrauterine devices, or condoms.",
    whoCanUse: [
      'If you want a safe and effective non-hormonal form of contraceptive',
      'If you cannot use hormonal methods of contraception for medical reasons',
      'If you are breastfeeding',
      'If you have sexual intercourse occasionally',
    ],
    whoCannotUse: [
      'If you have an allergy or are sensitive to latex rubber or spermicide',
      'If you have severe uterine prolapse (when the uterus descends toward or into the vagina)',
      'If have recurrent urinary tract infections',
      'If you lack facilities (soap and water) to taking care of the diaphragm',
    ],
    advantages: [
      'Diaphragms do not have hormones, so no side effects',
      'Good option for women who prefer non-hormonal contraceptive methods',
      'They may be fitted at any time (post-partum mothers must wait for 6 weeks after delivery or mid-trimester abortion)',
      'They can be inserted up to 6 hours before sex to avoid interruption',
      'Only used when needed and gives the woman absolute control',
      'One size fits most women',
      'Portable and convenient - it comes with a specially designed case that is discreet and fits in a bag',
      'Easy to use - insertion and removal gets better with practice',
      'Can be used for up to 2 years with proper care',
    ],
    disadvantages: [
      'They are not readily available in Nigeria',
      'They may be expensive to some users',
      'The user must remember to insert the diaphragm before intercourse and keep it in place for at least 6 hours after sex (but not more than 24 hours)',
      'They require special care and storage',
      'They can cause urinary tract infections',
      'A different size of diaphragm may be required after childbirth or if a woman gains weight',
      'They can be damaged by excessive use or poor storage',
    ],
    hasVideoOption: true,
  },
  // Add other methods...
};

export const PRODUCT_INFO = {
  levofem: {
    name: 'Levofem',
    description:
      'Levofem is a safe, low-dose, combined oral contraceptive used to prevent pregnancy. Each pack contains 21 active yellow tablets and 7 placebo(inactive) tablets which should be taken around the same time daily.',
    usage:
      'How to Use 1. Take your first pill from the packet marked with the correct day of the week, or the first pill of the first colour (phasic pills) 2. Continue to take a pill at the same time each day until the pack is finished. Continue taking pills for seven days (during these seven days you will get a bleed). 3. Start your next pack of pills on the eighth day, whether you are still bleeding or not. This should be the same day of the week as when you took your first pill',
  },
  desofem: {
    name: 'Desofem',
    description:
      'Desofem is a safe and effective pill that contains a combination of an antiandrogen (Cyprolerone Acetate 2mg) and estrogen (Ethinylestradiol 0.035mg) used for the treatment of dermatological and gynecological conditions in women. It also prevents pregnancy. It contains 21 tablets with no placebo (inactive pills).',
    usage:
      'How to Use One pill is taken around the same time daily for 21 days followed by a 7-day break, then continue with the next pack.',
  },
  // Add other products...
};
