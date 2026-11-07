import styles from "./SoundWave.module.css";

const HEIGHTS = [
  20, 34, 52, 40, 72, 96, 60, 44, 80, 120, 140, 100, 64, 90, 130, 150, 110, 70, 50, 86, 116, 96,
  60, 40, 30, 48, 70, 92, 124, 148, 128, 90, 62, 44, 70, 104, 136, 112, 76, 52, 36, 58, 84, 66, 44,
  30, 22, 16,
];

const TONES = ["yellow", "coral", "mint", "sky"] as const;

// Tall bars cycle through the playful tones; short bars stay muted.
const BARS = (() => {
  let toneIndex = 0;
  return HEIGHTS.map((height, index) => ({
    x: index * 25 + 6,
    y: 80 - height / 2,
    height,
    tone: height >= 100 ? TONES[toneIndex++ % TONES.length] : "muted",
  }));
})();

export function SoundWave() {
  return (
    <svg viewBox="0 0 1200 160" className={styles.wave} aria-hidden="true" focusable="false">
      {BARS.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width={12}
          height={bar.height}
          rx={6}
          data-tone={bar.tone}
        />
      ))}
    </svg>
  );
}
