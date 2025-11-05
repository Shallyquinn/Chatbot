import { MethodInfo } from './preventPregnancyTypes';

// Daily Pills Information
export const DAILY_PILLS_INFO: MethodInfo = {
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
    'May cause side effects like headaches, nausea, breast tenderness',
    "Doesn't protect against STIs/HIV",
    'May not be suitable for women with certain medical conditions',
    'Can be affected by some medications',
  ],
  sideEffects: [
    'Headaches',
    'Nausea',
    'Breast tenderness',
    'Irregular bleeding or spotting',
    'Mood changes',
  ],
  requiresMedicalCheck: true,
  products: ['Dianofem', 'Desofem', 'Levofem'],
  hasAudioOption: true,
  hasVideoOption: true,
  audioWidget: 'daily_pills_audio',
  audioPrompt: 'Listen to learn more about daily contraceptive pills',
  imageWidget: 'daily_pills_image',
  imagePrompt:
    'These are examples of daily contraceptive pills available in Nigeria',
};

// Emergency Pills Information
export const EMERGENCY_PILLS_INFO: MethodInfo = {
  name: 'Emergency Contraceptive Pills',
  description:
    'Emergency contraceptive pills are taken immediately after unprotected sex to prevent pregnancy. They are very effective when taken within 24 to 72 hours after unprotected sex. You are advised to not take them more than 3 times in a month. If you are ovulating, you should use an alternative contraceptive plan (condoms). Please note that they are not effective if you are already pregnant.',
  whoCanUse: [
    'Women who have had unprotected sex within the last 3-5 days',
    'Women who experienced contraceptive failure (e.g., broken condom)',
    'Victims of sexual assault',
    'Women who missed their regular contraceptive pills',
  ],
  whoCannotUse: [
    'If you are already pregnant',
    'If you have severe liver disease',
    'If you are allergic to any components of emergency contraceptive pills',
    'If more than 5 days have passed since unprotected sex',
  ],
  advantages: [
    'Can prevent pregnancy after unprotected sex',
    'Easy to use',
    'Widely available over the counter',
    'Safe for most women',
    'No long-term effects on fertility',
  ],
  disadvantages: [
    'Not suitable for regular contraception',
    'May cause temporary side effects',
    'Less effective than regular contraceptive methods',
    'Does not protect against STIs/HIV',
    'Should not be used more than 3 times in a month',
  ],
  sideEffects: [
    'Nausea',
    'Vomiting',
    'Headache',
    'Breast tenderness',
    'Irregular bleeding',
    'Fatigue',
  ],
  requiresMedicalCheck: false,
  products: ['Postpill', 'Postinor2'],
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'emergency_pills_image',
  imagePrompt:
    'These are examples of emergency contraceptive pills available in Nigeria',
  audioWidget: 'emergency_pills_audio',
  audioPrompt: 'Listen to learn more about emergency contraceptive pills',
};

// IUD Information
export const IUD_INFO: MethodInfo = {
  name: 'Intrauterine Device (Copper IUD)',
  description:
    'An IUD is a small, T-shaped device made of copper that is placed in your uterus by a healthcare provider. The copper IUD works by preventing sperm from fertilizing an egg and may also prevent implantation. It can provide contraception for up to 10-12 years and can be removed at any time if you want to become pregnant.',
  whoCanUse: [
    'Women seeking long-term contraception',
    'Women who want a hormone-free option',
    "Women who have completed their family but don't want permanent contraception",
    'Women who cannot use hormonal contraceptives',
    'Women who are breastfeeding',
  ],
  whoCannotUse: [
    'If you are pregnant or suspect pregnancy',
    'If you have an active pelvic infection',
    'If you have unexplained vaginal bleeding',
    'If you have certain uterine abnormalities',
    "If you have Wilson's disease (copper allergy)",
    'If you have heavy periods or severe menstrual pain',
  ],
  advantages: [
    'Very effective (>99%)',
    'Long-lasting (up to 10-12 years)',
    "No hormones - suitable for women who can't use hormonal methods",
    'Can be used as emergency contraception if inserted within 5 days of unprotected sex',
    'Fertility returns immediately after removal',
    'Does not interfere with sex',
  ],
  disadvantages: [
    'May cause heavier periods and more cramps',
    'Must be inserted and removed by a healthcare provider',
    'Small risk of expulsion or perforation during insertion',
    'Does not protect against STIs/HIV',
    'May cause irregular bleeding in the first few months',
  ],
  sideEffects: [
    'Heavier periods',
    'Longer periods',
    'More menstrual cramps',
    'Irregular bleeding',
    'Spotting between periods',
    'Possible expulsion',
  ],
  requiresMedicalCheck: true,
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'iud_image',
  imagePrompt: 'This is what a copper IUD looks like',
  audioWidget: 'iud_audio',
  audioPrompt: 'Listen to learn more about IUDs',
};

