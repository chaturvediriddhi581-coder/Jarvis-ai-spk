/**
 * Rudraksh JARVIS AI - Mark LXXXV Virtual Assistant
 * Inspired by Tony Stark's J.A.R.V.I.S.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  LanguageMode,
  AssistantState,
  SystemProtocol,
  ReminderItem,
  NoteItem,
  MemoryFact,
  UserPreferences,
  SystemTelemetry,
} from './types';
import { ArcReactorCore } from './components/ArcReactorCore';
import { AudioWaveform } from './components/AudioWaveform';
import { ChatHUD } from './components/ChatHUD';
import { DailyAssistantHUD } from './components/DailyAssistantHUD';
import { SystemDiagnosticsHUD } from './components/SystemDiagnosticsHUD';
import { SafetyConfirmModal } from './components/SafetyConfirmModal';
import { soundFx, triggerHaptic } from './utils/audioSynthesizer';
import { speechManager, SpeechStatus } from './utils/speechManager';
import {
  MessageSquare,
  Activity,
  Calendar,
  Shield,
  Volume2,
  VolumeX,
  Mic,
  Radio,
  Sparkles,
  Zap,
  Globe,
  Sliders,
} from 'lucide-react';

export default function App() {
  // Navigation View: 'core' | 'chat' | 'assistant' | 'diagnostics'
  const [currentView, setCurrentView] = useState<'core' | 'chat' | 'assistant' | 'diagnostics'>('core');

  // Assistant State: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [liveSubtitles, setLiveSubtitles] = useState<string>('');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('jarvis_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'init_welcome',
        role: 'model',
        text: 'Greetings, Sir. Rudraksh JARVIS online and all Mark LXXXV subroutines are fully calibrated. How may I be of service today?',
        timestamp: '00:01 SECURE',
        language: 'en',
      },
    ];
  });
  const [inputText, setInputText] = useState('');
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  // Protocols & Telemetry
  const [currentProtocol, setCurrentProtocol] = useState<SystemProtocol>('STANDARD');
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    status: 'ONLINE',
    version: 'MARK LXXXV v4.2.0',
    coreTemperature: '42.1°C',
    arcReactorOutput: '100.0%',
    latencyMs: 14,
    uptimeSeconds: 120,
    geminiOnline: true,
  });

  // User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('jarvis_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      userName: 'Sir',
      callSign: 'Mr. Stark',
      language: 'en',
      autoSpeak: true,
      voiceName: 'Fenrir',
      memoryEnabled: true,
      hapticsEnabled: true,
      soundFxEnabled: true,
    };
  });

  // Reminders
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem('jarvis_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'rem_1',
        title: 'Calibrate Arc Reactor Power Cells',
        time: '14:00',
        priority: 'high',
        completed: false,
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'rem_2',
        title: 'Review Nano-Tech Armor Aerodynamics',
        time: '17:30',
        priority: 'medium',
        completed: false,
        createdAt: Date.now() - 1800000,
      },
    ];
  });

  // Notes
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('jarvis_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'note_1',
        title: 'Repulsor Beam Harmonic Frequencies',
        content: 'Maintaining 350 terawatt pulse with 0.02% variance in atmospheric flight.',
        category: 'Tactical',
        createdAt: Date.now() - 86400000,
      },
    ];
  });

  // Memory
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>(() => {
    const saved = localStorage.getItem('jarvis_memory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'mem_1',
        fact: 'Address the user as Sir or Mr. Stark.',
        category: 'Preference',
        dateAdded: new Date().toLocaleDateString(),
      },
      {
        id: 'mem_2',
        fact: 'Fluent in Hindi, English, and Hinglish dialogue modes.',
        category: 'Directive',
        dateAdded: new Date().toLocaleDateString(),
      },
    ];
  });

  // Safety Modal
  const [safetyModal, setSafetyModal] = useState<{
    isOpen: boolean;
    actionTitle: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    actionTitle: '',
    onConfirm: () => {},
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('jarvis_messages', JSON.stringify(messages.slice(-30)));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('jarvis_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('jarvis_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('jarvis_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('jarvis_memory', JSON.stringify(memoryFacts));
  }, [memoryFacts]);

  // Initial chime & fetch telemetry
  useEffect(() => {
    soundFx.setSoundEnabled(preferences.soundFxEnabled);

    // Fetch system telemetry
    fetch('/api/system-status')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTelemetry((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Request Safety Confirmation wrapper
  const requestSafetyConfirm = (actionTitle: string, onConfirm: () => void) => {
    setSafetyModal({
      isOpen: true,
      actionTitle,
      onConfirm: () => {
        setSafetyModal((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      },
    });
  };

  // Send message to backend Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || assistantState === 'thinking') return;

    soundFx.playTactileClick();
    triggerHaptic('light');

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: preferences.language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setVoiceTranscript('');
    setAssistantState('thinking');
    setLiveSubtitles(query);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          language: preferences.language,
          userName: preferences.callSign || preferences.userName,
          userMemory: preferences.memoryEnabled ? memoryFacts : [],
          enableWebSearch,
          currentProtocol,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error communicating with JARVIS core');
      }

      const data = await response.json();
      const replyText = data.reply || 'Protocol execution completed, Sir.';

      const jarvisMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: preferences.language,
        groundingMetadata: data.groundingMetadata,
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      setLiveSubtitles(replyText);

      // Speak response if autoSpeak is enabled
      if (preferences.autoSpeak && currentProtocol !== 'STEALTH') {
        speakAssistantMessage(jarvisMsg);
      } else {
        setAssistantState('idle');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        text: `Diagnostic Alert, Sir: ${err.message || 'Subroutine disrupted. Please verify network or key.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAssistantState('idle');
    }
  };

  // Vocalize assistant message
  const speakAssistantMessage = (msg: ChatMessage) => {
    setActivePlayingId(msg.id);
    setAssistantState('speaking');

    speechManager.speakText(
      msg.text,
      preferences.language,
      preferences.voiceName,
      () => {
        setAssistantState('speaking');
        setActivePlayingId(msg.id);
      },
      () => {
        setAssistantState('idle');
        setActivePlayingId(null);
      }
    );
  };

  const stopSpeaking = () => {
    soundFx.playTactileClick();
    speechManager.stopSpeaking();
    setAssistantState('idle');
    setActivePlayingId(null);
  };

  // Toggle voice listening (Wake button or Mic button)
  const handleToggleVoice = () => {
    if (assistantState === 'listening') {
      speechManager.stopListening();
      setAssistantState('idle');
      return;
    }

    if (assistantState === 'speaking') {
      stopSpeaking();
    }

    soundFx.playWakePing();
    triggerHaptic('medium');

    setVoiceTranscript('');
    setAssistantState('listening');

    speechManager.startListening(
      preferences.language,
      (transcript) => {
        setVoiceTranscript(transcript);
        setInputText(transcript);
        // Automatically send when finalized
        handleSendMessage(transcript);
      },
      (err) => {
        console.warn('Voice recognition note:', err);
        setAssistantState('idle');
      },
      (status: SpeechStatus) => {
        if (status === 'listening') {
          setAssistantState('listening');
        } else if (status === 'inactive') {
          setAssistantState((prev) => (prev === 'listening' ? 'idle' : prev));
        }
      }
    );
  };

  // Daily Briefing generator
  const handleRequestBriefing = async () => {
    setAssistantState('thinking');
    soundFx.playJarvisChime();

    try {
      const response = await fetch('/api/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: preferences.callSign || preferences.userName,
          language: preferences.language,
          remindersCount: reminders.filter((r) => !r.completed).length,
          notesCount: notes.length,
        }),
      });

      if (!response.ok) throw new Error('Briefing request failed');

      const data = await response.json();
      const briefingText = data.briefing || 'Daily status report prepared, Sir.';

      const briefingMsg: ChatMessage = {
        id: 'briefing_' + Date.now(),
        role: 'model',
        text: briefingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: preferences.language,
      };

      setMessages((prev) => [...prev, briefingMsg]);
      setCurrentView('chat');
      setLiveSubtitles(briefingText);

      if (preferences.autoSpeak && currentProtocol !== 'STEALTH') {
        speakAssistantMessage(briefingMsg);
      } else {
        setAssistantState('idle');
      }
    } catch {
      handleSendMessage('Give me a full morning briefing and system status report.');
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between text-cyan-50 relative selection:bg-cyan-500/30 selection:text-cyan-100 ${
        currentProtocol === 'STEALTH'
          ? 'bg-[#020408]'
          : currentProtocol === 'HOUSE_PARTY'
          ? 'bg-[#04081c]'
          : 'bg-[#030712]'
      }`}
    >
      {/* Background HUD scanline & cybernetic mesh */}
      <div className="fixed inset-0 hud-scanline pointer-events-none z-40" />

      {/* TOP HEADER HUD */}
      <header className="sticky top-0 z-30 w-full hud-panel border-b border-cyan-500/30 px-3 sm:px-6 py-2.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Call Sign */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              onClick={() => {
                soundFx.playJarvisChime();
                setCurrentView('core');
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-cyan-400 bg-cyan-950/80 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] group hover:scale-105 transition-transform"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 group-hover:rotate-45 transition-transform" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-orbitron font-extrabold text-sm sm:text-base tracking-widest text-cyan-100 neon-text-glow">
                  RUDRAKSH <span className="text-cyan-400">JARVIS</span>
                </h1>
                <span className="hidden xs:inline-block px-1.5 py-0.2 rounded text-[9px] font-tech bg-cyan-950 border border-cyan-400/50 text-cyan-300">
                  AI v4.2
                </span>
              </div>
              <p className="text-[10px] font-tech text-cyan-400/70 tracking-wider">
                STARK SYSTEMS • PROTOCOL: {currentProtocol}
              </p>
            </div>
          </div>

          {/* Central Mini Audio Waveform (Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <AudioWaveform state={assistantState} barCount={20} />
          </div>

          {/* Header Controls: Language & Audio */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Bilingual Switcher */}
            <div className="flex items-center rounded-lg bg-cyan-950/80 border border-cyan-500/30 p-0.5 text-xs font-tech">
              <button
                onClick={() => {
                  soundFx.playTactileClick();
                  setPreferences((p) => ({ ...p, language: 'en' }));
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  preferences.language === 'en'
                    ? 'bg-cyan-500 text-gray-950 font-bold'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  soundFx.playTactileClick();
                  setPreferences((p) => ({ ...p, language: 'hi' }));
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  preferences.language === 'hi'
                    ? 'bg-cyan-500 text-gray-950 font-bold'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => {
                  soundFx.playTactileClick();
                  setPreferences((p) => ({ ...p, language: 'hinglish' }));
                }}
                className={`hidden xs:inline-block px-2 py-0.5 rounded transition-all cursor-pointer ${
                  preferences.language === 'hinglish'
                    ? 'bg-cyan-500 text-gray-950 font-bold'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                Hinglish
              </button>
            </div>

            {/* Mute / Audio Toggle */}
            <button
              onClick={() => {
                if (assistantState === 'speaking') {
                  stopSpeaking();
                } else {
                  soundFx.playTactileClick();
                  setPreferences((p) => ({ ...p, autoSpeak: !p.autoSpeak }));
                }
              }}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                preferences.autoSpeak && currentProtocol !== 'STEALTH'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-gray-900 border-gray-700 text-gray-400'
              }`}
              title={preferences.autoSpeak ? 'Voice Audio Active' : 'Voice Audio Muted'}
            >
              {preferences.autoSpeak && currentProtocol !== 'STEALTH' ? (
                <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col justify-center items-center relative overflow-hidden">
        {/* VIEW 1: ARC REACTOR HOLOGRAM & VOICE HUB */}
        {currentView === 'core' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-fadeIn my-auto">
            {/* Top Telemetry strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-tech text-cyan-300/80">
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/25 backdrop-blur-md">
                CORE: <strong className="text-cyan-100">{telemetry.coreTemperature}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/25 backdrop-blur-md">
                ARC OUTPUT: <strong className="text-cyan-100">{telemetry.arcReactorOutput}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/25 backdrop-blur-md">
                LANGUAGE:{' '}
                <strong className="text-cyan-100 uppercase">
                  {preferences.language === 'hi' ? 'हिंदी (HINDI)' : preferences.language}
                </strong>
              </span>
            </div>

            {/* Glowing Circular AI Arc Reactor */}
            <div className="relative">
              <ArcReactorCore
                state={assistantState}
                onActivate={handleToggleVoice}
                size="lg"
                showLabel={true}
              />
            </div>

            {/* Prominent Wake Button ("Hey JARVIS") */}
            <div className="flex flex-col items-center space-y-3">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`relative group px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-orbitron font-bold text-sm sm:text-base tracking-widest uppercase transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-3 border ${
                  assistantState === 'listening'
                    ? 'bg-red-500/30 border-red-400 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse'
                    : 'bg-gradient-to-r from-cyan-600/30 via-cyan-500/40 to-blue-600/30 border-cyan-400 text-cyan-100 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] hover:border-cyan-300'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-cyan-300 group-hover:animate-ping" />
                <Mic className="w-5 h-5 text-cyan-200" />
                <span>{assistantState === 'listening' ? 'LISTENING... (TAP TO SEND)' : 'HEY JARVIS'}</span>
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </button>

              <p className="text-xs font-tech text-cyan-400/70 text-center max-w-xs">
                Tap "Hey JARVIS" or tap the Arc Reactor to speak commands in English or Hindi.
              </p>
            </div>

            {/* Live Subtitle / Spoken Feed */}
            {liveSubtitles && (
              <div className="w-full max-w-xl mx-auto p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-center backdrop-blur-md">
                <span className="text-[10px] font-tech text-cyan-400 block mb-1 uppercase tracking-wider">
                  TACTICAL AUDIO TRANSCRIPTION
                </span>
                <p className="text-sm font-rajdhani text-cyan-100 italic line-clamp-3">
                  "{liveSubtitles}"
                </p>
              </div>
            )}

            {/* Sound Waveform Visualization */}
            <div className="w-full max-w-md mx-auto">
              <AudioWaveform state={assistantState} barCount={32} />
            </div>

            {/* Quick Voice Command Triggers */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
              {[
                { label: '🌤️ Weather & News', prompt: 'Jarvis, search the web and provide the current weather and latest top headlines.' },
                { label: '🇮🇳 आज का हाल (Hindi)', prompt: 'रुद्राक्ष जार्विस, आज का दिन कैसा रहेगा और क्या कोई नया अपडेट है?' },
                { label: '⚡ Arc Power Output', prompt: 'Jarvis, calculate 18% of 95,000 gigawatts and explain the calculation.' },
                { label: '🛡️ Defense Status', prompt: 'Initiate Mark LXXXV system scan and report on all tactical subroutines.' },
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSendMessage(cmd.prompt);
                    setCurrentView('chat');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/25 hover:border-cyan-400 text-xs font-tech text-cyan-200 transition-all cursor-pointer"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: TACTICAL CHAT STREAM */}
        {currentView === 'chat' && (
          <div className="w-full h-[calc(100vh-160px)] min-h-[500px] flex flex-col animate-fadeIn">
            <ChatHUD
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleSendMessage}
              onToggleVoice={handleToggleVoice}
              assistantState={assistantState}
              enableWebSearch={enableWebSearch}
              setEnableWebSearch={setEnableWebSearch}
              language={preferences.language}
              setLanguage={(lang) => setPreferences((p) => ({ ...p, language: lang }))}
              onSpeakMessage={speakAssistantMessage}
              onStopSpeaking={stopSpeaking}
              activePlayingId={activePlayingId}
              onQuickPrompt={(prompt) => handleSendMessage(prompt)}
            />
          </div>
        )}

        {/* VIEW 3: DAILY ASSISTANT (Reminders, Notes, Calculator, Memory) */}
        {currentView === 'assistant' && (
          <div className="w-full h-[calc(100vh-160px)] min-h-[500px] flex flex-col animate-fadeIn">
            <DailyAssistantHUD
              reminders={reminders}
              setReminders={setReminders}
              notes={notes}
              setNotes={setNotes}
              memoryFacts={memoryFacts}
              setMemoryFacts={setMemoryFacts}
              preferences={preferences}
              setPreferences={setPreferences}
              onRequestSafetyConfirm={requestSafetyConfirm}
              onSendToJarvis={(prompt) => {
                handleSendMessage(prompt);
                setCurrentView('chat');
              }}
            />
          </div>
        )}

        {/* VIEW 4: SYSTEM DIAGNOSTICS & HARDWARE MATRIX */}
        {currentView === 'diagnostics' && (
          <div className="w-full h-[calc(100vh-160px)] min-h-[500px] flex flex-col animate-fadeIn">
            <SystemDiagnosticsHUD
              telemetry={telemetry}
              currentProtocol={currentProtocol}
              onSelectProtocol={(proto) => {
                setCurrentProtocol(proto);
                if (proto === 'CLEAN_SLATE') {
                  requestSafetyConfirm('Execute Clean Slate Protocol (Wipe chat cache)', () => {
                    setMessages([
                      {
                        id: 'slate_reset',
                        role: 'model',
                        text: 'Clean Slate Protocol successfully executed, Sir. All temporary session memory registers purged.',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ]);
                    setCurrentProtocol('STANDARD');
                  });
                }
              }}
              preferences={preferences}
              setPreferences={setPreferences}
              onRequestBriefing={handleRequestBriefing}
            />
          </div>
        )}
      </main>

      {/* ANDROID & MOBILE DOCK / NAVIGATION BAR */}
      <nav className="sticky bottom-0 z-30 w-full hud-panel border-t border-cyan-500/30 px-3 py-2 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Core Arc Reactor View */}
          <button
            onClick={() => {
              soundFx.playTactileClick();
              triggerHaptic('light');
              setCurrentView('core');
            }}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'core'
                ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_#00f0ff]'
                : 'text-cyan-500/60 hover:text-cyan-300'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                currentView === 'core'
                  ? 'border-cyan-400 bg-cyan-950/80'
                  : 'border-cyan-500/30'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-tech tracking-wider uppercase">CORE</span>
          </button>

          {/* Chat Feed */}
          <button
            onClick={() => {
              soundFx.playTactileClick();
              triggerHaptic('light');
              setCurrentView('chat');
            }}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'chat'
                ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_#00f0ff]'
                : 'text-cyan-500/60 hover:text-cyan-300'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                currentView === 'chat'
                  ? 'border-cyan-400 bg-cyan-950/80'
                  : 'border-cyan-500/30'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-tech tracking-wider uppercase">CHAT</span>
          </button>

          {/* Quick Central Hey JARVIS Mic Button */}
          <button
            onClick={handleToggleVoice}
            className={`relative -top-3 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg ${
              assistantState === 'listening'
                ? 'bg-red-500 border-red-300 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-500 border-cyan-300 text-gray-950 shadow-[0_0_18px_rgba(0,240,255,0.6)] hover:brightness-110'
            }`}
            title="Hey JARVIS Voice Command"
          >
            <Mic className="w-6 h-6" />
            {assistantState === 'listening' && (
              <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
            )}
          </button>

          {/* Daily Assistant */}
          <button
            onClick={() => {
              soundFx.playTactileClick();
              triggerHaptic('light');
              setCurrentView('assistant');
            }}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'assistant'
                ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_#00f0ff]'
                : 'text-cyan-500/60 hover:text-cyan-300'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                currentView === 'assistant'
                  ? 'border-cyan-400 bg-cyan-950/80'
                  : 'border-cyan-500/30'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-tech tracking-wider uppercase">DAILY</span>
          </button>

          {/* Diagnostics */}
          <button
            onClick={() => {
              soundFx.playTactileClick();
              triggerHaptic('light');
              setCurrentView('diagnostics');
            }}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'diagnostics'
                ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_#00f0ff]'
                : 'text-cyan-500/60 hover:text-cyan-300'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                currentView === 'diagnostics'
                  ? 'border-cyan-400 bg-cyan-950/80'
                  : 'border-cyan-500/30'
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-tech tracking-wider uppercase">SYSTEM</span>
          </button>
        </div>
      </nav>

      {/* Safety Authorization Modal */}
      <SafetyConfirmModal
        isOpen={safetyModal.isOpen}
        actionTitle={safetyModal.actionTitle}
        onConfirm={safetyModal.onConfirm}
        onCancel={() => setSafetyModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
