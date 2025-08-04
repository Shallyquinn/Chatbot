// fmpResponses.ts - Fixed version with key mapping

// Mapping functions to normalize keys between UI and responses object
const normalizeMethodKey = (method: string): string => {
  const methodMap: Record<string, string> = {
    // Handle plural/singular differences
    "Implants": "Implant",
    "Daily Pills": "Daily Pill",
    // Handle format differences
    "Injections /Depo-provera / Sayana Press": "Injection / Depo-provera",
    "Injections / Depo-provera": "Injection / Depo-provera",
    // Handle any other variations that might exist
    "Emergency pills": "Emergency contraceptive",
    "Condoms": "Condom",
  };
  
  return methodMap[method] || method;
};

const normalizeConcernKey = (concern: string): string => {
  const concernMap: Record<string, string> = {
    // Handle plural/singular differences
    "Effects on general health": "Effect on general health",
    // Handle preposition differences  
    "Effect in fertility": "Effect on fertility",
    // Handle typos
    "Concvenience": "Convenience",
  };
  
  return concernMap[concern] || concern;
};

export const responses: Record<string, Record<string, string>> = {
    IUD: {
        Effectiveness:
          "IUDs are very effective in preventing pregnancy (>99%).\n\nIf you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "The IUD does not have any negative effects on your health.\n\nIf you're still worried about the IUD and its effects on your health, it's important to talk to a healthcare provider.\n\nThey can provide personalized advice and address any concerns you may have.",
        Convenience:
          "The IUD is very convenient to use.\n\nIf you are experiencing any form of discomfort, kindly call 7790 for free to speak to a nurse.",
        Price:
          "We understand some methods could get too costly.\n\nPlease call 7790 and a medical professional will help you to find a more affordable solution.",
        "Side effects":
          "Complications are rare but may occur and they include:\n1. Expulsion of IUD, which may lead to pregnancy.\n2. Uterine perforation.\n\nThey might cause some side effects such as:\na. Irregular and heavy period or bleeding.\nb. Menstrual cramps.\nc. Abnormal vaginal discharge.\n\nNormally, they wear out after a few weeks. If your symptoms are not mentioned above or you are still worried, please visit your family planning provider.",
        "Effect on sex life":
          "Complications like that are rare, but possible.\n\nPlease call 7790 so medical professional will help to find a better solution.",
        "Effect on fertility":
          "The IUD method is safe and you can have more children when you stop using it. Once you stop using the IUD you can get pregnant almost immediately.",
        "Privacy in contraception":
          "There is nothing to be ashamed when doing family planning. Moreover, with the IUD, no one will know you are using it.",
        "I want no clinic visits":
          "If you're seeking a contraceptive method that doesn't require clinic involvement, there are a few to consider: Injection, Pill, and Condoms.",
    },
    Implant: {
        Effectiveness:
          "Implants are very effective in preventing pregnancy. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "People with some health conditions are advised against the use of the Implants. Please seek counsel from your health provider before use.",
        Convenience:
          "The Implant is very convenient to use.\n\nIf you are experiencing any form of discomfort, kindly call 7790 for free to speak to a medical professional.",
        Price:
          "We understand some methods could get too costly.\n\nPlease call 7790 and a medical professional will help you to find a more affordable solution.",
        "Side effects":
          "Complications are rare but may occur and they include:\n1. Headache.\n2. Nausea or vomiting.\n3. Dizziness.\n4. Breast tenderness.\n5. Weight gain.\n6. Menstrual changes.\n7. Spotting and irregular vaginal bleeding.\n\nNormally, they wear out after a few weeks. If your symptoms are not mentioned above or you are still worried, please visit your family planning provider.",
        "Effect on sex life":
          "The Implant is not affecting your sexual life except for dryness. We recommend using a water-based lubricant.",
        "Effect on fertility":
          "The Implant method is safe and you can have more children when you stop using it.\nOnce you stop using the Implant you can get pregnant almost immediately.",
        "Privacy in contraception":
          "The Implant is very discreet and private. Once inserted, no one will know you are using it.",
        "I want no clinic visits":
          "The Implant requires initial clinic insertion and removal, but once inserted, it works for several years without clinic visits.",
    },
    "Injection / Depo-provera": {
        Effectiveness:
          "Injections are very effective in preventing pregnancy when used correctly. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Injections are generally safe for most women, but some health conditions may affect suitability. Please consult your healthcare provider.",
        Convenience:
          "Injections are convenient as they only require visits every 3 months.\n\nIf you are experiencing any form of discomfort, kindly call 7790 for free to speak to a medical professional.",
        Price:
          "We understand some methods could get too costly.\n\nPlease call 7790 and a medical professional will help you to find a more affordable solution.",
        "Side effects":
          "Common side effects may include:\n1. Irregular bleeding or spotting.\n2. Weight gain.\n3. Headaches.\n4. Mood changes.\n5. Decreased bone density with long-term use.\n\nMost side effects improve over time. If you're concerned, please visit your family planning provider.",
        "Effect on sex life":
          "Injections generally don't affect your sex life negatively. Some women may experience decreased libido, but this varies.",
        "Effect on fertility":
          "It may take 6-12 months or longer for fertility to return after stopping injections. This is normal and varies by individual.",
        "Privacy in contraception":
          "Injections are very private - once administered, no one will know you're using contraception.",
        "I want no clinic visits":
          "Injections require clinic visits every 3 months, so they may not be suitable if you want to avoid clinic visits entirely.",
    },
    "Sayana Press": {
        Effectiveness:
          "Sayana Press is very effective in preventing pregnancy when used correctly. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Sayana Press is generally safe for most women, but some health conditions may affect suitability. Please consult your healthcare provider.",
        Convenience:
          "Sayana Press is very convenient as it can be self-administered every 3 months after proper training.",
        Price:
          "We understand some methods could get too costly.\n\nPlease call 7790 and a medical professional will help you to find a more affordable solution.",
        "Side effects":
          "Common side effects may include:\n1. Irregular bleeding or spotting.\n2. Weight gain.\n3. Headaches.\n4. Mood changes.\n5. Decreased bone density with long-term use.\n\nMost side effects improve over time. If you're concerned, please visit your family planning provider.",
        "Effect on sex life":
          "Sayana Press generally doesn't affect your sex life negatively. Some women may experience decreased libido, but this varies.",
        "Effect on fertility":
          "It may take 6-12 months or longer for fertility to return after stopping Sayana Press. This is normal and varies by individual.",
        "Privacy in contraception":
          "Sayana Press is very private - once you learn to self-inject, no one will know you're using contraception.",
        "I want no clinic visits":
          "Sayana Press can be self-administered at home after initial training, reducing the need for frequent clinic visits.",
    },
    "Daily Pill": {
        Effectiveness:
          "Daily pills are very effective in preventing pregnancy when taken correctly every day. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Daily pills are generally safe for most women, but some health conditions may affect suitability. Please consult your healthcare provider.",
        Convenience:
          "Daily pills are convenient but require remembering to take them at the same time every day.",
        Price:
          "We understand some methods could get too costly.\n\nPlease call 7790 and a medical professional will help you to find a more affordable solution.",
        "Side effects":
          "Common side effects may include:\n1. Nausea.\n2. Breast tenderness.\n3. Headaches.\n4. Mood changes.\n5. Breakthrough bleeding.\n6. Weight changes.\n\nMost side effects improve after the first few months. If you're concerned, please visit your family planning provider.",
        "Effect on sex life":
          "Daily pills generally don't negatively affect your sex life. Some women may experience changes in libido, but this varies.",
        "Effect on fertility":
          "Fertility typically returns quickly after stopping daily pills, usually within 1-3 months.",
        "Privacy in contraception":
          "Daily pills are private - no one will know you're using them unless you tell them.",
        "I want no clinic visits":
          "After the initial consultation and prescription, daily pills require minimal clinic visits, usually just for refills and check-ups.",
    },
    Condom: {
        Effectiveness:
          "Condoms are effective in preventing pregnancy when used correctly every time. They also protect against STIs. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Condoms have no negative effects on your health and actually provide protection against sexually transmitted infections.",
        Convenience:
          "Condoms are convenient and available without prescription, but must be used correctly every time you have sex.",
        Price:
          "Condoms are generally affordable and widely available. If cost is a concern, please call 7790 for information about free or low-cost options.",
        "Side effects":
          "Condoms rarely cause side effects. Some people may experience latex allergies, but non-latex options are available.",
        "Effect on sex life":
          "Some people may feel condoms reduce sensation, but many couples find no significant impact on their sex life.",
        "Effect on fertility":
          "Condoms don't affect your fertility at all. You can get pregnant immediately after stopping their use.",
        "Privacy in contraception":
          "Condoms are private and can be purchased without anyone knowing your personal information.",
        "I want no clinic visits":
          "Condoms require no clinic visits and can be purchased at pharmacies, stores, or online.",
    },
    "Emergency contraceptive": {
        Effectiveness:
          "Emergency contraceptive pills are effective when taken within 72-120 hours after unprotected sex, depending on the type. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Emergency contraceptive pills are safe for most women but shouldn't be used as regular contraception.",
        Convenience:
          "Emergency contraceptive pills are convenient for emergency situations but are not suitable for regular use.",
        Price:
          "We understand some methods could get too costly.\n\nPlease call 7790 and a medical professional will help you to find a more affordable solution.",
        "Side effects":
          "Common side effects may include:\n1. Nausea.\n2. Vomiting.\n3. Fatigue.\n4. Headache.\n5. Dizziness.\n6. Breast tenderness.\n7. Changes in menstrual cycle.\n\nThese effects are usually temporary. If you're concerned, please visit your healthcare provider.",
        "Effect on sex life":
          "Emergency contraceptive pills don't have long-term effects on your sex life.",
        "Effect on fertility":
          "Emergency contraceptive pills don't affect your long-term fertility. Your normal fertility returns with your next cycle.",
        "Privacy in contraception":
          "Emergency contraceptive pills can be purchased privately at pharmacies without prescription in many places.",
        "I want no clinic visits":
          "Emergency contraceptive pills are available at pharmacies without clinic visits, but regular contraception might be better for ongoing needs.",
    },
    "Female sterilisation": {
        Effectiveness:
          "Female sterilisation is extremely effective (>99%) and considered permanent. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Female sterilisation is generally safe, but like any surgery, it carries some risks. Please consult your healthcare provider.",
        Convenience:
          "Female sterilisation is very convenient once completed - no ongoing contraceptive maintenance required.",
        Price:
          "We understand this procedure can be costly.\n\nPlease call 7790 and a medical professional will help you understand your options and costs.",
        "Side effects":
          "As with any surgical procedure, there are potential risks including:\n1. Bleeding.\n2. Infection.\n3. Reaction to anesthesia.\n4. Rare complications.\n\nDiscuss all risks with your healthcare provider.",
        "Effect on sex life":
          "Female sterilisation should not negatively affect your sex life. Many women report improved satisfaction due to elimination of pregnancy concerns.",
        "Effect on fertility":
          "Female sterilisation is intended to be permanent. While reversal is possible, it's complex and doesn't guarantee restored fertility.",
        "Privacy in contraception":
          "Female sterilisation is completely private - no one will know unless you tell them.",
        "I want no clinic visits":
          "After the initial procedure and recovery, female sterilisation requires no ongoing clinic visits.",
    },
    "Male sterilisation": {
        Effectiveness:
          "Male sterilisation (vasectomy) is extremely effective (>99%) and considered permanent. If you would like to discuss it in more details with a medical professional, please call 7790.",
        "Effect on general health":
          "Male sterilisation is generally safe with minimal risks. Please consult your healthcare provider for details.",
        Convenience:
          "Male sterilisation is very convenient once completed - no ongoing contraceptive maintenance required.",
        Price:
          "We understand this procedure can be costly.\n\nPlease call 7790 and a medical professional will help you understand your options and costs.",
        "Side effects":
          "Potential side effects include:\n1. Temporary swelling or bruising.\n2. Minor bleeding.\n3. Infection (rare).\n4. Chronic pain (very rare).\n\nIf you're concerned, please visit your healthcare provider.",
        "Effect on sex life":
          "Male sterilisation should not affect your sex life negatively. Many couples report improved satisfaction due to elimination of pregnancy concerns.",
        "Effect on fertility":
          "Male sterilisation is intended to be permanent. While reversal is possible, it's not guaranteed to restore fertility.",
        "Privacy in contraception":
          "Male sterilisation is completely private - no one will know unless you tell them.",
        "I want no clinic visits":
          "After the initial procedure and recovery, male sterilisation requires no ongoing clinic visits.",
    },
};

export function getSpecificConcernResponse(
  method: string,
  concernType: string
): string {
    // Normalize the keys to handle mismatches
    const normalizedMethod = normalizeMethodKey(method);
    const normalizedConcern = normalizeConcernKey(concernType);
    
    console.log('getSpecificConcernResponse called with:', { 
        originalMethod: method, 
        normalizedMethod, 
        originalConcern: concernType, 
        normalizedConcern 
    }); // Enhanced debug log
    
    const foundResponse = responses[normalizedMethod]?.[normalizedConcern];
    console.log('Found response:', foundResponse ? 'Yes' : 'No', { 
        normalizedMethod, 
        normalizedConcern,
        availableMethods: Object.keys(responses),
        availableConcerns: normalizedMethod ? Object.keys(responses[normalizedMethod] || {}) : []
    }); // Enhanced debug log
    
    return (
        foundResponse ||
        `Okay, I understand your concern about ${concernType.toLowerCase()} and I am sorry you are experiencing issues with ${method ? `${method}` : 'this method'}. For direct and detailed counselling on better options for you, I recommend speaking with a healthcare provider who can address your specific situation. Please call 7790 for personalized assistance.`
    );
}