import { LanguageMode } from "../types";

export type SpeechStatus = "inactive" | "listening" | "processing" | "speaking";

interface SpeechOptions {
  language: LanguageMode;
  voiceName?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: SpeechStatus) => void;
}

class SpeechManager {
  private recognition: any = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private speechStatus: SpeechStatus = "inactive";

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  public getSpeechStatus(): SpeechStatus {
    return this.speechStatus;
  }

  /**
   * Start listening for voice commands from user mic
   */
  public startListening(
    language: LanguageMode,
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onStatusChange: (status: SpeechStatus) => void
  ) {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError("Speech recognition is not supported in this browser environment. You can type commands.");
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      // Select proper language code
      if (language === "hi") {
        rec.lang = "hi-IN";
      } else if (language === "hinglish") {
        rec.lang = "hi-IN"; // hi-IN speech engines transcribe Hinglish remarkably well
      } else {
        rec.lang = "en-IN";
      }

      rec.onstart = () => {
        this.isListening = true;
        this.speechStatus = "listening";
        onStatusChange("listening");
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const candidate = finalTranscript.trim() || interimTranscript.trim();
        if (candidate) {
          onResult(candidate);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("[Speech] Recognition error:", event.error);
        this.isListening = false;
        this.speechStatus = "inactive";
        onStatusChange("inactive");
        if (event.error !== "no-speech" && event.error !== "aborted") {
          onError(`Mic input notice: ${event.error}`);
        }
      };

      rec.onend = () => {
        this.isListening = false;
        if (this.speechStatus === "listening") {
          this.speechStatus = "inactive";
          onStatusChange("inactive");
        }
      };

      this.recognition = rec;
      rec.start();
    } catch (err: any) {
      this.isListening = false;
      this.speechStatus = "inactive";
      onStatusChange("inactive");
      onError(err.message || "Failed to start microphone.");
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
    this.speechStatus = "inactive";
  }

  /**
   * Speak response using Gemini TTS or Web SpeechSynthesis fallback
   */
  public async speakText(
    text: string,
    language: LanguageMode,
    voiceName: string = "Fenrir",
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();

    // Sanitize text from markdown characters for speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_#~>\[\]]/g, "")
      .replace(/\(http[s]?:\/\/[^\)]+\)/g, "")
      .trim();

    if (!cleanText) return;

    this.isSpeaking = true;
    this.speechStatus = "speaking";
    if (onStart) onStart();

    // Attempt 1: Server-side Gemini High-Fidelity TTS
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText.slice(0, 700),
          voice: voiceName,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          this.currentAudio = audio;

          audio.onended = () => {
            this.isSpeaking = false;
            this.speechStatus = "inactive";
            this.currentAudio = null;
            if (onEnd) onEnd();
          };

          audio.onerror = () => {
            this.fallbackSpeechSynthesis(cleanText, language, onEnd);
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Gemini TTS failed or offline, falling back to Web SpeechSynthesis:", err);
    }

    // Fallback: Browser Web Speech API SpeechSynthesis
    this.fallbackSpeechSynthesis(cleanText, language, onEnd);
  }

  private fallbackSpeechSynthesis(
    text: string,
    language: LanguageMode,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.isSpeaking = false;
      this.speechStatus = "inactive";
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();

      if (language === "hi") {
        utterance.lang = "hi-IN";
        const hiVoice = voices.find((v) => v.lang.startsWith("hi"));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.lang = "en-IN";
        const enVoice = voices.find(
          (v) =>
            v.lang === "en-GB" ||
            v.lang.startsWith("en-IN") ||
            v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("george")
        );
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.speechStatus = "inactive";
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.speechStatus = "inactive";
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      this.speechStatus = "inactive";
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isSpeaking = false;
    this.speechStatus = "inactive";
  }
}

export const speechManager = new SpeechManager();