// IUS Information
export const IUS_INFO: MethodInfo = {
  name: 'Intrauterine System (Hormonal IUS)',
  description:
    "An IUS is a small, T-shaped device that releases a low dose of progestogen hormone into your uterus. It works by preventing sperm from fertilizing an egg and making the lining of your uterus thinner so it's less likely to accept a fertilized egg. It can provide contraception for 3-5 years depending on the type.",
  whoCanUse: [
    'Women seeking long-term contraception',
    'Women who want lighter periods',
    'Women with heavy or painful periods',
    'Breastfeeding mothers',
    'Women who have had children',
  ],
  whoCannotUse: [
    'If you are pregnant or suspect pregnancy',
    'If you have an active pelvic infection',
    'If you have unexplained vaginal bleeding',
    'If you have certain uterine abnormalities',
    'If you have breast cancer or other progesterone-sensitive cancers',
    'If you have severe liver disease',
  ],
  advantages: [
    'Very effective (>99%)',
    'Long-lasting (3-5 years)',
    'May make periods lighter or stop them completely',
    'Reduces period pain and premenstrual symptoms',
    'Fertility returns quickly after removal',
    'Does not interfere with sex',
  ],
  disadvantages: [
    'Must be inserted and removed by a healthcare provider',
    'May cause irregular bleeding in the first few months',
    'Hormonal side effects are possible',
    'More expensive initially than other methods',
    'Does not protect against STIs/HIV',
  ],
  sideEffects: [
    'Irregular bleeding or spotting initially',
    'Hormonal side effects (headaches, breast tenderness)',
    'Mood changes',
    'Acne',
    'Possible ovarian cysts',
    'Small risk of expulsion',
  ],
  requiresMedicalCheck: true,
  products: ['Mirena', 'Kyleena'],
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'ius_image',
  imagePrompt: 'This is what a hormonal IUS looks like',
  audioWidget: 'ius_audio',
  audioPrompt: 'Listen to learn more about hormonal IUS',
};

// Injectable Contraceptives Information
export const INJECTABLES_INFO: MethodInfo = {
  name: 'Injectable Contraceptives',
  description:
    'Injectable contraceptives contain hormones that prevent pregnancy. They are given as injections every 2 or 3 months, depending on the type. The most common types in Nigeria are Depo-Provera (every 3 months) and Noristerat (every 2 months). They work by preventing ovulation and thickening cervical mucus to prevent sperm from reaching an egg.',
  whoCanUse: [
    'Women who want medium-term contraception',
    'Breastfeeding mothers (from 6 weeks after childbirth)',
    'Women who cannot use estrogen-containing contraceptives',
    'Women who have difficulty remembering to take daily pills',
    'Women with sickle cell disease',
  ],
  whoCannotUse: [
    'If you are pregnant or suspect pregnancy',
    'If you have unexplained vaginal bleeding',
    'If you have breast cancer',
    'If you have severe liver disease',
    'If you have a history of blood clots',
    'If you have multiple risk factors for cardiovascular disease',
  ],
  advantages: [
    'Long-lasting (2-3 months per injection)',
    'Very effective when used correctly',
    'Can be used while breastfeeding',
    'May reduce menstrual cramps and pain',
    "Private - no one needs to know you're using it",
    'Does not interfere with sex',
  ],
  disadvantages: [
    'May cause irregular bleeding or spotting',
    'Return to fertility might be delayed after stopping',
    'Cannot be removed from the body once injected',
    'Requires regular clinic visits for injections',
    'Does not protect against STIs/HIV',
  ],
  sideEffects: [
    'Changes in menstrual bleeding',
    'Weight gain',
    'Headaches',
    'Mood changes',
    'Decreased bone density (with long-term use)',
    'Delayed return to fertility',
  ],
  requiresMedicalCheck: true,
  products: ['Progesta', 'Sayana Press'],
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'injectables_image',
  imagePrompt:
    'These are examples of injectable contraceptives available in Nigeria',
  audioWidget: 'injectables_audio',
  audioPrompt: 'Listen to learn more about injectable contraceptives',
  productDetails: {
    Progesta: {
      description:
        'Progesta is an injectable contraceptive, a highly safe and effective contraceptive, injected intramuscularly and sometimes into the anus for 3 months continuously. Its mechanism of action are • thicken cervical mucus. • inhibits ovulation. • thins uterus walls to prevent ovulation.',
      advantages: [
        'Safe, highly effective, discontinued at will',
        'Long-acting',
        'Provided outside the clinic',
        'Reversible, easy to use, private, and non-contraceptive benefit',
      ],
      usage:
        'Injected in the upper arm or buttocks, start at any time during the menstrual cycle. 5 days after menstrual period, abstain from sex for the next 7 days. It can be administered after abortion. Start 6 weeks after delivery for a breastfeeding woman.',
    },
    'Sayana Press': {
      description:
        'Sayana Press is indicated for long-term female contraception. Each subcutaneous injection prevents ovulation and provides contraception for at least 13 weeks',
      hasAudioOption: true,
      hasVideoOption: true,
      audioPrompt: 'Listen to a short introduction of Sayana press in Pidgin',
      videoPrompt: 'Watch a video on how to inject a Sayana Press in Pidgin',
    },
  },
};

