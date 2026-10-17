export type LanguageMode = 'en' | 'hi' | 'hinglish';

export type SystemProtocol = 'STANDARD' | 'SENTRY_MODE' | 'STEALTH' | 'HOUSE_PARTY' | 'CLEAN_SLATE';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  language?: LanguageMode;
  groundingMetadata?: GroundingMetadata | null;
  isAudioPlaying?: boolean;
  isSpoken?: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string; // ISO string or time string
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'Tactical' | 'General' | 'Work' | 'Personal';
  createdAt: number;
}

export interface MemoryFact {
  id: string;
  fact: string;
  category: 'Preference' | 'Personal' | 'Directive' | 'General';
  dateAdded: string;
}

export interface UserPreferences {
  userName: string;
  callSign: string;
  language: LanguageMode;
  autoSpeak: boolean;
  voiceName: 'Fenrir' | 'Puck' | 'Zephyr' | 'Kore' | 'Charon';
  memoryEnabled: boolean;
  hapticsEnabled: boolean;
  soundFxEnabled: boolean;
}

export interface SystemTelemetry {
  status: string;
  version: string;
  coreTemperature: string;
  arcReactorOutput: string;
  latencyMs: number;
  uptimeSeconds: number;
  geminiOnline: boolean;
}
