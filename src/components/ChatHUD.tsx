import React, { useRef, useEffect } from 'react';
import { ChatMessage, LanguageMode, AssistantState } from '../types';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Bot,
  User,
  Search,
} from 'lucide-react';
import { soundFx, triggerHaptic } from '../utils/audioSynthesizer';

interface ChatHUDProps {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (val: string) => void;
  onSendMessage: (text?: string) => void;
  onToggleVoice: () => void;
  assistantState: AssistantState;
  enableWebSearch: boolean;
  setEnableWebSearch: (val: boolean) => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  onSpeakMessage: (msg: ChatMessage) => void;
  onStopSpeaking: () => void;
  activePlayingId: string | null;
  onQuickPrompt: (prompt: string) => void;
}

export const ChatHUD: React.FC<ChatHUDProps> = ({
  messages,
  inputText,
  setInputText,
  onSendMessage,
  onToggleVoice,
  assistantState,
  enableWebSearch,
  setEnableWebSearch,
  language,
  setLanguage,
  onSpeakMessage,
  onStopSpeaking,
  activePlayingId,
  onQuickPrompt,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, assistantState]);

  const handleCopy = (id: string, text: string) => {
    soundFx.playTactileClick();
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '🌐 Latest Tech News', prompt: 'What are the top tech and space breakthroughs this week?' },
    { label: '🇮🇳 हिंदी में जार्विस परिचय', prompt: 'रुद्राक्ष जार्विस, अपना परिचय और अपनी मुख्य क्षमताएं हिंदी में बताएं।' },
    { label: '⚡ Energy Arc Output', prompt: 'Calculate the theoretical energy output of an Arc Reactor generating 3 gigajoules per second.' },
    { label: '🧠 Explain Quantum AI', prompt: 'Explain quantum computing and its synergy with artificial intelligence in simple terms.' },
  ];

  const isListening = assistantState === 'listening';
  const isThinking = assistantState === 'thinking';

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto hud-panel rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-cyan-950/40 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="font-orbitron font-semibold text-xs sm:text-sm tracking-wider text-cyan-200">
            TACTICAL AI FEED
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-tech bg-cyan-900/50 text-cyan-300 border border-cyan-500/30">
            MARK LXXXV SECURE CHANNEL
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => {
              soundFx.playTactileClick();
              triggerHaptic('light');
              setEnableWebSearch(!enableWebSearch);
            }}
            title={enableWebSearch ? 'Google Search Grounding Active' : 'Web Search Disabled'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-tech transition-all ${
              enableWebSearch
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-gray-800/60 border border-gray-700 text-gray-400 hover:text-gray-300'
            }`}
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span className="hidden xs:inline">Search:</span>
            <span>{enableWebSearch ? 'ON' : 'OFF'}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center rounded bg-cyan-950/80 border border-cyan-500/30 p-0.5 text-[11px] font-tech">
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setLanguage('en');
              }}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'en'
                  ? 'bg-cyan-500 text-gray-950 font-bold'
                  : 'text-cyan-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setLanguage('hi');
              }}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'hi'
                  ? 'bg-cyan-500 text-gray-950 font-bold'
                  : 'text-cyan-300 hover:text-white'
              }`}
            >
              HI
            </button>
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setLanguage('hinglish');
              }}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'hinglish'
                  ? 'bg-cyan-500 text-gray-950 font-bold'
                  : 'text-cyan-300 hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>

      {/* Message history */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 text-sm font-rajdhani cyber-grid"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-80">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base text-cyan-100 tracking-wide">
                RUDRAKSH JARVIS AI ONLINE
              </h3>
              <p className="text-xs text-cyan-400/80 font-tech mt-1 max-w-sm">
                Mark LXXXV Systems Operational. Awaiting your voice or textual commands in English or Hindi, Sir.
              </p>
            </div>

            {/* Quick action chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playTactileClick();
                    triggerHaptic('light');
                    onQuickPrompt(item.prompt);
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/20 hover:border-cyan-400/50 text-xs text-cyan-200 transition-all group"
                >
                  <span className="font-semibold text-cyan-300 group-hover:text-cyan-100 flex items-center gap-1.5">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isPlaying = activePlayingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/60 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-3 sm:p-4 text-sm backdrop-blur-md relative ${
                    isUser
                      ? 'bg-cyan-900/40 border border-cyan-400/40 text-cyan-100 rounded-br-none'
                      : 'bg-gray-900/85 border border-cyan-500/30 text-cyan-50 rounded-bl-none shadow-[0_0_15px_rgba(0,240,255,0.06)]'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] font-tech text-cyan-400/70 border-b border-cyan-500/15 pb-1">
                    <span className="font-semibold tracking-wider uppercase text-cyan-300">
                      {isUser ? 'USER / COMMAND' : 'RUDRAKSH JARVIS'}
                    </span>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-rajdhani">
                    {msg.text}
                  </div>

                  {/* Grounding Sources (Google Search) */}
                  {msg.groundingMetadata?.webSearchQueries &&
                    msg.groundingMetadata.webSearchQueries.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-cyan-500/20 text-xs">
                        <div className="flex items-center gap-1 text-[11px] font-tech text-cyan-400 mb-1">
                          <Search className="w-3 h-3 text-cyan-400" />
                          <span>Grounded Web Queries:</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {msg.groundingMetadata.webSearchQueries.map((q, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-[10px] font-tech text-cyan-300"
                            >
                              "{q}"
                            </span>
                          ))}
                        </div>

                        {/* Grounding Web Links */}
                        {msg.groundingMetadata.groundingChunks &&
                          msg.groundingMetadata.groundingChunks.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-tech text-cyan-400/80">
                                Verified Sources:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.groundingMetadata.groundingChunks
                                  .filter((c) => c.web?.uri)
                                  .slice(0, 3)
                                  .map((chunk, cIdx) => (
                                    <a
                                      key={cIdx}
                                      href={chunk.web?.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-500/40 text-[10px] font-tech text-cyan-200 transition-colors"
                                    >
                                      <span className="truncate max-w-[140px]">
                                        {chunk.web?.title || 'Web Reference'}
                                      </span>
                                      <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                                    </a>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                  {/* Action icons (Speak / Copy) */}
                  {!isUser && (
                    <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 border-t border-cyan-500/10">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            onStopSpeaking();
                          } else {
                            onSpeakMessage(msg);
                          }
                        }}
                        className={`p-1 rounded hover:bg-cyan-950/60 text-xs transition-colors flex items-center gap-1 ${
                          isPlaying
                            ? 'text-cyan-300 bg-cyan-500/20'
                            : 'text-cyan-400/80 hover:text-cyan-200'
                        }`}
                        title={isPlaying ? 'Stop Voice' : 'Vocalize via JARVIS TTS'}
                      >
                        {isPlaying ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] font-tech">STOP</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-tech">SPEAK</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-cyan-950/60 text-cyan-400/80 hover:text-cyan-200 text-xs transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-400/60 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <User className="w-4 h-4 text-blue-300" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/60 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              <Bot className="w-4 h-4 text-cyan-300 animate-spin" />
            </div>
            <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-tech text-cyan-200">
                Rudraksh JARVIS synthesizing tactical response...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input controls */}
      <div className="p-3 bg-cyan-950/40 border-t border-cyan-500/20 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center relative cursor-pointer ${
              isListening
                ? 'bg-red-500/30 border-red-400 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-cyan-950/80 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/60'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice command'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-red-300" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Text Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening for speech command...'
                  : language === 'hi'
                  ? 'रुद्राक्ष जार्विस से कुछ भी पूछें...'
                  : 'Ask Rudraksh JARVIS or issue command, Sir...'
              }
              className="w-full bg-gray-950/80 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm sm:text-base text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-rajdhani transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer ${
              inputText.trim() && !isThinking
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed'
            }`}
            title="Transmit command"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