// Implants Information
export const IMPLANTS_INFO: MethodInfo = {
  name: 'Contraceptive Implants',
  description:
    'Contraceptive implants are small, flexible rods inserted under the skin, typically in the arm. They release hormones (usually progestin) to prevent pregnancy. They are long-term birth control methods also called long-acting reversible contraception, or LARC. They provide contraception, lasting up to 3 - 5 years but can be removed at any time. They work by preventing the release of egg and thickening the cervical mucus making it difficult for sperm to reach the egg.',
  whoCanUse: [
    'You can use an implant if you want to prevent pregnancy for up to 1 to 3 years',
    'If you are a breastfeeding mother (from 6 weeks after birth)',
    'If you cannot tolerate estrogen',
    "If you don't have migrainous headaches",
    'If you have endometrial or ovarian cancer, you can still use this method',
  ],
  whoCannotUse: [
    'If you have uncontrolled hypertension',
    'If you have venous thromboembolism',
    'If you have had a stroke',
    'If you have heart disease',
    'If you have liver disease',
    'If you have breast cancer',
    'If you have kidney infection',
    'If you have vaginal bleeding',
  ],
  advantages: [
    'They can be used at any time in the menstrual cycle, are very effective, and are removed whenever you want to get pregnant',
    'It gives total privacy, no one will know you have it and does not interfere with sex',
    'No frequent clinical follow-up is needed after initial insertion',
    'It is estrogen-free so many people can use it',
    'They are long-acting and may help prevent ectopic pregnancy',
    'Does not disturb breast milk production',
    'There is no delay in return to fertility when they are removed',
  ],
  disadvantages: [
    'Insertion and removal involve minor surgery and must be performed by a trained professional',
    'You cannot discontinue the method by yourself',
    'May cause headaches',
    'May cause nausea or vomiting',
    'May cause dizziness',
    'May cause breast tenderness',
    'May cause weight gain',
    'May cause menstrual changes',
    'May cause spotting and irregular vaginal bleeding',
  ],
  sideEffects: [
    'Headache',
    'Nausea',
    'Dizziness',
    'Breast tenderness',
    'Weight gain',
    'Menstrual changes',
    'Spotting and irregular bleeding',
  ],
  requiresMedicalCheck: true,
  products: ['Levoplant', 'Jadelle', 'Implanon NXT'],
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'implants_image',
  imagePrompt:
    'This shows what contraceptive implants look like and how they are inserted',
  audioWidget: 'implants_audio',
  audioPrompt: 'Listen to learn more about contraceptive implants',
};

