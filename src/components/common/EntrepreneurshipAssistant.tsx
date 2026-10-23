/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  ExternalLink, 
  AlertCircle, 
  Bot, 
  User as UserIcon, 
  Mic, 
  MicOff, 
  Compass, 
  Calculator, 
  Building2, 
  HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { ChatMessage, ChatRequest } from '../../types/index.js';

interface EntrepreneurshipAssistantProps {
  currentTab?: string;
  opportunityId?: string;
  onNavigate?: (tab: string, param?: string) => void;
}

export const EntrepreneurshipAssistant: React.FC<EntrepreneurshipAssistantProps> = ({
  currentTab = 'landing',
  opportunityId,
  onNavigate
}) => {
  const { language, t } = useLanguage();
  const { profile } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  // In-memory chat messages (privacy-first: strictly not persisted by default)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const initialGreeting: ChatMessage = {
    id: 'initial-greeting',
    role: 'model',
    content: t('assistantEmptyGreeting'),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: [
      { name: 'MoFPI PMFME Portal', url: 'https://pmfme.mofpi.gov.in' },
      { name: 'KVIC PMEGP Portal', url: 'https://www.kviconline.gov.in/pmegpeportal' },
      { name: 'Telangana TS-iPASS', url: 'https://ipass.telangana.gov.in' },
      { name: 'DIC Warangal (Subedari)', url: 'https://industries.telangana.gov.in' }
    ]
  };

  // Initialize greeting on first load or when language changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialGreeting]);
    }
  }, [language]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Keyboard shortcut: close with Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(language === 'te' 
        ? 'మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్‌ను సపోర్ట్ చేయదు.' 
        : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition start failed', err);
        setIsListening(false);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build safe conversation history (max 8 messages for context)
      const chatPayloadMessages = updatedMessages
        .filter(m => m.id !== 'initial-greeting')
        .slice(-8)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      // If this is the first real message, ensure at least this message is passed
      if (chatPayloadMessages.length === 0) {
        chatPayloadMessages.push({ role: 'user', content: queryText });
      }

      // Safe user context strictly stripped of tokens, passwords, or private IDs
      const sanitizedProfile = profile ? {
        mandal: profile.mandal,
        startingBudget: profile.startingBudget,
        businessInterests: profile.businessInterests,
        skills: profile.skills,
        resources: profile.resources,
        businessGoals: profile.businessGoals
      } : undefined;

      const request: ChatRequest = {
        messages: chatPayloadMessages,
        language,
        context: {
          currentTab,
          opportunityId,
          profile: sanitizedProfile
        }
      };

      const response = await api.chatWithAssistant(request);

      const assistantMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('RuralRise Assistant Error:', err);
      const isApiKeyMissing = err.message?.includes('GEMINI_API_KEY');
      setError(
        isApiKeyMissing
          ? t('assistantAiMissing')
          : (err.message || 'Unable to connect to RuralRise Assistant. Please retry.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...initialGreeting,
        id: `greeting-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
    setInput('');
  };

  const quickPrompts = [
    { label: t('assistantPrompt1'), query: language === 'te' ? 'వరంగల్ జిల్లాలో ₹1 లక్ష బడ్జెట్‌తో ప్రారంభించగల లాభదాయక సూక్ష్మ పరిశ్రమలు ఏమిటి?' : 'What are profitable micro-enterprises in Warangal under ₹1 Lakh budget?' },
    { label: t('assistantPrompt2'), query: language === 'te' ? 'వరంగల్ జిల్లాలో మిర్చి ప్రాసెసింగ్ యూనిట్‌కు PMFME 35% సబ్సిడీ మరియు PMEGP ఎలా వర్తిస్తాయి?' : 'How does the PMFME 35% ODOP subsidy and PMEGP work for Chilli processing in Warangal?' },
    { label: t('assistantPrompt3'), query: language === 'te' ? 'గ్రామీణ వ్యాపారానికి 3 నెలల వర్కింగ్ క్యాపిటల్ బఫర్‌ను ఎలా లెక్కించాలి? ఫైనాన్షియల్ క్యాలిక్యులేటర్ ఎలా సహాయపడుతుంది?' : 'How do I calculate a 3-month working capital buffer for a rural enterprise, and how can the Financial Calculator help?' },
    { label: t('assistantPrompt4'), query: language === 'te' ? 'వరంగల్ సుబేదారిలోని జిల్లా పరిశ్రమల కేంద్రం (DIC) ఇచ్చే సహాయాలు మరియు లైసెన్సుల వివరాలు ఏమిటి?' : 'What assistance does DIC Warangal at Subedari provide and how do I register?' }
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 200);
          }}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/40 ring-4 ring-emerald-600/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
          aria-label={t('assistantOpenButton')}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-800" />
          </div>
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">
            {t('assistantOpenButton')}
          </span>
          <span className="text-xs bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
            AI
          </span>
        </button>
      )}

      {/* Floating Responsive Chat Panel */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label={t('assistantTitle')}
          className="fixed inset-x-3 bottom-3 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[620px] sm:max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-emerald-200/80 flex flex-col z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#113322] via-[#1B4D35] to-[#124028] text-white p-3.5 px-4 flex items-center justify-between shadow-md shrink-0 border-b border-emerald-600/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight truncate text-white">
                    {t('assistantTitle')}
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded font-semibold">
                    {language.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 truncate">
                  {t('assistantTagline')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors focus:outline-none"
                title={t('assistantClear')}
                aria-label={t('assistantClear')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors focus:outline-none"
                title={t('assistantClose')}
                aria-label={t('assistantClose')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-900 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block shrink-0" />
              <span className="font-medium truncate">
                {currentTab === 'explore' && (language === 'te' ? 'అవకాశాల పేజీ పరిశీలన' : 'Viewing Opportunity Explorer')}
                {currentTab === 'calculator' && (language === 'te' ? 'సాధ్యత క్యాలిక్యులేటర్ మోడ్' : 'Viewing Feasibility Calculator')}
                {currentTab === 'plan' && (language === 'te' ? 'లాంచ్ నావిగేటర్ & ప్లాన్ మోడ్' : 'Viewing Business Plan Navigator')}
                {currentTab === 'market' && (language === 'te' ? 'వరంగల్ మార్కెట్ సమాచారం' : 'Viewing Market Intelligence')}
                {currentTab === 'schemes' && (language === 'te' ? 'ప్రభుత్వ పథకాల పేజీ' : 'Viewing Government Schemes')}
                {(!['explore', 'calculator', 'plan', 'market', 'schemes'].includes(currentTab)) && (
                  language === 'te' ? 'వరంగల్ పైలట్ మార్గదర్శి' : 'Warangal Pilot Intelligence'
                )}
              </span>
            </div>
            {onNavigate && (
              <div className="flex items-center gap-2 shrink-0 text-emerald-700 font-semibold">
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  <span className="hidden sm:inline">Calc</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Schemes</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F5]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-500">
                  {m.role === 'user' ? (
                    <>
                      <span>{m.timestamp}</span>
                      <span className="font-semibold text-emerald-800">You</span>
                      <UserIcon className="w-3 h-3 text-emerald-700" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-emerald-700" />
                      <span className="font-semibold text-emerald-900">RuralRise AI</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </>
                  )}
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[92%] sm:max-w-[88%] shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-tr-xs'
                      : 'bg-white text-gray-800 border border-emerald-100/90 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content}
                  </div>

                  {/* Verified Sources if provided */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-100 text-[11px] text-emerald-950">
                      <div className="font-semibold text-emerald-800 mb-1.5 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-emerald-600" />
                        {t('assistantSourcesTitle')}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 transition-colors"
                          >
                            <span>{src.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-500">
                  <Bot className="w-3 h-3 text-emerald-700" />
                  <span className="font-semibold text-emerald-900">RuralRise AI</span>
                </div>
                <div className="bg-white text-emerald-900 border border-emerald-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-2.5 text-xs">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium text-emerald-800">
                    {t('assistantSending')}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex flex-col gap-2 shadow-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                      if (lastUserMsg) {
                        handleSend(lastUserMsg.content);
                      }
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t('assistantRetry')}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Prompts when only initial greeting exists */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider mb-2 px-1">
                  {language === 'te' ? 'త్వరిత ప్రశ్నలు:' : 'Suggested Questions:'}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      className="text-left text-xs bg-white hover:bg-emerald-50 border border-emerald-200/90 hover:border-emerald-400 p-2.5 rounded-xl text-emerald-950 transition-all duration-150 shadow-xs flex items-center justify-between group"
                    >
                      <span className="line-clamp-2">{p.label}</span>
                      <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform text-sm font-bold ml-2">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Controls Area */}
          <div className="p-3 bg-white border-t border-emerald-100 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t('assistantPlaceholder')}
                  disabled={isLoading}
                  maxLength={2000}
                  rows={2}
                  className="w-full resize-none p-2.5 pr-8 text-xs sm:text-sm border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 bg-gray-50/50 text-gray-800 disabled:opacity-60"
                  aria-label={t('assistantPlaceholder')}
                />
                <div className="absolute right-2 bottom-2 text-[10px] text-gray-400 font-mono">
                  {input.length > 0 && `${input.length}/2000`}
                </div>
              </div>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
                title={isListening ? t('assistantStopVoice') : t('assistantVoiceInput')}
                aria-label={isListening ? t('assistantStopVoice') : t('assistantVoiceInput')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                aria-label={t('assistantSend')}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Grounding & Verification Disclaimer */}
            <p className="text-[10px] leading-tight text-gray-500 text-center px-1">
              {t('assistantDisclaimer')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
