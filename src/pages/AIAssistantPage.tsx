import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { DemandBadge } from '../components/DemandBadge';
import {
  Bot,
  Send,
  Sparkles,
  Stethoscope,
  Sprout,
  ShieldCheck,
  Droplets,
  CloudSun,
  MapPin,
  Calendar,
  Layers,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Globe,
  Radio,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string;
  crop_demand_data?: any;
  farmer_summary_data?: any;
  approved_knowledge_data?: any;
  data_sources?: {
    marketplace_used: boolean;
    approved_knowledge_used: boolean;
    gemini_enhanced: boolean;
  };
}

const REGIONAL_QUESTIONS: Record<string, string[]> = {
  hi: [
    'टमाटर का आज का मंडी भाव क्या है?',
    'टमाटर के पत्ते मुड़कर पीले क्यों हो रहे हैं?',
    'इस मौसम में कौन सी फसल लगाना सबसे लाभकारी होगा?',
    'पत्ते के झुलसा रोग का जैविक घरेलू उपचार क्या है?',
    'एग्रोकनेक्ट पर टमाटर की मांग कैसी है?',
  ],
  te: [
    'టమోటా ప్రస్తుత మార్కెట్ ధర ఎంత?',
    'టమోటా ఆకులు ఎందుకు పసుపుగా మారుతున్నాయి?',
    'ఈ వాతావరణంలో ఏ పంట వేయడం మంచిది?',
    'ఆకు తెగులు నివారణకు సేంద్రీయ మందు ఏమిటి?',
    'మార్కెట్లో టమోటా డిమాండ్ ఎలా ఉంది?',
  ],
  mr: [
    'टोमॅटोचा आजचा बाजारभाव काय आहे?',
    'टोमॅटोची पाने का मुरडत आहेत?',
    'या हंगामात कोणते पीक फायदेशीर ठरेल?',
    'करपा रोगावर सेंद्रिय उपाय काय आहे?',
    'बाजारात टोमॅटोची मागणी कशी आहे?',
  ],
  ta: [
    'தக்காளி இன்றைய மண்டி விலை என்ன?',
    'தக்காளி இலைகள் ஏன் சுருண்டு மஞ்சளாகின்றன?',
    'இந்த பருவத்திற்கு ஏற்ற சிறந்த பயிர் எது?',
    'இலை கருகல் நோய்க்கான இயற்கை மருந்து என்ன?',
    'சந்தையில் தக்காளியின் தேவை எப்படி உள்ளது?',
  ],
  kn: [
    'ಟೊಮೆಟೊ ಇಂದಿನ ಮಂಡಿ ದರ ಎಷ್ಟು?',
    'ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿರುವುದು ಏಕೆ?',
    'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?',
    'ಎಲೆ ರೋಗಕ್ಕೆ ಸಾವಯವ ಪರಿಹಾರವೇನು?',
    'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಟೊಮೆಟೊ ಬೇಡಿಕೆ ಹೇಗಿದೆ?',
  ],
  pa: [
    'ਟਮਾਟਰ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?',
    'ਟਮਾਟਰ ਦੇ ਪੱਤੇ ਪੀਲੇ ਕਿਉਂ ਹੋ ਰਹੇ ਹਨ?',
    'ਇਸ ਮੌਸਮ ਵਿੱਚ ਕਿਹੜੀ ਫ਼ਸਲ ਲਾਉਣੀ ਚਾਹੀਦੀ ਹੈ?',
    'ਪੱਤਾ ਝੁਲਸ ਰੋਗ ਦਾ ਦੇਸੀ ਇਲਾਜ ਕੀ ਹੈ?',
    'ਮੰਡੀ ਵਿੱਚ ਟਮਾਟਰ ਦੀ ਮੰਗ ਕਿਹੋ ਜਿਹੀ ਹੈ?',
  ],
  gu: [
    'ટામેટાનો આજનો બજારભાવ શું છે?',
    'ટામેટાના પાંદડા કેમ પીળા થઈ રહ્યા છે?',
    'આ સીઝનમાં કયો પાક લેવો સારો?',
    'પાનના સુકારા રોગ માટે દેશી ઉપાય શું છે?',
    'બજારમાં ટામેટાની માંગ કેવી છે?',
  ],
  bn: [
    'টমেটোর আজকের পাইকারি দর কত?',
    'টমেটো গাছের পাতা হলুদ হয়ে যাচ্ছে কেন?',
    'এই মরসুমে কোন ফসল চাষ করা সবচেয়ে লাভজনক?',
    'পাতা পোড়া রোগের জৈব প্রতিকার কী?',
    'বাজারে টমেটোর চাহিদা কেমন?',
  ],
  ml: [
    'തക്കാളിയുടെ ഇന്നത്തെ വിപണി വില എത്ര?',
    'തക്കാളി ഇലകൾ മഞ്ഞനിറമാകുന്നത് എന്തുകൊണ്ട്?',
    'ഈ കാലാവസ്ഥയിൽ ഏത് വിളയാണ് ഏറ്റവും അനുയോജ്യം?',
    'ഇല കരിച്ചിൽ രോഗത്തിന് ജൈവ പ്രതിവിധി എന്താണ്?',
    'മാർക്കറ്റിൽ തക്കാളിയുടെ ഡിമാൻഡ് എങ്ങനെയാണ്?',
  ],
  en: [
    'What is the current mandi price of tomatoes?',
    'Why are tomato leaves curling and turning yellow?',
    'Which crop is best to plant in this season?',
    'What is the organic remedy for leaf blight?',
    'How is the demand for tomatoes right now?',
  ],
};