// Export all method information
// Barrier Methods Information
export const BARRIER_METHODS_INFO: MethodInfo = {
  name: 'Barrier Methods',
  description:
    'Barrier methods are physical or chemical barriers that prevent pregnancy by blocking sperm from reaching an egg. The main types are male condoms, female condoms, and diaphragms. They are most effective when used correctly and consistently with every sexual encounter.',
  whoCanUse: [
    'Anyone who wants to prevent pregnancy',
    'People who want protection against STIs (especially condoms)',
    'People who prefer non-hormonal methods',
    'People who have occasional sexual intercourse',
    'People who need temporary contraception',
  ],
  whoCannotUse: [
    'People with latex allergies (for latex condoms)',
    'People who have difficulty with insertion (for female condoms/diaphragms)',
    'People who need very high effectiveness rates',
  ],
  advantages: [
    'Available without prescription',
    'Can be used on demand',
    'No hormonal side effects',
    'Condoms protect against STIs/HIV',
    'Can be stopped at any time',
    'No effect on future fertility',
  ],
  disadvantages: [
    'Must be used correctly every time',
    'May interrupt sexual spontaneity',
    'Requires partner cooperation',
    'May reduce sexual sensation',
    'Need to be stored properly',
  ],
  sideEffects: [
    'Possible latex allergy',
    'Possible irritation',
    'May cause discomfort',
  ],
  requiresMedicalCheck: false,
  products: ['Male condoms', 'Female condoms', 'Diaphragms'],
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'barrier_methods_image',
  imagePrompt: 'These are examples of barrier methods of contraception',
  audioWidget: 'barrier_methods_audio',
  audioPrompt: 'Listen to learn more about barrier methods of contraception',
  productDetails: {
    'Male condoms': {
      description:
        'A thin sheath made of latex, polyurethane, or natural membrane that covers the penis during sexual intercourse',
      usage:
        'Must be put on before any genital contact and used throughout intercourse',
      advantages: [
        'Easy to use',
        'Widely available',
        'Protects against STIs',
        'No prescription needed',
      ],
    },
    'Female condoms': {
      description:
        'A pouch that fits inside the vagina, made of synthetic latex or polyurethane',
      usage: 'Can be inserted up to 8 hours before sexual intercourse',
      advantages: [
        'Can be inserted in advance',
        'Protects against STIs',
        'Alternative for people with latex allergies',
      ],
    },
    Diaphragms: {
      description:
        'A shallow, dome-shaped cup made of silicone that fits over the cervix',
      usage:
        'Must be inserted before intercourse and left in place for 6 hours after',
      advantages: [
        'Reusable',
        'No hormones',
        'Can last several years with proper care',
      ],
    },
  },
};

// Permanent Methods Information
export const PERMANENT_METHODS_INFO: MethodInfo = {
  name: 'Permanent Contraception',
  description:
    'Permanent contraception methods are surgical procedures that provide permanent pregnancy prevention. For women, this involves tubal ligation (cutting or blocking the fallopian tubes). For men, it involves vasectomy (cutting or blocking the tubes that carry sperm).',
  whoCanUse: [
    "People who are certain they don't want any more children",
    'People who are at high risk for pregnancy-related health problems',
    'People who understand the procedure is permanent',
    'People who have completed their desired family size',
  ],
  whoCannotUse: [
    'People who want children in the future',
    'People who are unsure about their decision',
    'People with certain medical conditions that make surgery risky',
    'People under emotional stress or external pressure',
  ],
  advantages: [
    'Very effective (>99%)',
    'Permanent - no need for ongoing contraception',
    'No hormones',
    'Does not affect sexual function or pleasure',
    'No long-term side effects',
  ],
  disadvantages: [
    'Requires surgery',
    'Permanent - difficult or impossible to reverse',
    'Initial recovery period needed',
    'Does not protect against STIs/HIV',
    'Risk of surgical complications',
  ],
  sideEffects: [
    'Post-operative pain',
    'Possible infection',
    'Bleeding',
    'Reaction to anesthesia',
    'Small risk of surgical complications',
  ],
  requiresMedicalCheck: true,
  products: ['Tubal ligation', 'Vasectomy'],
  hasAudioOption: true,
  hasVideoOption: true,
  imageWidget: 'permanent_methods_image',
  imagePrompt: 'This shows what permanent contraception methods involve',
  audioWidget: 'permanent_methods_audio',
  audioPrompt: 'Listen to learn more about permanent contraception methods',
  productDetails: {
    'Tubal ligation': {
      description:
        'A surgical procedure where the fallopian tubes are cut, tied, or blocked to prevent eggs from reaching sperm',
      procedure:
        'Requires general anesthesia and small incisions in the abdomen',
      recovery:
        'Usually requires 2-3 days of rest and up to a week before returning to normal activities',
    },
    Vasectomy: {
      description:
        'A surgical procedure where the tubes carrying sperm from the testicles (vas deferens) are cut or blocked',
      procedure:
        'Usually done under local anesthesia through small incisions in the scrotum',
      recovery:
        'Usually requires 1-2 days of rest and about a week of avoiding heavy activity',
    },
  },
};

// Export all method information
export const METHOD_INFO = {
  daily_pills: DAILY_PILLS_INFO,
  emergency_pills: EMERGENCY_PILLS_INFO,
  injectables: INJECTABLES_INFO,
  iud: IUD_INFO,
  ius: IUS_INFO,
  implants: IMPLANTS_INFO,
  barrier_methods: BARRIER_METHODS_INFO,
  permanent_methods: PERMANENT_METHODS_INFO,
};
