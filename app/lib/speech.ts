let cachedVoice: SpeechSynthesisVoice | null = null;

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  return window.speechSynthesis;
}

function resolveVoice(): SpeechSynthesisVoice | null {
  const speech = synth();
  if (!speech) {
    return null;
  }
  if (cachedVoice) {
    return cachedVoice;
  }
  const voices = speech.getVoices();
  cachedVoice =
    voices.find((voice) => voice.lang === "en-US" && voice.localService) ??
    voices.find((voice) => voice.lang === "en-US") ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    null;
  return cachedVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = null;
    resolveVoice();
  });
}

export function speechSupported(): boolean {
  return synth() !== null;
}

export type SpeakOptions = {
  rate?: number;
  onEnd?: () => void;
};

export function speak(text: string, options: SpeakOptions = {}): boolean {
  const speech = synth();
  if (!speech || !text.trim()) {
    return false;
  }

  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = options.rate ?? 0.95;
  const voice = resolveVoice();
  if (voice) {
    utterance.voice = voice;
  }
  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }
  speech.speak(utterance);
  return true;
}

export function cancelSpeech(): void {
  synth()?.cancel();
}
