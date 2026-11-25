let cachedVoice: SpeechSynthesisVoice | null = null;
let generation = 0;
let pendingCleanups: Array<() => void> = [];

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

function runCleanups(): void {
  const cleanups = pendingCleanups;
  pendingCleanups = [];
  for (const cleanup of cleanups) {
    cleanup();
  }
}

function addCleanup(cleanup: () => void): void {
  pendingCleanups.push(cleanup);
}

const VOICES_TIMEOUT_MS = 1200;
const START_TIMEOUT_MS = 1200;
const SPEAK_DELAY_MS = 60;
const GESTURE_EVENTS = ["pointerdown", "keydown"] as const;

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = null;
    resolveVoice();
  });
}

export function speechSupported(): boolean {
  return synth() !== null;
}

export function primeSpeech(): void {
  const speech = synth();
  if (!speech) {
    return;
  }
  if (speech.paused) {
    speech.resume();
  }
  if (speech.speaking || speech.pending) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(".");
  utterance.volume = 0;
  utterance.rate = 10;
  speech.speak(utterance);
}

export type SpeakOptions = {
  rate?: number;
  onEnd?: () => void;
};

function attempt(
  speech: SpeechSynthesis,
  text: string,
  options: SpeakOptions,
  token: number,
  retries: number,
  allowGestureFallback: boolean,
): void {
  if (token !== generation) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = options.rate ?? 0.95;
  const voice = resolveVoice();
  if (voice) {
    utterance.voice = voice;
  }

  let started = false;
  let finished = false;
  let cancelled = false;
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimer();
    if (!cancelled && token === generation) {
      options.onEnd?.();
    }
  };

  utterance.onstart = () => {
    started = true;
    clearTimer();
  };
  utterance.onend = finish;
  utterance.onerror = finish;

  if (speech.paused) {
    speech.resume();
  }
  speech.speak(utterance);

  addCleanup(() => {
    cancelled = true;
    clearTimer();
  });

  timer = window.setTimeout(() => {
    timer = null;
    if (token !== generation || started) {
      return;
    }
    cancelled = true;
    speech.cancel();
    if (retries > 0) {
      attempt(speech, text, options, token, retries - 1, allowGestureFallback);
      return;
    }
    if (!allowGestureFallback) {
      return;
    }
    const retry = () => {
      runCleanups();
      if (token === generation) {
        attempt(speech, text, options, token, 0, false);
      }
    };
    const handler = () => {
      runCleanups();
      retry();
    };
    for (const event of GESTURE_EVENTS) {
      window.addEventListener(event, handler, { once: true, capture: true });
    }
    addCleanup(() => {
      for (const event of GESTURE_EVENTS) {
        window.removeEventListener(event, handler, true);
      }
    });
  }, START_TIMEOUT_MS);
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  const speech = synth();
  if (!speech || !text.trim()) {
    return false;
  }

  generation += 1;
  const token = generation;
  runCleanups();

  if (speech.speaking || speech.pending) {
    speech.cancel();
  }

  const start = () => {
    if (token !== generation) {
      return;
    }
    attempt(speech, text, options, token, 1, true);
  };

  if (speech.paused) {
    speech.resume();
  }

  if (speech.getVoices().length === 0) {
    const onVoices = () => {
      runCleanups();
      start();
    };
    speech.addEventListener?.("voiceschanged", onVoices);
    addCleanup(() => speech.removeEventListener?.("voiceschanged", onVoices));
    const timer = window.setTimeout(() => {
      runCleanups();
      start();
    }, VOICES_TIMEOUT_MS);
    addCleanup(() => window.clearTimeout(timer));
  } else {
    const timer = window.setTimeout(start, SPEAK_DELAY_MS);
    addCleanup(() => window.clearTimeout(timer));
  }

  return true;
}

export function cancelSpeech(): void {
  generation += 1;
  runCleanups();
  synth()?.cancel();
}
