import React, { useState } from 'react';
import { ReminderItem, NoteItem, MemoryFact, UserPreferences } from '../types';
import {
  Bell,
  CheckCircle,
  Clock,
  Trash2,
  Plus,
  FileText,
  Calculator,
  Brain,
  ShieldCheck,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { soundFx, triggerHaptic } from '../utils/audioSynthesizer';

interface DailyAssistantHUDProps {
  reminders: ReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  memoryFacts: MemoryFact[];
  setMemoryFacts: React.Dispatch<React.SetStateAction<MemoryFact[]>>;
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onRequestSafetyConfirm: (actionName: string, onConfirm: () => void) => void;
  onSendToJarvis: (prompt: string) => void;
}

export const DailyAssistantHUD: React.FC<DailyAssistantHUDProps> = ({
  reminders,
  setReminders,
  notes,
  setNotes,
  memoryFacts,
  setMemoryFacts,
  preferences,
  setPreferences,
  onRequestSafetyConfirm,
  onSendToJarvis,
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'notes' | 'calculator' | 'memory'>('reminders');

  // Reminders state
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Notes state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Tactical' | 'General' | 'Work' | 'Personal'>('Tactical');
  const [noteSearch, setNoteSearch] = useState('');

  // Calculator state
  const [calcInput, setCalcInput] = useState('');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // Memory state
  const [newFact, setNewFact] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<'Preference' | 'Personal' | 'Directive' | 'General'>('Preference');

  // Add Reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    soundFx.playTactileClick();
    triggerHaptic('light');

    const item: ReminderItem = {
      id: 'rem_' + Date.now(),
      title: newReminderTitle.trim(),
      time: newReminderTime || 'In 1 hour',
      priority: newReminderPriority,
      completed: false,
      createdAt: Date.now(),
    };

    setReminders((prev) => [item, ...prev]);
    setNewReminderTitle('');
    setNewReminderTime('');
  };

  const toggleReminder = (id: string) => {
    soundFx.playTactileClick();
    triggerHaptic('light');
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const deleteReminder = (id: string) => {
    soundFx.playTactileClick();
    triggerHaptic('light');
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    soundFx.playTactileClick();
    triggerHaptic('light');

    const item: NoteItem = {
      id: 'note_' + Date.now(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      createdAt: Date.now(),
    };

    setNotes((prev) => [item, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDeleteNote = (id: string, title: string) => {
    onRequestSafetyConfirm(`Delete note: "${title}"`, () => {
      soundFx.playTactileClick();
      triggerHaptic('medium');
      setNotes((prev) => prev.filter((n) => n.id !== id));
    });
  };

  const exportNotes = () => {
    soundFx.playTactileClick();
    triggerHaptic('light');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `JARVIS_Tactical_Notes_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculator Functions
  const handleCalcClick = (val: string) => {
    soundFx.playTactileClick();
    triggerHaptic('light');
    if (val === 'C') {
      setCalcInput('');
    } else if (val === '=') {
      try {
        // Safe evaluation of basic math arithmetic
        const sanitized = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        // evaluate mathematical expression safely
        const result = Function(`'use strict'; return (${sanitized})`)();
        const calculationStr = `${calcInput} = ${result}`;
        setCalcHistory((prev) => [calculationStr, ...prev.slice(0, 5)]);
        setCalcInput(String(result));
      } catch {
        setCalcInput('SYNTAX ERROR');
      }
    } else {
      if (calcInput === 'SYNTAX ERROR') {
        setCalcInput(val);
      } else {
        setCalcInput((prev) => prev + val);
      }
    }
  };

  // Add Memory
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    soundFx.playTactileClick();
    triggerHaptic('light');

    const item: MemoryFact = {
      id: 'mem_' + Date.now(),
      fact: newFact.trim(),
      category: newFactCategory,
      dateAdded: new Date().toLocaleDateString(),
    };

    setMemoryFacts((prev) => [item, ...prev]);
    setNewFact('');
  };

  const handleWipeMemory = () => {
    onRequestSafetyConfirm('Wipe all long-term AI memory records', () => {
      soundFx.playAlertAlarm();
      triggerHaptic('alert');
      setMemoryFacts([]);
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto hud-panel rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-cyan-950/50 border-b border-cyan-500/20 backdrop-blur-md overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('reminders');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech transition-all cursor-pointer ${
              activeTab === 'reminders'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-900/30'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>REMINDERS ({reminders.filter((r) => !r.completed).length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('notes');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-900/30'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>NOTES ({notes.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('calculator');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-900/30'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>CALCULATOR</span>
          </button>

          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('memory');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech transition-all cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-900/30'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI MEMORY ({memoryFacts.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 cyber-grid">
        {/* ================= TAB 1: REMINDERS ================= */}
        {activeTab === 'reminders' && (
          <div className="space-y-5">
            {/* Add Reminder Form */}
            <form onSubmit={handleAddReminder} className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 space-y-3">
              <span className="text-xs font-tech text-cyan-300 font-semibold tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                SCHEDULE TACTICAL REMINDER
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Reminder task (e.g. Flight test at 16:00, Iron Legion diagnostics)..."
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  className="sm:col-span-6 bg-gray-950/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Time / Due (e.g. 5:30 PM, Tomorrow)"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="sm:col-span-3 bg-gray-950/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={newReminderPriority}
                  onChange={(e) => setNewReminderPriority(e.target.value as any)}
                  className="sm:col-span-2 bg-gray-950/80 border border-cyan-500/30 rounded-lg px-2 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High / Urgent</option>
                </select>
                <button
                  type="submit"
                  className="sm:col-span-1 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg py-2 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-tech text-cyan-400/80">Presets:</span>
                {[
                  'Daily Briefing at 09:00',
                  'Arc Reactor Check in 30 mins',
                  'Drink Water & Hydrate',
                  'Evening Lab Workout',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewReminderTitle(preset);
                      setNewReminderTime('Scheduled');
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/20 text-[10px] font-tech text-cyan-300 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </form>

            {/* Reminders List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-tech text-cyan-400/90 px-1">
                <span>ACTIVE DIRECTIVES</span>
                <span>{reminders.length} TASKS TOTAL</span>
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-8 text-cyan-500/50 font-tech text-xs">
                  No active reminders scheduled. Add a reminder above or tell JARVIS via voice.
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      rem.completed
                        ? 'bg-gray-950/40 border-gray-800 opacity-60'
                        : 'bg-gray-900/80 border-cyan-500/30 hover:border-cyan-400/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleReminder(rem.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                          rem.completed
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                            : 'border-cyan-500/40 hover:border-cyan-400 text-transparent'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <h4
                          className={`text-sm font-semibold tracking-wide ${
                            rem.completed
                              ? 'line-through text-gray-400'
                              : 'text-cyan-100'
                          }`}
                        >
                          {rem.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-tech text-cyan-400/70 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rem.time}
                          </span>
                          <span>•</span>
                          <span
                            className={`px-1.5 rounded text-[9px] uppercase ${
                              rem.priority === 'high'
                                ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                                : rem.priority === 'medium'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {rem.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1.5 rounded-lg text-cyan-400/60 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: NOTES ================= */}
        {activeTab === 'notes' && (
          <div className="space-y-5">
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tech text-cyan-300 font-semibold tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  LOG TACTICAL NOTE
                </span>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as any)}
                  className="bg-gray-950/80 border border-cyan-500/30 rounded px-2 py-1 text-xs text-cyan-300"
                >
                  <option value="Tactical">Tactical</option>
                  <option value="General">General</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Note Title / Subject..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full bg-gray-950/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />

              <textarea
                placeholder="Log details, mission notes, research formulas..."
                rows={3}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-gray-950/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 resize-none font-rajdhani"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-xs font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  SAVE NOTE
                </button>
              </div>
            </form>

            {/* Note search and export toolbar */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="bg-gray-950/60 border border-cyan-500/25 rounded-lg px-3 py-1.5 text-xs text-cyan-200 placeholder-cyan-500/40 w-48 sm:w-64"
              />
              <button
                onClick={exportNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs font-tech text-cyan-300 transition-colors cursor-pointer"
                title="Export notes to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </button>
            </div>

            {/* Notes List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes
                .filter(
                  (n) =>
                    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                    n.content.toLowerCase().includes(noteSearch.toLowerCase())
                )
                .map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-gray-900/80 border border-cyan-500/25 hover:border-cyan-400/50 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-tech uppercase bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                          {note.category}
                        </span>
                        <span className="text-[10px] font-tech text-cyan-500/70">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-cyan-100 text-sm mb-1">
                        {note.title}
                      </h4>
                      <p className="text-xs text-cyan-300/80 leading-relaxed font-rajdhani whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-cyan-500/15">
                      <button
                        onClick={() =>
                          onSendToJarvis(
                            `Please review my note "${note.title}": ${note.content} and give your tactical recommendation.`
                          )
                        }
                        className="text-[11px] font-tech text-cyan-400 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>ANALYZE WITH JARVIS</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-1 rounded text-cyan-500/60 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CALCULATOR ================= */}
        {activeTab === 'calculator' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="hud-panel p-4 rounded-2xl border border-cyan-500/30 space-y-3">
              {/* Display */}
              <div className="bg-gray-950/90 border border-cyan-500/40 rounded-xl p-3 text-right overflow-hidden shadow-inner">
                <div className="text-[10px] font-tech text-cyan-400/70 h-4">
                  {calcHistory[0] || 'STARK TACTICAL MATH COMPUTATION'}
                </div>
                <div className="text-2xl sm:text-3xl font-tech text-cyan-100 font-bold tracking-wider truncate">
                  {calcInput || '0'}
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map(
                  (key) => {
                    const isOperator = ['÷', '×', '-', '+', '='].includes(key);
                    const isSpecial = ['C', '(', ')', '%'].includes(key);

                    return (
                      <button
                        key={key}
                        onClick={() => handleCalcClick(key)}
                        className={`py-3 rounded-xl text-base font-tech font-bold transition-all active:scale-95 cursor-pointer ${
                          key === '='
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : isOperator
                            ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                            : isSpecial
                            ? 'bg-gray-900/80 border border-cyan-500/20 text-cyan-400 hover:bg-gray-800'
                            : 'bg-gray-950/80 border border-cyan-500/15 text-cyan-100 hover:bg-gray-800/80'
                        }`}
                      >
                        {key}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Ask Jarvis button */}
              {calcInput && (
                <button
                  onClick={() =>
                    onSendToJarvis(
                      `Jarvis, calculate and explain the mathematical problem: ${calcInput}`
                    )
                  }
                  className="w-full mt-2 py-2 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs font-tech text-cyan-200 hover:bg-cyan-900/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ASK JARVIS TO SOLVE & EXPLAIN STEPS</span>
                </button>
              )}
            </div>

            {/* Recent calculation history */}
            {calcHistory.length > 0 && (
              <div className="p-3 rounded-xl bg-gray-900/60 border border-cyan-500/20">
                <span className="text-[11px] font-tech text-cyan-400/80 block mb-1">
                  RECENT CALCULATIONS
                </span>
                <div className="space-y-1">
                  {calcHistory.map((h, i) => (
                    <div key={i} className="text-xs font-tech text-cyan-300/80">
                      • {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: AI MEMORY ================= */}
        {activeTab === 'memory' && (
          <div className="space-y-5">
            {/* Memory Permission Banner */}
            <div className="hud-panel p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-semibold text-cyan-100 font-orbitron">
                    AI MEMORY & PRIVACY PROTOCOL
                  </h4>
                  <p className="text-xs text-cyan-400/80 font-tech">
                    JARVIS only retains preferences with explicit user consent. You can inspect or wipe records at any time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playTactileClick();
                  triggerHaptic('light');
                  setPreferences((p) => ({ ...p, memoryEnabled: !p.memoryEnabled }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all cursor-pointer ${
                  preferences.memoryEnabled
                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-gray-800 border border-gray-700 text-gray-400'
                }`}
              >
                {preferences.memoryEnabled ? 'RETENTION: ACTIVE' : 'RETENTION: DISABLED'}
              </button>
            </div>

            {/* Add Custom Directive / Fact */}
            <form onSubmit={handleAddMemory} className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 space-y-3">
              <span className="text-xs font-tech text-cyan-300 font-semibold tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                TEACH NEW PREFERENCE OR FACT TO JARVIS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Always address me as Boss, My favorite language is Python, Working on Stark Rover project..."
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  className="sm:col-span-8 bg-gray-950/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={newFactCategory}
                  onChange={(e) => setNewFactCategory(e.target.value as any)}
                  className="sm:col-span-3 bg-gray-950/80 border border-cyan-500/30 rounded-lg px-2 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Preference">Preference</option>
                  <option value="Personal">Personal Detail</option>
                  <option value="Directive">Tactical Directive</option>
                  <option value="General">General</option>
                </select>
                <button
                  type="submit"
                  className="sm:col-span-1 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg py-2 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Memory Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-tech text-cyan-400/90 px-1">
                <span>STORED KNOWLEDGE BANK</span>
                <button
                  onClick={handleWipeMemory}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>WIPE ALL MEMORY</span>
                </button>
              </div>

              {memoryFacts.length === 0 ? (
                <div className="text-center py-8 text-cyan-500/50 font-tech text-xs">
                  No memory records stored. You can teach JARVIS above or say "Remember that..." in conversation.
                </div>
              ) : (
                memoryFacts.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-900/80 border border-cyan-500/25 hover:border-cyan-400/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-tech uppercase bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                        {mem.category}
                      </span>
                      <span className="text-xs text-cyan-100 font-rajdhani">
                        {mem.fact}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        soundFx.playTactileClick();
                        setMemoryFacts((prev) => prev.filter((m) => m.id !== mem.id));
                      }}
                      className="p-1 rounded text-cyan-500/60 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Forget fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
