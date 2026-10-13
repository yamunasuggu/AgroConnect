import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

let aiInstance: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI();
  }
} catch (e) {
  console.warn('GoogleGenAI initialization warning:', e);
}

export interface AssistantChatRequest {
  message: string;
  farmerId?: string;
  contextCrop?: string;
  language?: string;
}

export interface AssistantChatResponse {
  answer: string;
  data_sources: {
    marketplace_used: boolean;
    approved_knowledge_used: boolean;
    gemini_enhanced: boolean;
  };
  crop_demand_data?: {
    crop_name: string;
    active_listings: number;
    available_quantity: number;
    recent_orders: number;
    requested_quantity: number;
    sold_quantity: number;
    average_price: number;
    demand_indicator: 'Low' | 'Moderate' | 'High';
    demand_ratio: number;
    reason: string;
    disclaimer: string;
  };
  farmer_summary_data?: any;
  approved_knowledge_data?: any;
}

export async function processAssistantMessage(
  req: AssistantChatRequest
): Promise<AssistantChatResponse> {
  const query = req.message.trim().toLowerCase();
  let cropDemandData: any = null;
  let farmerSummaryData: any = null;
  let approvedKnowledgeData: any = null;
  let marketplaceUsed = false;
  let approvedKnowledgeUsed = false;
  let geminiEnhanced = false;

  // Detect crops mentioned
  const cropNames = ['tomato', 'onion', 'wheat', 'apple', 'potato', 'chilli', 'rice', 'honey', 'ginger'];
  const matchedCrop = cropNames.find((c) => query.includes(c)) || req.contextCrop?.toLowerCase();

  // If question is about demand or price for a crop
  if (matchedCrop) {
    cropDemandData = db.calculateCropDemand(matchedCrop);
    marketplaceUsed = true;
    
    // Also look up approved agricultural knowledge
    const kb = db.getApprovedKnowledge(matchedCrop);
    if (kb && kb.length > 0) {
      approvedKnowledgeData = kb[0];
      approvedKnowledgeUsed = true;
    }
  }

  // If question is about farmer's own crops or sales
  if (
    query.includes('my crop') ||
    query.includes('i currently have') ||
    query.includes('have i sold') ||
    query.includes('my sold') ||
    query.includes('my orders') ||
    query.includes('my listings') ||
    query.includes('my location')
  ) {
    const fId = req.farmerId || 'farmer-1';
    farmerSummaryData = db.getFarmerSummary(fId);
    marketplaceUsed = true;
  }

  // If asking which crops are getting more orders or popular crops
  const popularCropsData = db.getCrops().map((c) => ({
    name: c.name,
    category: c.category,
    price: c.price_per_unit,
    rating: c.rating,
    available_kg: c.quantity,
  }));

  // Build the factual grounding context for Gemini
  const groundingContext = {
    currentTime: '2026-10-02',
    marketplaceStats: db.getMarketplaceStats(),
    cropDemand: cropDemandData,
    farmerSummary: farmerSummaryData,
    approvedKnowledge: approvedKnowledgeData,
    recentPrices: db.getMarketPrices().map((p) => ({
      crop: p.crop,
      avg_price: `₹${p.average_price}/${p.unit}`,
      change: `${p.price_change_percentage > 0 ? '+' : ''}${p.price_change_percentage}%`,
      demand: p.demand_level,
    })),
  };

  const systemPrompt = `You are the AI Farmer Assistant inside AgroConnect – Farm-to-Market Platform.
CRITICAL RULES:
1. Answer the farmer or buyer's agricultural or marketplace question accurately.
2. Ground all market statistics EXCLUSIVELY on the provided AgroConnect marketplace data. NEVER fabricate market prices, order quantities, or demand predictions.
3. If specific real-time external mandi data or unverified facts are requested that are NOT in the database or approved knowledge, state clearly: "I don't have verified current data for that information."
4. When discussing demand, explain the transparent formula: Demand Ratio = Recent Requested Quantity / Available Quantity. Always mention the caveat: "Marketplace-derived indicator based on active listings and orders on AgroConnect, not an official governmental market forecast."
5. For disease, pest, or post-harvest storage questions, prioritize the Approved Knowledge Base facts provided in context.
6. Keep explanations clear, actionable, empathetic, and respectful of farmer livelihoods. Use bullet points and clean structure.`;

  // Language normalization
  const rawLang = (req.language || 'English').trim();
  const LANG_RESOLVER: Record<string, string> = {
    hi: 'Hindi (हिन्दी)',
    te: 'Telugu (తెలుగు)',
    mr: 'Marathi (मराठी)',
    ta: 'Tamil (தமிழ்)',
    kn: 'Kannada (ಕನ್ನಡ)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    gu: 'Gujarati (ગુજરાતી)',
    bn: 'Bengali (বাংলা)',
    ml: 'Malayalam (മലയാളം)',
    en: 'English',
  };
  const resolvedLang = LANG_RESOLVER[rawLang.toLowerCase()] || rawLang;
  const isEnglish = resolvedLang.toLowerCase().startsWith('en') && !resolvedLang.toLowerCase().includes('hindi') && !resolvedLang.toLowerCase().includes('telugu');

  // Try calling Gemini 3.8 Flash
  if (process.env.GEMINI_API_KEY && aiInstance) {
    try {
      const prompt = `User Question: "${req.message}"
${
  !isEnglish
    ? `CRITICAL LANGUAGE REQUIREMENT:
The user has chosen their regional language: "${resolvedLang}".
You MUST generate your ENTIRE response strictly in "${resolvedLang}" (written in native script: हिन्दी, తెలుగు, தமிழ், मराठी, ಕನ್ನಡ, বাংলা, ਪੰਜਾਬੀ, ગુજરાતી, മലയാളം).
DO NOT answer in English! Even headings, bullet points, numbers, dosages, and explanations must be translated into ${resolvedLang}.
Use respectful Indian farmer greeting (e.g., नमस्ते किसान भाई, నమస్కారం రైతు మిత్రమా, வணக்கம் விவசாய தோழரே, नमस्कार शेतकरी मित्रा).
Format cleanly with short sentences so the browser Text-to-Speech (voice engine) reads it aloud smoothly in ${resolvedLang}.`
    : ''
}

Grounding Marketplace & Knowledge Data (from AgroConnect database):
${JSON.stringify(groundingContext, null, 2)}

Provide a direct, helpful, and well-structured response following your system instructions.`;

      const response = await aiInstance.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      if (response.text) {
        geminiEnhanced = true;
        return {
          answer: response.text,
          data_sources: {
            marketplace_used: marketplaceUsed,
            approved_knowledge_used: approvedKnowledgeUsed,
            gemini_enhanced: geminiEnhanced,
          },
          crop_demand_data: cropDemandData,
          farmer_summary_data: farmerSummaryData,
          approved_knowledge_data: approvedKnowledgeData,
        };
      }
    } catch (err) {
      console.warn('Gemini API call error, using deterministic knowledge fallback:', err);
    }
  }

  // Deterministic Grounded Fallback Response (handles all specific required questions from Sections 13-16)
  const langKey = resolvedLang.toLowerCase();
  const isTelugu = langKey.includes('telugu') || langKey.includes('తెలుగు') || rawLang === 'te';
  const isHindi = langKey.includes('hindi') || langKey.includes('हिन्दी') || rawLang === 'hi';
  const isMarathi = langKey.includes('marathi') || langKey.includes('मराठी') || rawLang === 'mr';
  const isTamil = langKey.includes('tamil') || langKey.includes('தமிழ்') || rawLang === 'ta';
  const isKannada = langKey.includes('kannada') || langKey.includes('ಕನ್ನಡ') || rawLang === 'kn';
  const isPunjabi = langKey.includes('punjabi') || langKey.includes('ਪੰਜਾਬੀ') || rawLang === 'pa';
  const isGujarati = langKey.includes('gujarati') || langKey.includes('ગુજરાતી') || rawLang === 'gu';
  const isBengali = langKey.includes('bengali') || langKey.includes('বাংলা') || rawLang === 'bn';
  const isMalayalam = langKey.includes('malayalam') || langKey.includes('മലയാളം') || rawLang === 'ml';

  let fallbackAnswer = '';

  if (query.includes('demand') && cropDemandData) {
    if (isTelugu) {
      fallbackAnswer = `### ${cropDemandData.crop_name} మార్కెట్ సారాంశం

- **అందుబాటులో ఉన్న పంట జాబితాలు:** ${cropDemandData.active_listings}
- **అందుబాటులో ఉన్న పరిమాణం:** ${cropDemandData.available_quantity.toLocaleString()} కిలోలు
- **ఇటీవలి ఆర్డర్లు:** ${cropDemandData.recent_orders}
- **కొనుగోలుదారులు కోరిన పరిమాణం:** ${cropDemandData.requested_quantity.toLocaleString()} కిలోలు
- **సగటు ధర:** ₹${cropDemandData.average_price}/కిలో

**మార్కెట్ డిమాండ్ స్థితి:** **${cropDemandData.demand_indicator === 'High' ? 'అధిక డిమాండ్' : cropDemandData.demand_indicator === 'Moderate' ? 'సాధారణ డిమాండ్' : 'తక్కువ డిమాండ్'}**
*కారణం:* ${cropDemandData.reason}

*(గమనిక: ${cropDemandData.disclaimer})*`;
    } else if (isHindi) {
      fallbackAnswer = `### ${cropDemandData.crop_name} मंडी मांग सारांश

- **सक्रिय फसल लॉट:** ${cropDemandData.active_listings}
- **उपलब्ध मात्रा:** ${cropDemandData.available_quantity.toLocaleString()} किग्रा
- **हालिया ऑर्डर संख्या:** ${cropDemandData.recent_orders}
- **खरीदारों की मांग:** ${cropDemandData.requested_quantity.toLocaleString()} किग्रा
- **औसत मंडी भाव:** ₹${cropDemandData.average_price}/किग्रा

**मंडी मांग सूचकांक:** **${cropDemandData.demand_indicator === 'High' ? 'उच्च मांग (तेज़ी)' : cropDemandData.demand_indicator === 'Moderate' ? 'सामान्य मांग' : 'कम मांग'}**
*कारण:* ${cropDemandData.reason}

*(नोट: ${cropDemandData.disclaimer})*`;
    } else if (isTamil) {
      fallbackAnswer = `### ${cropDemandData.crop_name} சந்தை தேவை விவரம்

- **செயலில் உள்ள பயிர் பதிவுகள்:** ${cropDemandData.active_listings}
- **கிடைக்கும் இருப்பு:** ${cropDemandData.available_quantity.toLocaleString()} கிலோ
- **சமீபத்திய ஆர்டர்கள்:** ${cropDemandData.recent_orders}
- **வாங்குபவர்கள் கோரிய அளவு:** ${cropDemandData.requested_quantity.toLocaleString()} கிலோ
- **சராசரி விலை:** ₹${cropDemandData.average_price}/கிலோ

**சந்தை தேவை குறியீடு:** **${cropDemandData.demand_indicator === 'High' ? 'அதிக தேவை' : 'சராசரி தேவை'}**
*காரணம்:* ${cropDemandData.reason}`;
    } else if (isKannada) {
      fallbackAnswer = `### ${cropDemandData.crop_name} ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ವಿವರ

- **ಸಕ್ರಿಯ ಬೆಳೆಗಳು:** ${cropDemandData.active_listings}
- **ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ:** ${cropDemandData.available_quantity.toLocaleString()} ಕೆಜಿ
- **ಇತ್ತೀಚಿನ ಆದೇಶಗಳು:** ${cropDemandData.recent_orders}
- **ಖರೀದಿದಾರರ ಬೇಡಿಕೆ:** ${cropDemandData.requested_quantity.toLocaleString()} ಕೆಜಿ
- **ಸರಾಸರಿ ದರ:** ₹${cropDemandData.average_price}/ಕೆಜಿ

**ಬೇಡಿಕೆ ಸ್ಥಿತಿ:** **${cropDemandData.demand_indicator === 'High' ? 'ಹೆಚ್ಚಿನ ಬೇಡಿಕೆ' : 'ಸಾಧಾರಣ ಬೇಡಿಕೆ'}**
*ಕಾರಣ:* ${cropDemandData.reason}`;
    } else if (isBengali) {
      fallbackAnswer = `### ${cropDemandData.crop_name} বাজার চাহিদা বিবরণ

- **সক্রিয় তালিকা:** ${cropDemandData.active_listings}
- **মজুদ পরিমাণ:** ${cropDemandData.available_quantity.toLocaleString()} কেজি
- **সাম্প্রতিক অর্ডার:** ${cropDemandData.recent_orders}
- **ক্রেতাদের চাহিদা:** ${cropDemandData.requested_quantity.toLocaleString()} কেজি
- **গড় বাজার দর:** ₹${cropDemandData.average_price}/কেজি

**চাহিদা সূচক:** **${cropDemandData.demand_indicator === 'High' ? 'উচ্চ চাহিদা' : 'মাঝারি চাহিদা'}**
*কারণ:* ${cropDemandData.reason}`;
    } else if (isPunjabi) {
      fallbackAnswer = `### ${cropDemandData.crop_name} ਮੰਡੀ ਮੰਗ ਸਾਰਾਂਸ਼

- **ਸਰਗਰਮ ਫ਼ਸਲ ਲਾਟ:** ${cropDemandData.active_listings}
- **ਉਪਲਬਧ ਮਾਤਰਾ:** ${cropDemandData.available_quantity.toLocaleString()} ਕਿਲੋ
- **ਤਾਜ਼ਾ ਆਰਡਰ:** ${cropDemandData.recent_orders}
- **ਖਰੀਦਦਾਰਾਂ ਦੀ ਮੰਗ:** ${cropDemandData.requested_quantity.toLocaleString()} ਕਿਲੋ
- **ਔਸਤ ਮੰਡੀ ਰੇਟ:** ₹${cropDemandData.average_price}/ਕਿਲੋ

**ਮੰਗ ਸੂਚਕਾਂਕ:** **${cropDemandData.demand_indicator === 'High' ? 'ਉੱਚੀ ਮੰਗ' : 'ਸਾਧਾਰਨ ਮੰਗ'}**
*ਕਾਰਨ:* ${cropDemandData.reason}`;
    } else if (isGujarati) {
      fallbackAnswer = `### ${cropDemandData.crop_name} બજાર માંગ વિગતો

- **સક્રિય યાદીઓ:** ${cropDemandData.active_listings}
- **ઉપલબ્ધ જથ્થો:** ${cropDemandData.available_quantity.toLocaleString()} કિલો
- **તાજેતરના ઓર્ડર:** ${cropDemandData.recent_orders}
- **ગ્રાહકોની માંગ:** ${cropDemandData.requested_quantity.toLocaleString()} કિલો
- **સરેરાશ બજાર ભાવ:** ₹${cropDemandData.average_price}/કિલો

**માંગ સૂચક:** **${cropDemandData.demand_indicator === 'High' ? 'ઊંચી માંગ' : 'સામાન્ય માંગ'}**
*કારણ:* ${cropDemandData.reason}`;
    } else if (isMalayalam) {
      fallbackAnswer = `### ${cropDemandData.crop_name} മാർക്കറ്റ് ഡിമാൻഡ് വിവരങ്ങൾ

- **ലഭ്യമായ വിളകൾ:** ${cropDemandData.active_listings}
- **ലഭ്യമായ അളവ്:** ${cropDemandData.available_quantity.toLocaleString()} കിലോ
- **സമീപകാല ഓർഡറുകൾ:** ${cropDemandData.recent_orders}
- **ആവശ്യപ്പെടുന്ന അളവ്:** ${cropDemandData.requested_quantity.toLocaleString()} കിലോ
- **ശരാശരി വില:** ₹${cropDemandData.average_price}/കിലോ

**ഡിമാൻഡ് നില:** **${cropDemandData.demand_indicator === 'High' ? 'ഉയർന്ന ഡിമാൻഡ്' : 'സാധാരണ ഡിമാൻഡ്'}**
*കാരണം:* ${cropDemandData.reason}`;
    } else if (isMarathi) {
      fallbackAnswer = `### ${cropDemandData.crop_name} बाजारपेठ मागणी माहिती

- **सक्रिय शेतमाल लॉट्स:** ${cropDemandData.active_listings}
- **उपलब्ध साठा:** ${cropDemandData.available_quantity.toLocaleString()} किलो
- **नुकतीच झालेली खरेदी:** ${cropDemandData.recent_orders} ऑर्डर्स
- **ग्राहकांची मागणी:** ${cropDemandData.requested_quantity.toLocaleString()} किलो
- **सरासरी बाजारभाव:** ₹${cropDemandData.average_price}/किलो

**मागणी स्थिती:** **${cropDemandData.demand_indicator === 'High' ? 'उच्च मागणी' : 'मध्यम मागणी'}**
*कारण:* ${cropDemandData.reason}`;
    } else {
      fallbackAnswer = `### ${cropDemandData.crop_name.toUpperCase()} Marketplace Summary

- **Active Listings:** ${cropDemandData.active_listings}
- **Available Quantity:** ${cropDemandData.available_quantity.toLocaleString()} kg
- **Recent Orders:** ${cropDemandData.recent_orders}
- **Requested Quantity:** ${cropDemandData.requested_quantity.toLocaleString()} kg
- **Average Listed Price:** ₹${cropDemandData.average_price}/kg

**Marketplace Demand Indicator:** **${cropDemandData.demand_indicator.toUpperCase()}**
*Reason:* ${cropDemandData.reason}

*(Note: ${cropDemandData.disclaimer})*`;
    }
  } else if ((query.includes('average listed price') || query.includes('price of') || query.includes('rate') || query.includes('भाव') || query.includes('ధర')) && matchedCrop) {
    const mp = db.getMarketPriceForCrop(matchedCrop);
    if (isTelugu) {
      fallbackAnswer = `### ${mp.crop} మార్కెట్ ధర వివరాలు

- **ప్రస్తుత సగటు ధర:** ₹${mp.average_price}/${mp.unit}
- **ధర పరిధి:** ₹${mp.min_price} – ₹${mp.max_price} / ${mp.unit}
- **మార్పు:** ${mp.price_change_percentage >= 0 ? '+' : ''}${mp.price_change_percentage}% (${mp.demand_level} డిమాండ్)
- **మూలం:** అగ్రోకనెక్ట్ మరియు మండి ధృవీకరించిన లావాదేవీలు.`;
    } else if (isHindi) {
      fallbackAnswer = `### ${mp.crop} का ताज़ा मंडी भाव

- **वर्तमान औसत भाव:** ₹${mp.average_price}/${mp.unit}
- **मूल्य सीमा:** ₹${mp.min_price} – ₹${mp.max_price} प्रति ${mp.unit}
- **२४ घंटे का रुझान:** ${mp.price_change_percentage >= 0 ? '+' : ''}${mp.price_change_percentage}% (${mp.demand_level} मांग)
- **सत्यापित स्रोत:** एग्रोकनेक्ट एवं कृषि मंडी भाव।`;
    } else {
      fallbackAnswer = `### Listed Price for ${mp.crop}

- **Current Average Listed Price:** ₹${mp.average_price}/${mp.unit}
- **Price Range:** ₹${mp.min_price} – ₹${mp.max_price} per ${mp.unit}
- **Recent Trend:** ${mp.price_change_percentage >= 0 ? '+' : ''}${mp.price_change_percentage}% (${mp.demand_level} demand)
- **Source:** Verified AgroConnect transactions & mandi benchmarks.`;
    }
  } else if (query.includes('disease') || query.includes('बीमारी') || query.includes('తెగులు') || query.includes('रोग')) {
    if (approvedKnowledgeData) {
      if (isTelugu) {
        fallbackAnswer = `### ${approvedKnowledgeData.crop} తెగుళ్ల నివారణ & సలహా

**గుర్తించిన సాధారణ తెగుళ్లు:**
${approvedKnowledgeData.common_diseases.map((d: string) => `• ${d}`).join('\n')}

**నివారణ మరియు మందుల మోతాదు:**
${approvedKnowledgeData.content}

**పురుగుల నివారణ:**
${approvedKnowledgeData.pest_management}

*(ధృవీకరించిన శాస్త్రవేత్త: ${approvedKnowledgeData.verified_by})*`;
      } else if (isHindi) {
        fallbackAnswer = `### ${approvedKnowledgeData.crop} रोग प्रबंधन व उपचार (आईसीएआर प्रमाणित)

**पहचाने गए मुख्य रोग:**
${approvedKnowledgeData.common_diseases.map((d: string) => `• ${d}`).join('\n')}

**दवाई व छिड़काव प्रबंधन:**
${approvedKnowledgeData.content}

**कीट नियंत्रण उपाय:**
${approvedKnowledgeData.pest_management}

*(सत्यापित: ${approvedKnowledgeData.verified_by})*`;
      } else {
        fallbackAnswer = `### ${approvedKnowledgeData.crop} Disease Management

**Common Diseases Identified:**
${approvedKnowledgeData.common_diseases.map((d: string) => `• ${d}`).join('\n')}

**Clinical Management Advice:**
${approvedKnowledgeData.content}

**Pest Management:**
${approvedKnowledgeData.pest_management}

*(Verified by: ${approvedKnowledgeData.verified_by})*`;
      }
    } else {
      fallbackAnswer = isTelugu
        ? `దయచేసి మీ పంట ఆకు ఫోటోను అప్‌లోడ్ చేయండి లేదా 'ఆకు తెగుళ్లు గుర్తింపు' ట్యాబ్‌ను ఉపయోగించండి. నేను తెగులును గుర్తించి మందుల మోతాదును వెంటనే చెబుతాను.`
        : isHindi
        ? `कृपया अपने पौधे या पत्ते की फोटो अपलोड करें या 'फोटो से बीमारी पहचानें' टैब का उपयोग करें। मैं तुरंत रोग पहचान कर सही कीटनाशक बताऊँगा।`
        : `Please upload a photo of the infected leaf in the 'Photo Disease Scan' tab to get an instant diagnosis and exact spray dosage.`;
    }
  } else {
    // General assistance
    const stats = db.getMarketplaceStats();
    if (isTelugu) {
      fallbackAnswer = `నమస్కారం రైతు మిత్రమా! నేను మీ **ఆగ్రోకనెక్ట్ ఏఐ వ్యవసాయ సహాయకుడిని**.

నేను మీకు సహాయం చేయగలను:
1. 🌾 **మార్కెట్ ధరలు & డిమాండ్**: "టమోటా ప్రస్తుత మార్కెట్ ధర ఎంత?" అని అడగండి.
2. 📸 **ఆకు ఫోటో తెగుళ్ల గుర్తింపు**: రోగగ్రస్తమైన ఆకు ఫోటో తీసి చూపిస్తే మందుల వివరాలు చెబుతాను.
3. 🎙️ **మైక్‌లో మాట్లాడండి**: మీరు టైప్ చేయకుండా నేరుగా తెలుగులో మాట్లాడవచ్చు.
4. 🌱 **వాతావరణ పంట సలహా**: మీ భూమికి మరియు ప్రస్తుత వాతావరణానికి తగిన పంటలను సూచిస్తాను.

**ప్రస్తుత లైవ్ మార్కెట్ గణాంకాలు:**
• అందుబాటులో ఉన్న పంటలు: ${stats.total_active_listings}
• నమోదైన రైతులు: ${stats.total_farmers}`;
    } else if (isHindi) {
      fallbackAnswer = `नमस्ते किसान भाई! मैं आपका **एग्रोकनेक्ट एआई किसान सहायक** हूँ।

मैं आपकी इन विषयों में मदद कर सकता हूँ:
1. 🌾 **मंडी भाव एवं मांग**: पूछें "टमाटर का आज का मंडी भाव क्या है?"
2. 📸 **पत्ते की फोटो से रोग पहचान**: बीमार पत्ते की फोटो अपलोड करें, मैं सही कीटनाशक व छिड़काव की मात्रा बताऊंगा।
3. 🎙️ **माइक से बोलकर पूछें**: आपको टाइप करने की ज़रूरत नहीं है, बस माइक दबाकर बोलें।
4. 🌱 **मौसम अनुसार सही फसल**: आपके ज़िले के मौसम और मिट्टी के अनुसार उत्तम फसल की सलाह।

**लाइव एग्रोकनेक्ट आंकड़े:**
• सक्रिय फसल लॉट: ${stats.total_active_listings}
• पंजीकृत किसान: ${stats.total_farmers}`;
    } else {
      fallbackAnswer = `Hello Farmer Ji! I am your **AgroConnect AI Farming Partner**.

I can help you:
1. 🌾 **Marketplace Prices & Demand**: Ask "What is the average listed price of tomatoes?"
2. 📸 **Photo Disease Scan**: Upload a photo of infected leaves to detect diseases and prescribe pesticides.
3. 🎙️ **Speak via Microphone**: You don't need to type — speak directly in your state language.
4. 🌱 **Smart Crop Suggester**: Get recommendations based on your local microclimate, soil, and water access.

**Live AgroConnect Marketplace Stats:**
• Active Listings: ${stats.total_active_listings}
• Registered Farmers: ${stats.total_farmers}`;
    }
  }

  return {
    answer: fallbackAnswer,
    data_sources: {
      marketplace_used: marketplaceUsed,
      approved_knowledge_used: approvedKnowledgeUsed,
      gemini_enhanced: false,
    },
    crop_demand_data: cropDemandData,
    farmer_summary_data: farmerSummaryData,
    approved_knowledge_data: approvedKnowledgeData,
  };
}
