import { useEffect, useRef } from "react";

const BAR_COUNT = 24;

export function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const barsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const levelsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  useEffect(() => {
    if (!analyser) {
      levelsRef.current = new Array(BAR_COUNT).fill(0);
      barsRef.current.forEach((bar) => {
        if (bar) {
          bar.style.transform = "scaleY(0.08)";
        }
      });
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const render = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let index = 0; index < data.length; index += 1) {
        const value = (data[index] - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / data.length);
      const level = Math.min(1, rms * 3.4);

      const levels = levelsRef.current;
      levels.shift();
      levels.push(level);

      for (let index = 0; index < BAR_COUNT; index += 1) {
        const bar = barsRef.current[index];
        if (!bar) {
          continue;
        }
        const distance = Math.abs(index - (BAR_COUNT - 1) / 2) / (BAR_COUNT / 2);
        const emphasis = 1 - distance * 0.45;
        const scale = Math.max(0.08, levels[index] * emphasis * 1.6);
        bar.style.transform = `scaleY(${Math.min(1, scale)})`;
      }

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <span
      className="flex h-8 flex-1 items-center justify-center gap-[3px]"
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(node) => {
            barsRef.current[index] = node;
          }}
          className="h-8 w-[3px] origin-center scale-y-[0.08] rounded-full bg-accent transition-transform duration-75 ease-out"
        />
      ))}
    </span>
  );
}
