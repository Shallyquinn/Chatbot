// fmpResponses.ts - Fixed version with key mapping

// Mapping functions to normalize keys between UI and responses object
const normalizeMethodKey = (method: string): string => {
  console.log('normalizeMethodKey called with:', method); // Debug log for method normalization

  const methodMap: Record<string, string> = {
    // Handle plural/singular differences
    "Implants": "Implant",
    "Daily Pills": "Daily Pill",
    "Pills": "Daily Pill",
    // Handle format differences
    "Injections /Depo-provera / Sayana Press": "Injection / Depo-provera",
    "Injections / Depo-provera": "Injection / Depo-provera",
    "Injection": "Injection / Depo-provera",
    "Depo-provera": "Injection / Depo-provera",
    // Handle any other variations that might exist
    "Emergency pills": "Emergency contraceptive",
    "Emergency contraception": "Emergency contraceptive",

    // Handle condom variations
    "Condoms": "Condom",
    "Male condom": "Condom",
    "Female condom": "Condom",
    
    // Handle sterilization variations
    "Female sterilisation": "Female sterilisation", // Keep as is
    "Male sterilisation": "Male sterilisation", // Keep as is
    "Sterilization": "Female sterilisation", // Default mapping
    
    // Handle any other common variations
    "IUD": "IUD", // Keep as is
    "Implant": "Implant", // Keep as is
    "Sayana Press": "Sayana Press", // Keep as is
  };
  
  const normalized = methodMap[method] || method;
  console.log("🔧 Method key normalized from", method, "to", normalized);
  return normalized;
};

const normalizeConcernKey = (concern: string): string => {
  console.log('normalizing concern key:', concern); // Debug log for concern normalization
  const concernMap: Record<string, string> = {
     // Handle plural/singular differences
    "Effects on general health": "Effect on general health",
    "Side effect": "Side effects",
    "Effect on fertility": "Effect on fertility",
    
    // Handle preposition differences  
    "Effect in fertility": "Effect on fertility",
    "Effects on fertility": "Effect on fertility",
    "Effect in sex life": "Effect on sex life",
    "Effects on sex life": "Effect on sex life",
    
    // Handle typos and variations
    "Concvenience": "Convenience",
    "Effectivness": "Effectiveness",
    "Privacy": "Privacy in contraception",
    "Clinic visits": "I want no clinic visits",
    "No clinic visits": "I want no clinic visits",
    
    // Handle exact matches (keep as is)
    "Effectiveness": "Effectiveness",
    "Effect on general health": "Effect on general health",
    "Convenience": "Convenience",
    "Price": "Price",
    "Side effects": "Side effects",
    "Effect on sex life": "Effect on sex life",
    "Privacy in contraception": "Privacy in contraception",
    "I want no clinic visits": "I want no clinic visits",
  };
  
  const normalized = concernMap[concern] || concern;
  console.log("🔧 Concern key normalized from", concern, "to", normalized);
  return normalized;
};
// comprehensive response for all fpm methods and concerns
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

    "Female sterilisation": {
      Effectiveness:
        "Female sterilisation is one of the most effective methods (>99%).\n\nIt's considered permanent, so it's important to be certain about your decision.\n\nFor detailed counseling, please call 7790.",
      "Effect on general health":
        "Female sterilisation is generally safe, but like any surgery, it carries some risks.\n\nYour healthcare provider will discuss these risks with you.\n\nFor more information, please call 7790.",
      Convenience:
        "Female sterilisation is very convenient after the procedure - no ongoing maintenance required.\n\nHowever, it requires a surgical procedure initially.",
      Price:
        "The cost varies depending on the facility and method used.\n\nPlease call 7790 to discuss cost and available options in your area.",
      "Side effects":
        "As with any surgery, there are potential risks including:\na. Infection\nb. Bleeding\nc. Reaction to anesthesia\nd. Rare complications\n\nYour healthcare provider will discuss all risks with you.",
      "Effect on sex life":
        "Female sterilisation typically doesn't affect your sex life negatively.\n\nMany couples report improved satisfaction due to elimination of pregnancy concerns.",
      "Effect on fertility":
        "Female sterilisation is intended to be permanent. While reversal is possible, it's not guaranteed to restore fertility.\n\nConsider this decision carefully.",
      "Privacy in contraception":
        "Female sterilisation is completely private - no one will know unless you tell them.",
      "I want no clinic visits":
        "After the initial procedure and recovery, female sterilisation requires no ongoing clinic visits.\n\nOnly routine gynecological care is needed.",
    },

    "Male sterilisation": {
      Effectiveness:
        "Male sterilisation (vasectomy) is one of the most effective methods (>99%).\n\nIt's considered permanent, so it's important to be certain about your decision.\n\nFor detailed counseling, please call 7790.",
      "Effect on general health":
        "Male sterilisation is generally very safe with minimal risks.\n\nIt's a simpler procedure than female sterilisation.\n\nFor more information, please call 7790.",
      Convenience:
        "Male sterilisation is very convenient after the procedure - no ongoing maintenance required.\n\nThe procedure is quicker and simpler than female sterilisation.",
      Price:
        "The cost is generally lower than female sterilisation.\n\nPlease call 7790 to discuss cost and available options in your area.",
      "Side effects":
        "Side effects are generally minimal and may include:\na. Temporary swelling\nb. Mild pain\nc. Minor bleeding\nd. Very rare complications\n\nMost men recover quickly with minimal discomfort.",
      "Effect on sex life":
        "Male sterilisation doesn't affect hormone production or sexual function.\n\nMany couples report improved satisfaction due to elimination of pregnancy concerns.",
      "Effect on fertility":
        "Male sterilisation is intended to be permanent. While reversal is possible, it's not guaranteed to restore fertility.",
      "Privacy in contraception":
        "Male sterilisation is completely private - no one will know unless you tell them.",
      "I want no clinic visits":
        "After the initial procedure and recovery, male sterilisation requires no ongoing clinic visits.",
    },

    // Emergency contraceptive and other methods
    "Emergency contraceptive": {
      Effectiveness:
        "Emergency contraception is most effective when taken as soon as possible after unprotected sex.\n\nIt becomes less effective over time.\n\nFor more details, please call 7790.",
      "Effect on general health":
        "Emergency contraception is generally safe for occasional use.\n\nIt should not be used as a regular contraceptive method.\n\nConsult with a healthcare provider if you use it frequently.",
      Convenience:
        "Emergency contraception is convenient as it's available without prescription in many places.\n\nHowever, it's not suitable for regular use.",
      Price:
        "Emergency contraception costs vary.\n\nPlease call 7790 for information about affordable options in your area.",
      "Side effects":
        "Common side effects may include:\na. Nausea\nb. Vomiting\nc. Fatigue\nd. Headache\ne. Changes to your next period\n\nThese are usually mild and temporary.",
      "Effect on sex life":
        "Emergency contraception doesn't have lasting effects on your sex life.\n\nIt's only for emergency use, not regular contraception.",
      "Effect on fertility":
        "Emergency contraception doesn't affect your long-term fertility.\n\nYour normal fertility returns quickly.",
      "Privacy in contraception":
        "Emergency contraception is private - you can obtain and use it without anyone knowing.",
      "I want no clinic visits":
        "Emergency contraception is available without prescription in many places, so no clinic visit is required.\n\nHowever, consider discussing regular contraception with a healthcare provider.",
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
};