const SAMPLE_LEAF_CARDS = [
  {
    title: 'Tomato Early Blight',
    crop: 'Tomato',
    symptom: 'Dark concentric brown rings on lower leaves with yellow halo',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tomato Leaf Curl Virus',
    crop: 'Tomato',
    symptom: 'Leaves curling upwards, stunted plant with thickened yellow foliage',
    image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Onion Purple Blotch',
    crop: 'Onion',
    symptom: 'Sunken purple brown spots on leaves turning into water-soaked patches',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Chilli Leaf Curl & Thrips',
    crop: 'Chilli',
    symptom: 'Leaf curl, crinkled margins and downward leaf boat shape with flower drop',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop&q=80',
  },
];

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage, currentOption, t, translateCrop, translateCategory } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'disease_detector' | 'crop_suggester'>('chat');

  // --- 1. Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Voice Input (Microphone) ---
  const [isListening, setIsListening] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // --- Voice Output (Speaker) ---
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // --- 2. Disease Detection State with Photo Upload ---
  const [diseaseCrop, setDiseaseCrop] = useState('Tomato');
  const [diseaseSymptoms, setDiseaseSymptoms] = useState('');
  const [uploadedLeafPhoto, setUploadedLeafPhoto] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [diseaseError, setDiseaseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 3. Smart Crop Suggester State ---
  const [suggesterLocation, setSuggesterLocation] = useState(user?.location || 'Guntur, Andhra Pradesh');
  const [suggesterSoil, setSuggesterSoil] = useState('Alluvial Soil (Well-drained loam)');
  const [suggesterWater, setSuggesterWater] = useState('Medium (Sprinkler / Drip Irrigation)');
  const [recommending, setRecommending] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<any | null>(null);
  const [suggesterError, setSuggesterError] = useState<string | null>(null);

  // Load voices for Chrome/Safari
  useEffect(() => {
    const handleVoicesChanged = () => {
      window.speechSynthesis?.getVoices();
    };
    handleVoicesChanged();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
  }, []);

  // Welcome message formatted in current language
  useEffect(() => {
    const userName = user ? user.name.split(' ')[0] : (currentLanguage === 'hi' ? 'किसान भाई' : currentLanguage === 'te' ? 'రైతు మిత్రమా' : 'Farmer Ji');
    
    let welcomeText = '';
    if (currentLanguage === 'hi') {
      welcomeText = `नमस्ते ${userName}! मैं आपका **${t('ai.name')}** हूँ।

मैं आपकी इन विषयों में मदद कर सकता हूँ:
1. 📸 **पौधे की फोटो से रोग पहचान**: बीमार पत्ते की फोटो अपलोड करें, मैं तुरंत रोग की पहचान कर सरकारी अनुमोदित कीटनाशक व सही छिड़काव की मात्रा बताऊंगा।
2. 🎙️ **माइक से अपनी भाषा में बोलें**: आपको टाइप करने की ज़रूरत नहीं है — बस माइक बटन दबाकर हिन्दी में बोलें।
3. 🌾 **मंडी भाव व मांग**: सभी राज्यों की कृषि मंडियों के ताज़ा भाव और मांग अनुपात जानें।
4. 🌱 **मौसम अनुसार फसल चयन**: आपके जिले के मौसम, मिट्टी और पानी की उपलब्धता के आधार पर सर्वोत्तम फसल की सलाह।

आप मुझसे अपनी भाषा में कोई भी सवाल पूछ सकते हैं!`;
    } else if (currentLanguage === 'te') {
      welcomeText = `నమస్కారం ${userName}! నేను మీ **${t('ai.name')}** వ్యవసాయ సహాయకుడిని.

నేను మీకు సహాయం చేయగలను:
1. 📸 **ఆకు ఫోటో తెగుళ్ల గుర్తింపు**: రోగగ్రస్తమైన ఆకు ఫోటో తీసి చూపిస్తే తెగులును గుర్తించి సరైన మందుల మోతాదును చెబుతాను.
2. 🎙️ **మైక్‌లో మాట్లాడండి**: మీరు టైప్ చేయకుండా నేరుగా మైక్ నొక్కి తెలుగులో మాట్లాడవచ్చు.
3. 🌾 **మార్కెట్ ధరలు & డిమాండ్**: ఆంధ్రప్రదేశ్, తెలంగాణ సహా అన్ని రాష్ట్రాల లైవ్ మండి ధరలు తెలుసుకోండి.
4. 🌱 **వాతావరణ పంట సలహా**: మీ భూమికి, నీటికి మరియు ప్రస్తుత వాతావరణానికి తగిన లాభదాయక పంటలను సూచిస్తాను.

మీ పంట సందేహాన్ని ఇప్పుడే అడగండి!`;
    } else if (currentLanguage === 'mr') {
      welcomeText = `नमस्कार ${userName}! मी आपला **${t('ai.name')}** शेतकरी मित्र आहे.

मी आपल्याला खालील बाबींमध्ये मदत करू शकतो:
1. 📸 **पानांच्या फोटोवरून रोग निदान**: आजारी पानाचा फोटो अपलोड करा, मी लगेच रोग ओळखतो आणि औषधांचे प्रमाण सांगतो.
2. 🎙️ **माईकवर बोला**: टाईप न करता थेट मराठीत बोलून प्रश्न विचारा.
3. 🌾 **बाजारभाव व मागणी माहिती**: महाराष्ट्रातील सर्व बाजार समित्यांचे ताजे भाव तपासा.
4. 🌱 **हवामानानुसार योग्य पीक सल्ला**: आपल्या जमिनीनुसार फायदेशीर पिकांची माहिती मिळवा.`;
    } else if (currentLanguage === 'ta') {
      welcomeText = `வணக்கம் ${userName}! நான் உங்கள் **${t('ai.name')}** விவசாய தோழன்.

நான் உங்களுக்கு உதவ முடியும்:
1. 📸 **இலை புகைப்பட நோய் கண்டறிதல்**: பாதிக்கப்பட்ட இலையின் புகைப்படத்தை பதிவேற்றி உடனடியாக நோய் மற்றும் மருந்து அளவை அறியலாம்.
2. 🎙️ **மைக் மூலம் தமிழில் பேசுங்கள்**: தட்டச்சு செய்ய தேவையில்லை — நேரடியாக தமிழில் பேசலாம்.
3. 🌾 **மண்டி விலை & சந்தை தேவை**: தமிழ்நாடு மற்றும் அனைத்து மாநில சந்தை விலைகளை அறியலாம்.
4. 🌱 **பயிர் பரிந்துரை**: தட்பவெப்பநிலைக்கேற்ற சிறந்த பயிர்களை தேர்வு செய்யலாம்.`;
    } else {
      welcomeText = `Namaste ${userName}! I am your **${t('ai.name')}**.

I can help you:
1. 📸 **Upload or click a photo of diseased leaves** to detect blights, viruses, or fungi, prescribing certified pesticides with exact spray dosages.
2. 🎙️ **Speak directly into the microphone** in ${currentOption.nativeName} without needing to type.
3. 🌾 **Check live marketplace mandi prices and demand ratios** across all Indian states.
4. 🌱 **Recommend high-profit crops** tailored to your district's real-time weather, soil type, and irrigation access.

How can I help your farm today?`;
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_sources: {
          marketplace_used: true,
          approved_knowledge_used: true,
          gemini_enhanced: true,
        },
      },
    ]);
  }, [currentLanguage]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Voice Input (Microphone) handler
  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setMicNotice(null);
    window.speechSynthesis?.cancel();
    setSpeakingId(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicNotice(t('ai.mic_permission_needed', 'Microphone speech recognition is not supported in this browser. Please click a sample question or type.'));
      return;
    }

    try {
      // 1. Request microphone access to guarantee browser permissions
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission blocked or refused:', permErr);
          setMicNotice('Microphone permission blocked. Please allow microphone access in your browser or click any quick question below.');
        }
      }

      // 2. Instantiate SpeechRecognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentOption.speechCode || 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setMicNotice(null);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        const text = (finalTrans || interimTrans).trim();
        if (text) {
          setInput(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicNotice('Microphone access blocked. Click any question below to ask instantly in ' + currentOption.nativeName + '.');
        } else if (event.error === 'no-speech') {
          setMicNotice('No speech detected. Please speak clearly into the microphone.');
        } else {
          setMicNotice(`Microphone status: ${event.error}. You can also click the quick questions below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setMicNotice('Could not start microphone: ' + (err.message || 'Please click a quick question below'));
    }
  };

  // Text-to-Speech Output in Selected Language
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*#_`>-]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick best voice matching selected language
    const voices = window.speechSynthesis.getVoices();
    const targetCode = currentOption.speechCode.toLowerCase();
    const langPrefix = targetCode.split('-')[0];

    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return (
        vLang === targetCode ||
        vLang.startsWith(langPrefix) ||
        v.name.toLowerCase().includes(currentOption.englishName.toLowerCase()) ||
        v.name.toLowerCase().includes(currentOption.nativeName.toLowerCase())
      );
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = currentOption.speechCode || 'hi-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeakingId(msgId);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    // Chrome resume workaround
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  // Send Chat Message
  const handleSendMessage = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || loading) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const langParam = `${currentOption.englishName} (${currentOption.nativeName})`;
      const res = await api.askAssistant(q, user?.id, undefined, langParam);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        crop_demand_data: res.crop_demand_data,
        farmer_summary_data: res.farmer_summary_data,
        approved_knowledge_data: res.approved_knowledge_data,
        data_sources: res.data_sources,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (autoSpeak) {
        speakText(res.answer, botMsg.id);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error connecting to Kisan AI: ${err.message || 'Please retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLeafPhoto(reader.result as string);
        setDiseaseError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnoseDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseSymptoms.trim() && !uploadedLeafPhoto) {
      setDiseaseError('Please upload a leaf photo or describe symptoms.');
      return;
    }
    setDiagnosing(true);
    setDiagnosisResult(null);
    setDiseaseError(null);

    try {
      const res = await api.detectDisease(
        diseaseCrop,
        diseaseSymptoms || 'Visual leaf pathology inspection from uploaded plant photo',
        uploadedLeafPhoto || undefined,
        `${currentOption.englishName} (${currentOption.nativeName})`
      );
      setDiagnosisResult(res);
    } catch (err: any) {
      setDiseaseError(err.message || 'Diagnosis failed. Please try again.');
    } finally {
      setDiagnosing(false);
    }
  };

  const handleRecommendCrops = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecommending(true);
    setRecommendationResult(null);
    setSuggesterError(null);

    try {
      const res = await api.recommendCrops({
        location: suggesterLocation,
        soilType: suggesterSoil,
        waterAvailability: suggesterWater,
        language: `${currentOption.englishName} (${currentOption.nativeName})`,
      });
      setRecommendationResult(res);
    } catch (err: any) {
      setSuggesterError(err.message || 'Crop recommendation failed. Please check inputs.');
    } finally {
      setRecommending(false);
    }
  };

  const sampleQuestions = REGIONAL_QUESTIONS[currentLanguage] || REGIONAL_QUESTIONS.en;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Human-Made Persona Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
              alt="Farmer AI Persona"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live 24/7 Kisan Sahayak
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {currentOption.flag} {currentOption.nativeName} ({currentOption.states})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
              {t('ai.name')}
            </h1>
            <p className="text-xs text-stone-300 max-w-xl mt-1">
              {t('ai.welcome_banner')}
            </p>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/10 text-xs shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{t('ai.tab_chat')}</span>
          </button>

          <button
            onClick={() => setActiveTab('disease_detector')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'disease_detector'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('ai.tab_photo')}</span>
          </button>

          <button
            onClick={() => setActiveTab('crop_suggester')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'crop_suggester'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{t('ai.tab_suggester')}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE CHAT & VOICE INTERACTION */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          {/* Quick Voice Questions Ribbon */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t('ai.quick_prompts_title')} ({currentOption.nativeName})
              </span>
              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                  autoSpeak ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Auto-Read Voice: {autoSpeak ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(question)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all text-left flex items-center gap-1.5"
                >
                  <span>🎙️</span>
                  <span>{question}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Microphone Notice / Fallback Banner */}
          {micNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{micNotice}</span>
              </div>
              <button
                onClick={() => setMicNotice(null)}
                className="text-stone-500 hover:text-stone-800 font-bold p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Chat Window */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm flex flex-col h-[580px] overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSpeaking = speakingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                        isUser
                          ? 'bg-stone-900 text-white'
                          : 'bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white'
                      }`}
                    >
                      {isUser ? 'You' : <Bot className="w-5 h-5" />}
                    </div>

                    <div
                      className={`p-4 rounded-3xl text-xs leading-relaxed space-y-3 ${
                        isUser
                          ? 'bg-stone-900 text-stone-100 rounded-tr-xs'
                          : 'bg-stone-50 text-stone-800 border border-stone-200/90 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Plant leaf"
                          className="w-full max-h-48 rounded-2xl object-cover border border-stone-200 shadow-xs"
                        />
                      )}

                      <div className="whitespace-pre-wrap space-y-2 leading-relaxed">
                        {msg.text}
                      </div>

                      {/* Demand Ratio Card if available */}
                      {msg.crop_demand_data && (
                        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between font-bold text-stone-900">
                            <span>{translateCrop(msg.crop_demand_data.crop_name)} DEMAND RATIO</span>
                            <DemandBadge level={msg.crop_demand_data.demand_indicator} ratio={msg.crop_demand_data.demand_ratio} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                            <div>Active Batches: <strong className="text-stone-900">{msg.crop_demand_data.active_listings}</strong></div>
                            <div>Available Stock: <strong className="text-stone-900">{msg.crop_demand_data.available_quantity.toLocaleString()} kg</strong></div>
                            <div>Recent Orders: <strong className="text-stone-900">{msg.crop_demand_data.recent_orders}</strong></div>
                            <div>Avg Farmgate Price: <strong className="text-emerald-700">₹{msg.crop_demand_data.average_price}/kg</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Action Bar (Audio speaker & Time) */}
                      {!isUser && (
                        <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between">
                          <button
                            onClick={() => speakText(msg.text, msg.id)}
                            className={`flex items-center gap-1.5 font-bold transition-colors ${
                              isSpeaking ? 'text-amber-600 animate-pulse' : 'text-emerald-700 hover:text-emerald-900'
                            }`}
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-4 h-4" />
                                <span>{t('ai.stop_speaking')}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4" />
                                <span>{t('ai.speak_answer')} ({currentOption.nativeName})</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3 items-center text-xs text-stone-500 bg-stone-50 p-4 rounded-3xl w-fit border border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  <span className="font-semibold text-stone-700">Kisan AI is analyzing agricultural logs in {currentOption.nativeName}...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Listening Status Ribbon with Live Audio Waves */}
            {isListening && (
              <div className="px-6 py-2.5 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700 animate-pulse">
                <div className="flex items-center gap-3 font-bold">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-4 bg-red-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-6 bg-red-600 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-3 bg-red-600 rounded-full animate-bounce delay-200" />
                    <span className="w-1.5 h-5 bg-red-600 rounded-full animate-bounce delay-75" />
                  </div>
                  <span>🎙️ {t('ai.voice_listening')} ({currentOption.nativeName})...</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px] shadow-sm hover:bg-red-700"
                >
                  Done Speaking
                </button>
              </div>
            )}

            {/* Input Bar with Microphone */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-2.5"
              >
                {/* Voice Mic Toggle */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition-all shadow-xs ${
                    isListening
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-300'
                  }`}
                  title={isListening ? t('ai.voice_stop') : t('ai.voice_start')}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    currentLanguage === 'hi'
                      ? 'यहाँ अपनी फसल का सवाल लिखें या माइक दबाकर बोलें...'
                      : currentLanguage === 'te'
                      ? 'పంట సందేహం ఇక్కడ టైప్ చేయండి లేదా మైక్ నొక్కి మాట్లాడండి...'
                      : currentLanguage === 'mr'
                      ? 'येथे प्रश्न विचारा किंवा माईक दाबून बोला...'
                      : currentLanguage === 'ta'
                      ? 'கேள்வியை எழுதவும் அல்லது மைக் அழுத்தவும்...'
                      : 'Type your farming question or click microphone to speak...'
                  }
                  className="flex-1 py-3 px-4 text-xs rounded-2xl border border-stone-300 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-md shadow-emerald-900/10"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PHOTO PLANT DISEASE DETECTOR WITH CAMERA / UPLOAD */}
      {/* ========================================================================= */}
      {activeTab === 'disease_detector' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <Stethoscope className="w-3.5 h-3.5" /> ICAR Plant Pathology Vision AI
              </span>
              <h2 className="text-2xl font-bold text-stone-900 font-heading mt-2">
                {t('ai.upload_photo')}
              </h2>
              <p className="text-xs text-stone-500">
                Upload or capture a photo of infected leaves or stems. Kisan AI analyzes fungal lesions, bacterial blights, and viral leaf curls in {currentOption.nativeName}, prescribing exact commercial pesticide brands, dilution ratios, and organic remedies.
              </p>
            </div>

            {diseaseError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {diseaseError}
              </div>
            )}

            {/* Photo Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                uploadedLeafPhoto
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : 'border-stone-300 hover:border-emerald-500 bg-stone-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {uploadedLeafPhoto ? (
                <div className="relative max-w-md w-full">
                  <img
                    src={uploadedLeafPhoto}
                    alt="Uploaded leaf"
                    className="w-full max-h-64 rounded-2xl object-cover shadow-md border border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedLeafPhoto(null);
                      setDiagnosisResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Photo Loaded. Ready for Pathology Diagnosis.
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">
                      {t('ai.drag_photo')}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      Click to take photo with phone camera or upload from computer
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sample Infected Leaves for 1-Click Testing */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t('ai.sample_photos')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {SAMPLE_LEAF_CARDS.map((card, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setUploadedLeafPhoto(card.image);
                      setDiseaseCrop(card.crop);
                      setDiseaseSymptoms(card.symptom);
                      setDiseaseError(null);
                    }}
                    className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 text-left flex items-center gap-3 transition-all group shadow-xs"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-100 shrink-0"
                    />
                    <div className="truncate">
                      <strong className="text-stone-900 group-hover:text-emerald-700 block text-xs truncate">
                        {card.title}
                      </strong>
                      <span className="text-[10px] text-stone-400">{translateCrop(card.crop)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleDiagnoseDisease} className="space-y-4 pt-2 border-t border-stone-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('ai.crop_label')} *
                  </label>
                  <select
                    value={diseaseCrop}
                    onChange={(e) => setDiseaseCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-bold text-stone-800"
                  >
                    <option value="Tomato">{translateCrop('Tomato')} (Tomato)</option>
                    <option value="Onion">{translateCrop('Onion')} (Onion)</option>
                    <option value="Wheat">{translateCrop('Wheat')} (Wheat)</option>
                    <option value="Potato">{translateCrop('Potato')} (Potato)</option>
                    <option value="Apple">{translateCrop('Apple')} (Apple)</option>
                    <option value="Chilli">{translateCrop('Chilli')} (Chilli)</option>
                    <option value="Rice">{translateCrop('Rice')} (Paddy)</option>
                    <option value="Cotton">{translateCrop('Cotton')} (Cotton)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('ai.symptoms_label')}
                  </label>
                  <input
                    type="text"
                    value={diseaseSymptoms}
                    onChange={(e) => setDiseaseSymptoms(e.target.value)}
                    placeholder={t('ai.symptoms_ph')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={diagnosing || (!uploadedLeafPhoto && !diseaseSymptoms.trim())}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{diagnosing ? t('ai.analyzing') : t('ai.analyze_btn')}</span>
              </button>
            </form>
          </div>

          {/* Diagnostic Result Card */}
          {diagnosisResult && (
            <div className="bg-white rounded-3xl border border-red-200/80 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800">
                      {diagnosisResult.pathogen_type} Infection
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs font-semibold text-stone-500">
                      {t('ai.severity_label')} <strong>{diagnosisResult.severity}</strong>
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 font-heading mt-1">
                    {diagnosisResult.disease_name}
                  </h3>
                  <div className="text-xs text-stone-500 italic">
                    Scientific Name: {diagnosisResult.scientific_name}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      speakText(
                        `Diagnosis: ${diagnosisResult.disease_name}. Recommended medicine is ${diagnosisResult.recommended_pesticides?.[0]?.name}. Spray dosage is ${diagnosisResult.recommended_pesticides?.[0]?.dosage_per_liter}. Organic treatment: ${diagnosisResult.organic_treatment}`,
                        'diag-full'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{t('ai.speak_answer')} ({currentOption.nativeName})</span>
                  </button>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('ai.confidence_label')} {Math.round(diagnosisResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Recommended Chemical Pesticides */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> {t('ai.pesticides_title')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diagnosisResult.recommended_pesticides?.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-stone-900 text-sm">{p.name}</div>
                          <div className="text-[11px] text-stone-600 font-mono">{p.chemical_name}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-red-200 text-red-800">
                          {p.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-stone-400 block">Dosage:</span>
                          <strong className="text-red-900">{p.dosage_per_liter}</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Safe Waiting Period:</span>
                          <strong className="text-stone-800">{p.waiting_period_days} Days</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-600 pt-1 border-t border-red-100">
                        <strong>Frequency:</strong> {p.application_frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organic Alternative */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                  <Sprout className="w-4 h-4 text-emerald-600" /> {t('ai.organic_title')}
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {diagnosisResult.organic_treatment}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SMART CROP RECOMMENDATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'crop_suggester' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <Sprout className="w-3.5 h-3.5" /> Precision Agronomy Crop Suggester
              </span>
              <h2 className="text-2xl font-bold text-stone-900 font-heading mt-2">
                Crop Recommendations by Live Weather, Soil Type & Water
              </h2>
              <p className="text-xs text-stone-500">
                The AI checks real-time temperature and rainfall from Open-Meteo for your district, correlates it with your farm's soil composition and irrigation water access, and recommends high-yielding crops directly in {currentOption.nativeName}.
              </p>
            </div>

            {suggesterError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {suggesterError}
              </div>
            )}

            <form onSubmit={handleRecommendCrops} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('ai.location_label')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={suggesterLocation}
                    onChange={(e) => setSuggesterLocation(e.target.value)}
                    placeholder="e.g. Guntur, Nashik, Ludhiana..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 font-bold text-stone-800"
                  />
                </div>

                {/* Soil Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('ai.soil_label')} *
                  </label>
                  <select
                    value={suggesterSoil}
                    onChange={(e) => setSuggesterSoil(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-medium text-stone-800"
                  >
                    <option value="Alluvial Soil (Well-drained loam)">Alluvial Soil (Gangetic & coastal plains)</option>
                    <option value="Black Soil / Regur (High clay, moisture retentive)">Black / Regur Soil (Maharashtra, MP, Gujarat)</option>
                    <option value="Red & Yellow Soil (Rich in iron, porous)">Red & Yellow Soil (Tamil Nadu, Karnataka, AP, Odisha)</option>
                    <option value="Laterite Soil (Acidic, Western Ghats)">Laterite Soil (Western Ghats, Kerala, Assam)</option>
                    <option value="Sandy Loam (Light, quick draining)">Sandy Loam (Rajasthan, Haryana, Punjab)</option>
                    <option value="Mountain / Forest Soil (Rich humus)">Mountain Soil (Himachal, Kashmir, Uttarakhand)</option>
                  </select>
                </div>

                {/* Water Availability */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('ai.water_label')} *
                  </label>
                  <select
                    value={suggesterWater}
                    onChange={(e) => setSuggesterWater(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-medium text-stone-800"
                  >
                    <option value="High (Perennial Canal / Deep Borewell)">High (Perennial canal / river borewell)</option>
                    <option value="Medium (Sprinkler / Drip Irrigation)">Medium (Drip / Sprinkler / Seasonal wells)</option>
                    <option value="Low / Rainfed (Monsoon Dependent)">Low / Rainfed (Dryland farming)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={recommending}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{recommending ? t('ai.recommending') : t('ai.generate_crops_btn')}</span>
              </button>
            </form>
          </div>

          {/* Recommendation Results */}
          {recommendationResult && (
            <div className="bg-white rounded-3xl border border-emerald-200/90 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    Recommended Sowing Strategy • {recommendationResult.season}
                  </span>
                  <h3 className="text-2xl font-bold text-stone-900 font-heading mt-1">
                    Precision Farming Recommendations for {recommendationResult.location}
                  </h3>
                </div>

                {recommendationResult.live_weather && (
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center gap-3">
                    <CloudSun className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-stone-900">
                        {recommendationResult.live_weather.temperature}°C • {recommendationResult.live_weather.weather_condition}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Humidity: {recommendationResult.live_weather.humidity}% | Rain: {recommendationResult.live_weather.precipitation_probability}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-stone-800 leading-relaxed">
                <strong>Agronomist Summary:</strong> {recommendationResult.expert_summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recommendationResult.recommended_crops?.map((crop: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-500 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {translateCategory(crop.category)}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-800">
                          {crop.suitability_score}% Match
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-stone-900 font-heading">
                        {translateCrop(crop.crop_name)}
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {crop.why_recommended}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-stone-200/60">
                        <div>
                          <span className="text-stone-400 block">{t('ai.expected_yield')}:</span>
                          <strong className="text-stone-900">{crop.expected_yield_per_acre}</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block">{t('ai.maturity_days')}:</span>
                          <strong className="text-stone-900">{crop.maturity_duration_days} Days</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Water:</span>
                          <strong className="text-stone-900">{crop.water_requirement}</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block">{t('ai.projected_price')}:</span>
                          <strong className="text-emerald-700">{crop.mandi_price_projection}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
