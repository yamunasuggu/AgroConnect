import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Upload,
  Camera,
  X,
  Send,
  Sparkles,
  Stethoscope,
  Sprout,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Minimize2,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Globe,
  CloudSun,
} from 'lucide-react';

interface FloatingAIAssistantProps {
  onNavigate?: (page: string, params?: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string;
  diagnosisData?: any;
}

const SAMPLE_LEAF_PHOTOS = [
  {
    title: 'Tomato Early Blight',
    crop: 'Tomato',
    symptoms: 'Concentric brown target rings on lower leaves with yellow halo',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tomato Leaf Curl Virus',
    crop: 'Tomato',
    symptoms: 'Upward curling of leaves, stunted plant, thickened yellow foliage',
    image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Onion Purple Blotch',
    crop: 'Onion',
    symptoms: 'Small water-soaked sunken lesions on leaf blades turning purplish brown',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Chilli Leaf Curl & Thrips',
    crop: 'Chilli',
    symptoms: 'Upward boat-shaped crinkled leaves with flower drop',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop&q=80',
  },
];

const QUICK_VOICE_PROMPTS: Record<string, string[]> = {
  hi: [
    'टमाटर का आज का मंडी भाव क्या है?',
    'टमाटर के पत्ते मुड़कर पीले क्यों हो रहे हैं?',
    'इस मौसम में कौन सी फसल बोनी चाहिए?',
  ],
  te: [
    'టమోటా ప్రస్తుత మార్కెట్ ధర ఎంత?',
    'టమోటా ఆకులు ఎందుకు పసుపుగా మారుతున్నాయి?',
    'ఈ వాతావరణంలో ఏ పంట వేయాలి?',
  ],
  mr: [
    'टोमॅटोचा आजचा बाजारभाव काय आहे?',
    'टोमॅटोची पाने का मुरडत आहेत?',
    'या हंगामात कोणते पीक फायदेशीर ठरेल?',
  ],
  ta: [
    'தக்காளி இன்றைய மண்டி விலை என்ன?',
    'தக்காளி இலைகள் ஏன் சுருண்டு மஞ்சளாகின்றன?',
    'இந்த பருவத்திற்கு ஏற்ற சிறந்த பயிர் எது?',
  ],
  kn: [
    'ಟೊಮೆಟೊ ಇಂದಿನ ಮಂಡಿ ದರ ಎಷ್ಟು?',
    'ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿರುವುದು ಏಕೆ?',
    'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?',
  ],
  pa: [
    'ਟਮਾਟਰ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?',
    'ਪੱਤੇ ਪੀਲੇ ਕਿਉਂ ਹੋ ਰਹੇ ਹਨ?',
    'ਇਸ ਮੌਸਮ ਵਿੱਚ ਕਿਹੜੀ ਫ਼ਸਲ ਲਾਉਣੀ ਚਾਹੀਦੀ ਹੈ?',
  ],
  gu: [
    'ટામેટાનો આજનો બજારભાવ શું છે?',
    'પાંદડા કેમ પીળા થઈ રહ્યા છે?',
    'આ સીઝનમાં કયો પાક લેવો જોઈએ?',
  ],
  bn: [
    'টমেটোর আজকের পাইকারি দর কত?',
    'গাছের পাতা হলুদ হয়ে যাচ্ছে কেন?',
    'এই মরসুমে কোন ফসল চাষ করা উচিত?',
  ],
  ml: [
    'തക്കാളിയുടെ ഇന്നത്തെ വിപണി വില എത്ര?',
    'ഇലകൾ മഞ്ഞനിറമാകുന്നത് എന്തുകൊണ്ട്?',
    'ഈ കാലാവസ്ഥയിൽ ഏത് വിളയാണ് നല്ലത്?',
  ],
  en: [
    'What is the current mandi price of tomatoes?',
    'Why are tomato leaves curling and yellowing?',
    'Which crop is best to plant in this season?',
  ],
};

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ onNavigate }) => {
  const { currentLanguage, currentOption, t, setLanguage, availableLanguages } = useLanguage();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'photo_disease' | 'crop_suggester'>('chat');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Input (Speech-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Voice Output (Text-to-Speech) State
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Photo Disease Scan State
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [manualSymptoms, setManualSymptoms] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop Suggester State
  const [suggesterLocation, setSuggesterLocation] = useState(user?.location || 'Guntur, Andhra Pradesh');
  const [suggesterSoil, setSuggesterSoil] = useState('Black Soil / Regur');
  const [suggesterWater, setSuggesterWater] = useState('Medium (Sprinkler / Drip)');
  const [recommending, setRecommending] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<any | null>(null);

  // Initialize Welcome Message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: t('ai.greeting'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentLanguage]);

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

  // Toggle Voice Recording
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
      // 1. Explicitly request microphone stream to trigger browser prompt
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission prompt issue:', permErr);
          setMicNotice('Microphone access blocked. Please allow mic in browser settings, or click any voice question below.');
        }
      }

      // 2. Instantiate fresh SpeechRecognition instance
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
        if (event.error === 'not-allowed') {
          setMicNotice('Microphone permission blocked. Please enable mic in your browser address bar.');
        } else if (event.error === 'no-speech') {
          setMicNotice('No speech detected. Speak clearly into the microphone.');
        } else {
          setMicNotice(`Voice recognition notice: ${event.error}. You can also click the quick prompt buttons.`);
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
      setMicNotice('Could not start microphone: ' + (err.message || 'Please retry'));
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
    const targetPrefix = currentOption.speechCode.slice(0, 2).toLowerCase();

    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return (
        vLang === targetCode ||
        vLang.startsWith(targetPrefix) ||
        v.name.toLowerCase().includes(currentOption.englishName.toLowerCase()) ||
        v.name.toLowerCase().includes(currentOption.nativeName.toLowerCase())
      );
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = currentOption.speechCode;
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
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Send Chat Message
  const handleSendMessage = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || loading) return;

    const wasListening = isListening;
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
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak answer if autoSpeak or if user spoke through microphone
      if (autoSpeak || wasListening) {
        speakText(res.answer, botMsg.id);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error connecting to assistant: ${err.message || 'Please retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Handling
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setPhotoError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Disease Diagnosis
  const handleDiagnosePhoto = async () => {
    if (!uploadedImage && !manualSymptoms.trim()) {
      setPhotoError('Please upload a plant leaf photo or describe symptoms.');
      return;
    }

    setDiagnosing(true);
    setDiagnosisResult(null);
    setPhotoError(null);

    try {
      const langParam = `${currentOption.englishName} (${currentOption.nativeName})`;
      const res = await api.detectDisease(
        selectedCrop,
        manualSymptoms || 'Visual leaf pathology inspection from uploaded plant leaf photo',
        uploadedImage || undefined,
        langParam
      );
      setDiagnosisResult(res);

      // Append to conversation
      const diagMsg: ChatMessage = {
        id: `diag-${Date.now()}`,
        sender: 'assistant',
        text: `**${res.disease_name}** (${res.pathogen_type})\n\n**${t('ai.pesticides_title', 'Recommended Pesticide:')}** ${res.recommended_pesticides?.[0]?.name || 'Commercial Fungicide'} (${res.recommended_pesticides?.[0]?.dosage_per_liter || '2g/L'})\n\n**${t('ai.organic_title', 'Organic Remedy:')}** ${res.organic_treatment}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        image: uploadedImage || undefined,
        diagnosisData: res,
      };
      setMessages((prev) => [...prev, diagMsg]);

      // Speak diagnosis
      speakText(`${res.disease_name}. ${res.organic_treatment}`, diagMsg.id);
    } catch (err: any) {
      setPhotoError(err.message || 'Diagnosis failed. Please check image or description.');
    } finally {
      setDiagnosing(false);
    }
  };

  // Run Crop Recommendation
  const handleGenerateCropSuggestions = async () => {
    setRecommending(true);
    setRecommendationResult(null);
    try {
      const langParam = `${currentOption.englishName} (${currentOption.nativeName})`;
      const res = await api.recommendCrops({
        location: suggesterLocation,
        soilType: suggesterSoil,
        waterAvailability: suggesterWater,
        language: langParam,
      });
      setRecommendationResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRecommending(false);
    }
  };

  const sampleVoicePrompts = QUICK_VOICE_PROMPTS[currentLanguage] || QUICK_VOICE_PROMPTS.en;

  return (
    <>
      {/* 1. FLOATING ACTION TRIGGER (WHEN CLOSED) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Quick Voice Prompt Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => toggleListening(), 350);
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold shadow-xl border border-stone-700 transition-all hover:scale-105 active:scale-95 group"
            title="Click to Speak to Kisan AI"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Mic className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
            <span>{currentLanguage === 'hi' ? 'बोलकर पूछें' : currentLanguage === 'te' ? 'మాట్లాడండి' : currentLanguage === 'mr' ? 'बोला' : currentLanguage === 'ta' ? 'பேசுங்கள்' : 'Speak to AI'}</span>
          </button>

          {/* Main Bot Button with Warm Farmer Avatar */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-1 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-2xl shadow-emerald-950/40 hover:scale-105 transition-all active:scale-95 group flex items-center"
            title="Open Kisan AI Assistant"
          >
            <div className="w-14 h-14 rounded-full bg-stone-950 flex items-center justify-center p-1 relative overflow-hidden border-2 border-emerald-400/80">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                alt="Kisan AI Avatar"
                className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform"
              />
              <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-950 shadow-xs" />
            </div>
            <div className="hidden lg:flex flex-col text-left pl-2.5 pr-4 py-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> {t('ai.name')}
              </span>
              <span className="text-xs font-bold text-white leading-tight">
                {currentOption.flag} {currentOption.nativeName}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. HUMAN-MADE SIDE-BOT DRAWER (WHEN OPEN) */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[85vh] h-[680px] bg-white rounded-3xl shadow-2xl border border-emerald-300/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header with Human-Made Warm Aesthetic */}
          <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 p-4 text-white shrink-0 relative">
            <div className="flex items-center justify-between">
              {/* Bot Persona Avatar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80"
                    alt="Kisan Sahayak"
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white font-heading">{t('ai.name')}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300 flex items-center gap-1">
                    <span>{t('ai.tagline')}</span>
                  </p>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center gap-1.5">
                {/* Language Switcher Pill */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-emerald-200 border border-white/15 flex items-center gap-1 transition-colors"
                  >
                    <span>{currentOption.flag}</span>
                    <span>{currentOption.nativeName}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {/* Language Menu Dropdown */}
                  {showLangMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-700 p-2 z-50 max-h-60 overflow-y-auto divide-y divide-stone-800 text-xs">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase text-stone-400">
                        {t('nav.select_language')}
                      </div>
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors ${
                            currentLanguage === lang.code ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <div>
                              <div>{lang.nativeName}</div>
                              <div className="text-[10px] text-stone-400">{lang.states}</div>
                            </div>
                          </div>
                          {currentLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Drawer */}
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setSpeakingId(null);
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 mt-3 p-1 rounded-2xl bg-black/30 text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'chat'
                    ? 'bg-emerald-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t('ai.tab_chat')}</span>
              </button>

              <button
                onClick={() => setActiveTab('photo_disease')}
                className={`py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'photo_disease'
                    ? 'bg-emerald-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('ai.tab_photo')}</span>
              </button>

              <button
                onClick={() => setActiveTab('crop_suggester')}
                className={`py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'crop_suggester'
                    ? 'bg-emerald-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>{t('ai.tab_suggester')}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: CHAT & VOICE INTERACTION */}
          {/* ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#FBFDF9]">
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isSpeaking = speakingId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[92%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-[10px] font-bold shadow-xs">
                          🌾
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl space-y-2 leading-relaxed ${
                          isUser
                            ? 'bg-stone-900 text-white rounded-tr-xs'
                            : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded plant"
                            className="w-full max-h-36 rounded-xl object-cover border border-stone-200"
                          />
                        )}
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* Read Aloud in Switched Language */}
                        {!isUser && (
                          <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                            <button
                              onClick={() => speakText(msg.text, msg.id)}
                              className={`flex items-center gap-1 font-bold transition-colors ${
                                isSpeaking ? 'text-amber-600 animate-pulse font-extrabold' : 'text-emerald-700 hover:text-emerald-900'
                              }`}
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{t('ai.stop_speaking', 'Stop Audio')}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{t('ai.speak_answer', 'Read Aloud')} ({currentOption.nativeName})</span>
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
                  <div className="flex gap-2 items-center text-xs text-stone-500 bg-white p-3 rounded-2xl w-fit border border-stone-200 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200" />
                    <span className="ml-1 text-[11px] font-medium">Kisan AI is answering in {currentOption.nativeName}...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Mic Notice / Permission Banner */}
              {micNotice && (
                <div className="px-3.5 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
                  <span className="truncate pr-2">{micNotice}</span>
                  <button onClick={() => setMicNotice(null)} className="text-amber-900 font-bold">✕</button>
                </div>
              )}

              {/* Live Voice Recording Status Banner with Audio Animation */}
              {isListening && (
                <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700 animate-pulse">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                    <span>🎙️ {t('ai.voice_listening')} ({currentOption.nativeName})...</span>
                  </div>
                  <button
                    onClick={toggleListening}
                    className="text-[11px] font-extrabold bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg"
                  >
                    Done Speaking
                  </button>
                </div>
              )}

              {/* Chat Input Bar & 1-Click Native Voice Prompts */}
              <div className="p-3 bg-white border-t border-stone-200 shrink-0 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(input);
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Microphone Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-2xl transition-all ${
                      isListening
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                    title={isListening ? t('ai.voice_stop') : t('ai.voice_start')}
                  >
                    {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      currentLanguage === 'hi'
                        ? 'यहाँ सवाल लिखें या माइक दबाकर बोलें...'
                        : currentLanguage === 'te'
                        ? 'పంట సందేహం ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...'
                        : currentLanguage === 'mr'
                        ? 'येथे प्रश्न विचारा किंवा माईक दाबून बोला...'
                        : currentLanguage === 'ta'
                        ? 'கேள்வியை எழுதவும் அல்லது பேசவும்...'
                        : 'Type your farming question or speak...'
                    }
                    className="flex-1 py-2.5 px-3.5 text-xs rounded-2xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-200"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick 1-Click Native Voice Test Prompts */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-0.5 scrollbar-none">
                  <span className="text-stone-400 font-bold shrink-0">🎙️ {currentOption.nativeName}:</span>
                  {sampleVoicePrompts.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => handleSendMessage(promptText)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 whitespace-nowrap transition-colors font-medium border border-emerald-200/60"
                      title="Click to ask this question"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PHOTO PLANT DISEASE DETECTOR WITH CAMERA / UPLOAD */}
          {/* ========================================================================= */}
          {activeTab === 'photo_disease' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FBFDF9]">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" /> {t('ai.upload_photo')}
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Take a photo of diseased leaves or stems. Kisan AI detects the pathogen in {currentOption.nativeName} and prescribes approved chemical pesticides with exact dosage.
                </p>
              </div>

              {photoError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {photoError}
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  uploadedImage
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-stone-300 hover:border-emerald-500 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {uploadedImage ? (
                  <div className="relative w-full">
                    <img
                      src={uploadedImage}
                      alt="Uploaded plant leaf"
                      className="w-full max-h-48 rounded-xl object-cover shadow-xs border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                        setDiagnosisResult(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="mt-2 text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Loaded. Click below to inspect.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 text-xs">{t('ai.drag_photo')}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">Supports Camera / Gallery Photos</div>
                    </div>
                  </>
                )}
              </div>

              {/* 1-Click Sample Infected Leaf Photos */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-600">{t('ai.sample_photos')}</span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_LEAF_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUploadedImage(sample.image);
                        setSelectedCrop(sample.crop);
                        setManualSymptoms(sample.symptoms);
                      }}
                      className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 text-left flex items-center gap-2 group transition-all"
                    >
                      <img
                        src={sample.image}
                        alt={sample.title}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-100 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-stone-900 text-[11px] truncate group-hover:text-emerald-700">
                          {sample.title}
                        </div>
                        <div className="text-[9px] text-stone-400">{sample.crop}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('ai.crop_label')}</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 text-xs"
                  >
                    <option value="Tomato">Tomato (टमाटर / టమోటా)</option>
                    <option value="Onion">Onion (प्याज़ / ఉల్లిపాయ)</option>
                    <option value="Chilli">Chilli (मिर्च / మిరపకాయ)</option>
                    <option value="Wheat">Wheat (गेहूँ / గోధుమలు)</option>
                    <option value="Potato">Potato (आलू / బంగాళాదుంప)</option>
                    <option value="Apple">Apple (सेब / ఆపిల్)</option>
                    <option value="Rice">Paddy Rice (धान / వరి)</option>
                    <option value="Cotton">Cotton (कपास / పత్తి)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('ai.symptoms_label')}</label>
                  <input
                    type="text"
                    value={manualSymptoms}
                    onChange={(e) => setManualSymptoms(e.target.value)}
                    placeholder="e.g. Curling, target rings, yellowing..."
                    className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* Diagnose Action Button */}
              <button
                type="button"
                onClick={handleDiagnosePhoto}
                disabled={diagnosing || (!uploadedImage && !manualSymptoms.trim())}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{diagnosing ? 'Analyzing Plant Pathology & Pesticides...' : t('ai.analyze_btn')}</span>
              </button>

              {/* Diagnostic Result */}
              {diagnosisResult && (
                <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-md space-y-3 animate-in fade-in">
                  <div className="flex items-start justify-between pb-2 border-b border-stone-100">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-800 uppercase">
                        {diagnosisResult.pathogen_type}
                      </span>
                      <h4 className="text-sm font-extrabold text-stone-900 mt-1">{diagnosisResult.disease_name}</h4>
                      <p className="text-[10px] text-stone-500 italic">{diagnosisResult.scientific_name}</p>
                    </div>
                    <button
                      onClick={() =>
                        speakText(
                          `${diagnosisResult.disease_name}. ${diagnosisResult.organic_treatment}. ${diagnosisResult.recommended_pesticides?.[0]?.name}`,
                          'diag-res'
                        )
                      }
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold flex items-center gap-1 text-[11px]"
                      title="Listen Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t('ai.speak_answer')}</span>
                    </button>
                  </div>

                  {/* Prescribed Pesticides */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-red-800 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> {t('ai.pesticides_title')}
                    </span>
                    <div className="space-y-2">
                      {diagnosisResult.recommended_pesticides?.map((p: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-red-50/60 border border-red-200 text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <strong className="text-stone-900">{p.name}</strong>
                            <span className="text-[10px] text-red-700 font-medium">{p.type}</span>
                          </div>
                          <div className="text-stone-600 text-[10px] font-mono">{p.chemical_name}</div>
                          <div className="flex justify-between text-[10px] pt-1 text-stone-700">
                            <span>Dosage: <strong className="text-red-900">{p.dosage_per_liter}</strong></span>
                            <span>Waiting: <strong>{p.waiting_period_days} Days</strong></span>
                          </div>
                          <div className="text-[10px] text-stone-500 italic">{p.application_frequency}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organic Treatment */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] space-y-1">
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" /> {t('ai.organic_title')}
                    </span>
                    <p className="text-stone-700 leading-relaxed text-[11px]">{diagnosisResult.organic_treatment}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SMART CROP FARMING SUGGESTER */}
          {/* ========================================================================= */}
          {activeTab === 'crop_suggester' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FBFDF9]">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" /> {t('ai.tab_suggester')}
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Tailored crop recommendations correlating live Open-Meteo climate data with your farm's soil mechanics and water availability in {currentOption.nativeName}.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('ai.location_label')}</label>
                  <input
                    type="text"
                    value={suggesterLocation}
                    onChange={(e) => setSuggesterLocation(e.target.value)}
                    placeholder="e.g. Guntur, Nashik, Ludhiana..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('ai.soil_label')}</label>
                  <select
                    value={suggesterSoil}
                    onChange={(e) => setSuggesterSoil(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                  >
                    <option value="Alluvial Soil (Well-drained loam)">Alluvial Soil (जलोढ़ मिट्टी / ఒండ్రు నేల)</option>
                    <option value="Black Soil / Regur">Black Soil / Regur (काली कपासी मिट्टी / నల్లరేగడి)</option>
                    <option value="Red & Yellow Soil">Red & Yellow Soil (लाल मिट्टी / ఎర్ర నేల)</option>
                    <option value="Sandy Loam">Sandy Loam (बलुई दोमट / ఇసుక నేల)</option>
                    <option value="Mountain / Forest Soil">Mountain Soil (पहाड़ी मिट्टी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('ai.water_label')}</label>
                  <select
                    value={suggesterWater}
                    onChange={(e) => setSuggesterWater(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                  >
                    <option value="High (Perennial Canal / Deep Borewell)">High (नहर / బోరు బావి)</option>
                    <option value="Medium (Sprinkler / Drip)">Medium (ड्रिप / తుంపర సేద్యం)</option>
                    <option value="Low / Rainfed">Low / Rainfed (वर्षा आधारित / వర్షాధార పంట)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCropSuggestions}
                  disabled={recommending}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{recommending ? 'Analyzing Microclimate & Soil...' : t('ai.generate_crops_btn')}</span>
                </button>
              </div>

              {/* Recommendation Results */}
              {recommendationResult && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white border border-stone-200 text-[11px] space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-emerald-600" /> Live Weather Used for {recommendationResult.location}:
                    </div>
                    <div className="text-stone-600">
                      Temp: <strong>{recommendationResult.live_weather?.temperature}°C</strong> | Humidity:{' '}
                      <strong>{recommendationResult.live_weather?.humidity}%</strong> | Condition:{' '}
                      <strong>{recommendationResult.live_weather?.weather_condition}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {recommendationResult.recommended_crops?.map((c: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-stone-900 text-sm">{c.crop_name}</strong>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {c.suitability_score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">{c.why_recommended}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-stone-700 border-t border-stone-100">
                          <div>Est Yield: <strong>{c.expected_yield_per_acre}</strong></div>
                          <div>Mandi Price: <strong className="text-emerald-700">{c.mandi_price_projection}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
