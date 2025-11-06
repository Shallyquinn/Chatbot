// src/chatbot/sections/preventPregnancy/productData.ts
// Complete product information extracted from WhatsApp script

export interface ProductInfo {
  name: string;
  description: string;
  howItWorks?: string;
  usage?: string;
  audioPrompt: string;
  advantages: string[];
  disadvantages: string[];
  whoCanUse?: string[];
  whoCannotUse?: string[];
  videos?: string[];
  additionalInfo?: string;
  purchaseInfo?: string;
}

export const PRODUCT_DATA: Record<string, ProductInfo> = {
  "Daily pills": {
    name: "Daily pills",
    description:
      "Daily pills are combined oral contraceptive pills for pregnancy prevention, dermatological and gynecological conditions, and management of menstrual irregularities (heavy bleeding, painful menstruation, premenstrual syndrome).",
    howItWorks: "They work by making the sperm difficult to enter the womb.",
    usage:
      "Daily pills are either a 21-day pack (Dianofem and Desofem) or a 28-day pack (Levofem).\nOne pill is taken each day at about the same time for 21 days. Depending on your pack, you will either have a 7-day break (as in the 21-day pack) or you will take the pill that contains Iron for 7 days (the 28-day pack).",
    audioPrompt:
      "Click to listen to a short introduction of daily pills in Pidgin, if you want to.",
    advantages: [
      "They are very effective if used correctly.",
      "Very safe for the majority of women.",
      "Return to fertility is very fast.",
      "They regularize the menstrual cycle, reduce heavy menstrual flow, and reduce menstrual and ovulation pain.",
      "They are simple and easy to use.",
    ],
    disadvantages: [
      "They must be taken daily which might be difficult to comply with.",
      "They might cause mild and temporary side effects which usually goes away after some weeks such as:\n\na. Mild headache.\nb. Nausea or vomiting.\nc. Dizziness.\nd. Breast tenderness.\ne. Slight weight gain.\nf. Mood changes.",
    ],
    whoCanUse: [
      "Women of reproductive age who want to prevent pregnancy",
      "Women who can remember to take a pill daily",
      "Women who prefer a method they can control themselves",
    ],
    whoCannotUse: [
      "Women who are breastfeeding (within first 6 months after delivery)",
      "Women who smoke and are over 35 years old",
      "Women with certain medical conditions (high blood pressure, history of blood clots, certain cancers)",
      "Women who cannot remember to take pills daily",
    ],
  },

  Diaphragm: {
    name: "Diaphragm",
    description:
      "A diaphragm or cap is a barrier contraceptive device inserted into the vagina before sex to cover the cervix so that sperm can't get into the womb (uterus). You need to use spermicide with it (spermicides kill sperm).",
    howItWorks:
      "The diaphragm must be left in place for at least 6 hours after sex. The diaphragm is a vaginal barrier contraceptive that is woman-controlled, nonhormonal, and appropriate for women who cannot or do not want to use hormonal contraceptive methods, intrauterine devices, or condoms.",
    audioPrompt:
      "Click to listen to a short introduction of diaphragm in Pidgin, if you want.",
    advantages: [
      "Diaphragms do not have hormones, so no side effects.",
      "Good option for women who prefer non-hormonal contraceptive methods.",
      "They may be fitted at any time (post-partum mothers must wait for 6 weeks after delivery or mid-trimester abortion)",
      "They can be inserted up to 6 hours before sex to avoid interruption.",
      "Only used when needed and gives the woman absolute control.",
      "One size fits most women.",
      "Portable and convenient - it comes with a specially designed case that is discreet and fits in a bag.",
      "Easy to use - insertion and removal gets better with practice.",
      "Can be used for up to 2 years with proper care.",
    ],
    disadvantages: [
      "They are not readily available in Nigeria.",
      "They may be expensive to some users.",
      "The user must remember to insert the diaphragm before intercourse and keep it in place for at least 6 hours after sex (but not more than 24 hours)",
      "They require special care and storage.",
      "They can cause urinary tract infections.",
      "A different size of diaphragm may be required after childbirth or if a woman gains weight.",
      "They can be damaged by excessive use or poor storage",
    ],
    additionalInfo:
      "Ok, let me show you what a diaphragm looks like and how to use it.",
    videos: [
      "https://www.youtube.com/watch?v=zw76siSZ2E4&list=PL0mGkrTWmp4sWe4izabrqUhEVSuQAb-Hd&index=5&pp=iAQB",
      "https://www.youtube.com/watch?v=ettTJHL209w&list=PL0mGkrTWmp4sWe4izabrqUhEVSuQAb-Hd&index=4&pp=iAQB",
      "https://www.youtube.com/watch?v=6VV1Wi67o4Y&list=PL0mGkrTWmp4sWe4izabrqUhEVSuQAb-Hd&index=1&pp=iAQB",
    ],
    purchaseInfo:
      "You can visit your nearest pharmacy or health shop to purchase",
  },

  "Female condom": {
    name: "Female condom",
    description:
      "The female condom is a barrier contraceptive device that is woman-controlled. It is a soft, loose-fitting polyurethane pouch with two flexible rings. One ring at the closed end is used for insertion and helps keep the condom in place. The other ring at the open end stays outside the vagina.",
    howItWorks:
      "It works by creating a barrier that prevents sperm from entering the uterus. It also provides protection against sexually transmitted infections (STIs).",
    usage:
      "The female condom can be inserted up to 8 hours before intercourse. It should be used only once and then discarded.",
    audioPrompt:
      "Click to listen to a short introduction of female condom in Pidgin, if you want to.",
    advantages: [
      "Controlled by the woman",
      "Can be inserted ahead of time",
      "Provides STI protection",
      "No hormones",
      "Can be used during menstruation",
      "No prescription needed",
    ],
    disadvantages: [
      "May be difficult to insert at first",
      "More expensive than male condoms",
      "May slip or make noise during intercourse",
      "Not as readily available as male condoms",
    ],
    purchaseInfo: "Available at pharmacies and health stores",
  },

  "Male condom": {
    name: "Male Condom",
    description:
      "Male condoms are thin sheaths made of latex, polyurethane, or polyisoprene that are worn on the penis during sexual intercourse.",
    howItWorks:
      "They work by preventing sperm from entering the vagina and provide protection against sexually transmitted infections (STIs).",
    usage:
      "Put on the condom before any sexual contact. Use a new condom for each act of intercourse. Remove carefully after ejaculation while the penis is still erect.",
    audioPrompt:
      "Click to listen to a short introduction of male condom in Pidgin, if you want to.",
    advantages: [
      "Widely available and affordable",
      "Provides STI protection including HIV",
      "No hormones or medical side effects",
      "Can be used with other contraceptive methods",
      "No prescription needed",
      "Male involvement in family planning",
    ],
    disadvantages: [
      "May break or slip off if not used correctly",
      "Can interrupt sexual activity",
      "Some people are allergic to latex",
      "Reduces sensitivity for some users",
      "Must be used correctly every time",
    ],
    purchaseInfo: "Available at pharmacies, supermarkets, and health centers",
  },

  Injectables: {
    name: "Injectables",
    description:
      "Injectable contraceptives are hormonal contraceptives administered through an injection. The most common type lasts for 3 months (Depo-Provera).",
    howItWorks:
      "The injection releases hormones that prevent ovulation, thicken cervical mucus to prevent sperm from reaching the egg, and thin the uterine lining.",
    usage:
      "One injection is given every 3 months by a healthcare provider. The first injection can be given within the first 5 days of your menstrual cycle or any time if you're sure you're not pregnant.",
    audioPrompt:
      "Click to listen to a short introduction of injectables in Pidgin, if you want to.",
    advantages: [
      "Very effective (over 99% when used correctly)",
      "Long-lasting (3 months)",
      "Private - no one can tell you're using contraception",
      "Can reduce heavy or painful periods",
      "Can be used while breastfeeding",
      "Does not interrupt sex",
      "May reduce the risk of some cancers",
    ],
    disadvantages: [
      "Periods may become irregular or stop completely",
      "Possible weight gain",
      "Requires regular clinic visits every 3 months",
      "Fertility may take several months to return after stopping",
      "Cannot be removed once injected",
      "May cause headaches, mood changes, or decreased libido",
      "Does not protect against STIs",
    ],
    whoCanUse: [
      "Women who want long-term contraception",
      "Women who cannot remember to take daily pills",
      "Breastfeeding women (after 6 weeks postpartum)",
    ],
    whoCannotUse: [
      "Women with unexplained vaginal bleeding",
      "Women with breast cancer",
      "Women with severe liver disease",
      "Women planning to get pregnant soon",
    ],
    purchaseInfo:
      "Available at hospitals, health centers, and family planning clinics. Requires a healthcare provider to administer.",
  },

  Implants: {
    name: "Implants",
    description:
      "Contraceptive implants are small flexible rods (about the size of a matchstick) that are inserted under the skin of the upper arm. The most common types are Jadelle (2 rods, lasts 5 years) and Implanon/Nexplanon (1 rod, lasts 3 years).",
    howItWorks:
      "The implant releases hormones that prevent ovulation, thicken cervical mucus, and thin the uterine lining to prevent pregnancy.",
    usage:
      "A healthcare provider inserts the implant under the skin of your upper arm using local anesthesia. The procedure takes just a few minutes. The implant can be removed at any time by a healthcare provider.",
    audioPrompt:
      "Click to listen to a short introduction of implants in Pidgin, if you want to.",
    advantages: [
      "Highly effective (over 99%)",
      "Long-lasting (3-5 years depending on type)",
      "Reversible - can be removed at any time",
      "Does not interrupt sex",
      "Can be used while breastfeeding",
      "May reduce menstrual cramps and period flow",
      "No need to remember daily pills or monthly injections",
    ],
    disadvantages: [
      "Irregular bleeding, especially in the first 6-12 months",
      "Some women may experience headaches, mood changes, or weight gain",
      "Requires a trained healthcare provider for insertion and removal",
      "You may feel the implant under your skin",
      "Small risk of infection at insertion site",
      "Does not protect against STIs",
    ],
    whoCanUse: [
      "Women who want long-term, reversible contraception",
      "Women who cannot use estrogen-containing contraceptives",
      "Breastfeeding women",
    ],
    whoCannotUse: [
      "Women with unexplained vaginal bleeding",
      "Women with breast cancer",
      "Women with severe liver disease",
      "Women allergic to the implant materials",
    ],
    purchaseInfo:
      "Available at hospitals and family planning clinics. Requires insertion by a trained healthcare provider.",
  },

  IUD: {
    name: "IUD (Intrauterine Device)",
    description:
      "An IUD is a small T-shaped device that is inserted into the uterus. The copper IUD (also called Copper T) works without hormones and can last up to 10 years.",
    howItWorks:
      "The copper IUD releases copper ions that are toxic to sperm, preventing fertilization. It also prevents implantation of a fertilized egg.",
    usage:
      "A healthcare provider inserts the IUD through the cervix into the uterus. This takes about 5-10 minutes. The IUD has strings that hang down into the vagina so you can check it's in place.",
    audioPrompt:
      "Click to listen to a short introduction of IUD in Pidgin, if you want to.",
    advantages: [
      "Highly effective (over 99%)",
      "Long-lasting (up to 10 years)",
      "Reversible - fertility returns quickly after removal",
      "No hormones - good for women who cannot or prefer not to use hormonal methods",
      "Can be used while breastfeeding",
      "Can be used as emergency contraception if inserted within 5 days of unprotected sex",
      "Cost-effective over time",
    ],
    disadvantages: [
      "Periods may become heavier and more painful",
      "Cramping and spotting for the first few months",
      "Small risk of expulsion (IUD falls out)",
      "Small risk of uterine perforation during insertion",
      "Does not protect against STIs",
      "Requires a healthcare provider for insertion and removal",
    ],
    whoCanUse: [
      "Women who want long-term, reversible contraception",
      "Women who prefer non-hormonal methods",
      "Women of any age, including teenagers and women who haven't had children",
    ],
    whoCannotUse: [
      "Women with pelvic infection",
      "Women with unexplained vaginal bleeding",
      "Women with uterine abnormalities",
      "Women with copper allergy (for copper IUD)",
    ],
    purchaseInfo:
      "Available at hospitals and family planning clinics. Requires insertion by a trained healthcare provider.",
  },

  IUS: {
    name: "IUS (Intrauterine System)",
    description:
      "An IUS is a small T-shaped device that is inserted into the uterus and releases hormones. Common brands include Mirena (lasts 5 years) and Kyleena (lasts 5 years).",
    howItWorks:
      "The IUS releases a small amount of progestin hormone that thickens cervical mucus, thins the uterine lining, and may prevent ovulation.",
    usage:
      "A healthcare provider inserts the IUS through the cervix into the uterus. The procedure takes about 5-10 minutes and may cause some cramping.",
    audioPrompt:
      "Click to listen to a short introduction of IUS in Pidgin, if you want to.",
    advantages: [
      "Highly effective (over 99%)",
      "Long-lasting (5 years)",
      "Reversible - fertility returns quickly after removal",
      "Often leads to lighter or no periods",
      "Reduces menstrual pain and cramps",
      "Can be used while breastfeeding",
      "Lower hormone dose than pills or injections",
    ],
    disadvantages: [
      "Irregular bleeding or spotting for the first 3-6 months",
      "Some women may experience hormonal side effects like acne, headaches, or mood changes",
      "Small risk of expulsion",
      "Small risk of uterine perforation during insertion",
      "Does not protect against STIs",
      "Requires a healthcare provider for insertion and removal",
    ],
    whoCanUse: [
      "Women who want long-term, reversible contraception",
      "Women with heavy or painful periods",
      "Women who cannot use estrogen-containing contraceptives",
    ],
    whoCannotUse: [
      "Women with pelvic infection",
      "Women with unexplained vaginal bleeding",
      "Women with breast cancer",
      "Women with severe liver disease",
    ],
    purchaseInfo:
      "Available at hospitals and family planning clinics. Requires insertion by a trained healthcare provider.",
  },

  Postpill: {
    name: "Postpill",
    description:
      "Postpill is a one-dose emergency contraceptive pill by DKT. It contains 1.5 mg Levongestrel. It should be taken orally as soon as possible but can still be taken within 5 days (120 hours) of unprotected sex.",
    howItWorks:
      "It doesn't work if you are already pregnant and will not harm an already established pregnancy.",
    audioPrompt:
      "Click to listen to a short introduction of Postpill in Pidgin, if you want to.",
    usage:
      "Take one pill as soon as possible after unprotected sex. The sooner you take it, the more effective it is.",
    additionalInfo:
      "If more than 120 hours (5 days) have passed since unprotected sex, it won't be effective. In such a situation, kindly call 7790 and ask to speak to a nurse counsellor for further guidance.",
    purchaseInfo:
      "You can buy Postpill at any pharmacy or health store around you.",
    advantages: [
      "Can be taken up to 5 days after unprotected sex",
      "One-dose convenience",
      "Available without prescription",
      "Does not affect future fertility",
    ],
    disadvantages: [
      "Not as effective as regular contraception",
      "May cause nausea, vomiting, or irregular bleeding",
      "Should not be used as regular contraception",
      "Does not protect against STIs",
    ],
  },

  "Postinor-2": {
    name: "Postinor-2",
    description:
      "Postinor-2 is an Emergency Contraceptive Pill that safely prevents unwanted pregnancy within 72 hours after unprotected sexual intercourse.",
    howItWorks:
      "It doesn't work if you are already pregnant and will not harm an already established pregnancy. The sooner you take Postinor, the more effective it is.",
    usage:
      "Take as soon as possible after unprotected sex, preferably within 24 hours, but can be taken up to 72 hours (3 days) after.",
    additionalInfo:
      "If more than 72 hours (3 days) have passed since unprotected sex, it won't be effective. In such a situation, kindly consult a healthcare provider as soon as possible to explore other options. It's essential not to delay seeking medical advice in such cases to address any potential risks.",
    purchaseInfo:
      "You can buy Postinor at any pharmacy or health store around you.",
    audioPrompt:
      "Click to listen to a short introduction of Postinor-2 in Pidgin, if you want to.",
    advantages: [
      "Effective within 72 hours",
      "Available without prescription",
      "Does not affect future fertility",
      "Easy to use",
    ],
    disadvantages: [
      "Less effective than Postpill (only 72 hours vs 120 hours)",
      "May cause nausea or irregular bleeding",
      "Should not be used as regular contraception",
      "Effectiveness decreases with time",
    ],
  },

  "Tubal ligation": {
    name: "Tubal ligation",
    description:
      "Tubal ligation, also known as 'getting your tubes tied,' is a permanent form of contraception for women. It involves surgically blocking, sealing, or cutting the fallopian tubes to prevent eggs from reaching the uterus for fertilization.",
    howItWorks:
      "The procedure prevents the egg from traveling from the ovary to the uterus and also blocks sperm from reaching the egg.",
    usage:
      "This is a surgical procedure that requires anesthesia and is usually performed in a hospital or clinic. It can be done through laparoscopy (small incisions) or mini-laparotomy.",
    audioPrompt:
      "Click to learn more about tubal ligation in Pidgin, if you want to.",
    advantages: [
      "Permanent contraception",
      "Over 99% effective",
      "Does not affect hormone levels",
      "Does not interfere with sex",
      "No need for ongoing contraception",
      "May reduce risk of ovarian cancer",
    ],
    disadvantages: [
      "Permanent and difficult to reverse",
      "Requires surgery and anesthesia",
      "Risk of surgical complications (infection, bleeding)",
      "Regret is common, especially if done at a young age",
      "Does not protect against STIs",
      "Expensive upfront cost",
      "Small risk of ectopic pregnancy if it fails",
    ],
    whoCanUse: [
      "Women who are absolutely certain they do not want any (more) children",
      "Women who cannot use other contraceptive methods",
      "Women over 30 who have completed their families",
    ],
    whoCannotUse: [
      "Women who are uncertain about their decision",
      "Women under pressure from partners or others",
      "Young women who may change their mind later",
    ],
    additionalInfo:
      "⚠️ Important: This procedure is permanent and irreversible. Please speak with a healthcare provider and consider all options before making this decision.",
    purchaseInfo:
      "Available at hospitals and specialized clinics. Requires consultation with a healthcare provider and informed consent.",
  },

  Vasectomy: {
    name: "Vasectomy",
    description:
      "Vasectomy is a permanent form of contraception for men. It involves surgically cutting or blocking the vas deferens (the tubes that carry sperm from the testicles).",
    howItWorks:
      "After a vasectomy, semen no longer contains sperm, so pregnancy cannot occur. The procedure does not affect sexual function, hormone production, or ejaculation.",
    usage:
      "This is a surgical procedure performed under local anesthesia, usually in a clinic. It takes about 15-30 minutes. Men can usually return to work within a few days.",
    audioPrompt:
      "Click to learn more about vasectomy in Pidgin, if you want to.",
    advantages: [
      "Permanent contraception",
      "Over 99% effective (after sperm count reaches zero)",
      "Simpler and safer than tubal ligation",
      "One-time procedure",
      "Does not affect sexual function or hormone levels",
      "Cost-effective over time",
      "Male involvement in family planning",
    ],
    disadvantages: [
      "Permanent and difficult to reverse",
      "Requires surgery",
      "Not immediately effective (takes 2-3 months for sperm count to reach zero)",
      "Risk of surgical complications (infection, bleeding, pain)",
      "Regret is possible",
      "Does not protect against STIs",
    ],
    whoCanUse: [
      "Men who are absolutely certain they do not want any (more) children",
      "Men whose partners cannot use other contraceptive methods",
      "Men who want to take responsibility for family planning",
    ],
    whoCannotUse: [
      "Men who are uncertain about their decision",
      "Men under pressure from partners or others",
      "Young men who may change their mind later",
    ],
    additionalInfo:
      "⚠️ Important: This procedure is permanent and difficult to reverse. Please speak with a healthcare provider and consider all options before making this decision. You will need to use another contraceptive method for 2-3 months after the procedure until your sperm count reaches zero.",
    purchaseInfo:
      "Available at hospitals and specialized clinics. Requires consultation with a healthcare provider and informed consent.",
  },
};

// Helper function to get product info
export function getProductInfo(productName: string): ProductInfo | null {
  return PRODUCT_DATA[productName] || null;
}

// Helper to get all product names
export function getAllProductNames(): string[] {
  return Object.keys(PRODUCT_DATA);
}
