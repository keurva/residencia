import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording";

const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }
  return PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    recorderRef.current = null;
    setAnalyser(null);
    setDuration(0);
    setStatus("idle");
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("Tu navegador no permite grabar audio.");
      return false;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const node = context.createAnalyser();
      node.fftSize = 256;
      node.smoothingTimeConstant = 0.75;
      source.connect(node);
      audioContextRef.current = context;
      setAnalyser(node);

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setStatus("recording");
      setDuration(0);
      timerRef.current = window.setInterval(
        () => setDuration((seconds) => seconds + 1),
        1000,
      );
      return true;
    } catch (cause) {
      cleanup();
      const denied =
        cause instanceof DOMException &&
        (cause.name === "NotAllowedError" || cause.name === "SecurityError");
      setError(
        denied
          ? "No tenemos permiso para usar tu micrófono. Habilítalo para grabar."
          : "No pudimos iniciar la grabación. Revisa tu micrófono e inténtalo de nuevo.",
      );
      return false;
    }
  }, [cleanup]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanup();
      return null;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const created = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        resolve(created.size > 0 ? created : null);
      };
      recorder.stop();
    });

    cleanup();
    return blob;
  }, [cleanup]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    cleanup();
  }, [cleanup]);

  return { status, error, duration, analyser, start, stop, cancel };
}
