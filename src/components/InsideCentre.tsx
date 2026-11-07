import { centrePhotos } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import styles from "./InsideCentre.module.css";

export function InsideCentre() {
  const [main, ...side] = centrePhotos;

  return (
    <section className={`${ui.section} ${styles.section}`} aria-labelledby="centre-title">
      <div className={ui.container}>
        <div className={ui.sectionHead}>
          <h2 id="centre-title" className={ui.sectionTitle}>
            Inside the centre
          </h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            A bright, friendly space makes the first visit easier — for children and parents
            alike.
          </p>
        </div>

        <div className={styles.grid}>
          <PhotoPlaceholder label={main} className={styles.main} />
          {side.map((label) => (
            <PhotoPlaceholder key={label} label={label} className={styles.side} />
          ))}
        </div>
      </div>
    </section>
  );
}
