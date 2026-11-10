import Image from "next/image";
import { centrePhotos } from "@/content/site";
import ui from "@/styles/ui.module.css";
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
          {[main, ...side].map((photo, index) => (
            <div
              key={photo.src}
              className={`${styles.photo} ${index === 0 ? styles.main : styles.side}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 760px) 100vw, (max-width: 1200px) 60vw, 700px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
