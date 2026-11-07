import { Icon } from "./Icon";
import styles from "./PhotoPlaceholder.module.css";

type PhotoPlaceholderProps = {
  label: string;
  shape?: "rect" | "circle";
  className?: string;
};

/**
 * Stand-in for a real photo. Swap each one for next/image with a photo of the
 * centre's own team and rooms, e.g.
 *   <Image src="/photos/therapy-room.jpg" alt="Therapy room with toys" fill sizes="(max-width: 900px) 100vw, 66vw" />
 */
export function PhotoPlaceholder({ label, shape = "rect", className }: PhotoPlaceholderProps) {
  return (
    <div
      className={[styles.placeholder, shape === "circle" ? styles.circle : "", className ?? ""].join(" ")}
      role="img"
      aria-label={`Photo placeholder: ${label}`}
    >
      {shape === "circle" ? <Icon name="camera" size={32} strokeWidth={1.75} /> : null}
      <span>Photo: {label.charAt(0).toLowerCase() + label.slice(1)}</span>
    </div>
  );
}
