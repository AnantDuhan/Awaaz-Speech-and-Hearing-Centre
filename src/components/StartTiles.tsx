import Link from "next/link";
import { startTiles } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { Icon } from "./Icon";
import styles from "./StartTiles.module.css";

const BLOBS = ["var(--blob-1)", "var(--blob-2)", "var(--blob-3)", "var(--blob-4)"];

export function StartTiles() {
  return (
    <section id="start" className={ui.section} aria-labelledby="start-title">
      <div className={ui.container}>
        <div className={styles.head}>
          <h2 id="start-title" className={ui.sectionTitle}>
            Where would you like to start?
          </h2>
          <p className={ui.lede}>
            Pick what sounds most like you. We&apos;ll point you to the right specialist and
            first step.
          </p>
        </div>

        <ul className={styles.grid}>
          {startTiles.map((tile, index) => (
            <li key={tile.title}>
              <Link href={tile.href} className={styles.tile}>
                <span
                  className={`${styles.number} ${ui.tone}`}
                  data-tone={tile.tone}
                  style={{ borderRadius: BLOBS[index % BLOBS.length] }}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.text}>
                  <span className={styles.title}>{tile.title}</span>
                  <span className={styles.desc}>{tile.text}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  <Icon name="arrow" size={22} strokeWidth={2.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