export function getSpecificConcernResponse(
  method: string,
  concernType: string
): string {
  console.log("🔧 getSpecificConcernResponse called with:", { 
    originalMethod: method, 
    originalConcern: concernType 
  });

  // FIXED: Handle empty or undefined method
  if (!method || method.trim() === "") {
    console.warn("⚠️ Empty method provided, using generic response");
    return `I understand your concern about ${concernType.toLowerCase()}. For direct and detailed counselling on better options for you, I recommend speaking with a healthcare provider who can address your specific situation. Please call 7790 for personalized assistance.`;
  }

  // Normalize the keys to handle mismatches
  const normalizedMethod = normalizeMethodKey(method.trim());
  const normalizedConcern = normalizeConcernKey(concernType.trim());

  console.log('After normalization', { 
      normalizedMethod, 
      normalizedConcern 
  }); // Enhanced debug log
    
  // Check if method exists in responses
  if (!responses[normalizedMethod]) {
    console.warn("⚠️ Method not found in responses:", normalizedMethod);
    console.log("Available methods:", Object.keys(responses));
    
    return `I understand your concern about ${concernType.toLowerCase()} with ${method}. For direct and detailed counselling on this specific method and concern, I recommend speaking with a healthcare provider who can address your situation. Please call 7790 for personalized assistance.`;
  }

  // Check if concern exists for this method
  const methodResponses = responses[normalizedMethod];
  if (!methodResponses[normalizedConcern]) {
    console.warn("⚠️ Concern not found for method:", { normalizedMethod, normalizedConcern });
    console.log("Available concerns for", normalizedMethod, ":", Object.keys(methodResponses));
    
    return `I understand your concern about ${concernType.toLowerCase()} with ${method}. For direct and detailed counselling on this specific concern, I recommend speaking with a healthcare provider who can address your situation. Please call 7790 for personalized assistance.`;
  }

  const foundResponse = methodResponses[normalizedConcern];
  console.log('✅ Found specific response for:', { normalizedMethod, normalizedConcern });
  
  return foundResponse;
}

// =====================================================================
// HELPER FUNCTIONS FOR DEBUGGING AND VALIDATION
// =====================================================================

// Function to check if a method exists in responses
export function hasMethodResponse(method: string): boolean {
  const normalizedMethod = normalizeMethodKey(method);
  return normalizedMethod in responses;
}

// Function to check if a concern exists for a method
export function hasConcernResponse(method: string, concern: string): boolean {
  const normalizedMethod = normalizeMethodKey(method);
  const normalizedConcern = normalizeConcernKey(concern);
  
  return normalizedMethod in responses && normalizedConcern in responses[normalizedMethod];
}

// Function to get all available methods
export function getAvailableMethods(): string[] {
  return Object.keys(responses);
}

// Function to get all available concerns for a method
export function getAvailableConcerns(method: string): string[] {
  const normalizedMethod = normalizeMethodKey(method);
  return responses[normalizedMethod] ? Object.keys(responses[normalizedMethod]) : [];
}

// Debug function to test the response system
export function debugResponseSystem(): void {
  console.log("🔍 Debug Response System:");
  console.log("Available methods:", getAvailableMethods());
  
  Object.keys(responses).forEach(method => {
    console.log(`Concerns for ${method}:`, getAvailableConcerns(method));
  });
}

export default getSpecificConcernResponse;