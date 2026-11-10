import Image from "next/image";
import { heroTags } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { SoundWave } from "./SoundWave";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.chip}>For children — and the grown-ups in their lives</p>
          <h1 id="hero-title" className={styles.title}>
            Every child deserves to be heard.
          </h1>
          <p className={styles.lede}>
            Speech, language and hearing support for children and adults — playful sessions,
            precise tests, and families involved every step of the way.
          </p>
          <div className={styles.ctas}>
            <a href="#contact" className={`${ui.btn} ${ui.btnHighlight}`}>
              Book a first visit
            </a>
            <a href="#milestones" className={`${ui.btn} ${ui.btnOutlineLight}`}>
              Is my child on track?
            </a>
          </div>
          <ul className={styles.tags}>
            {heroTags.map((tag) => (
              <li key={tag.label} className={ui.tone} data-tone={tag.tone}>
                {tag.label}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.art}>
          <div className={styles.blob} aria-hidden="true" />
          <div className={`${styles.dot} ${styles.dotMint}`} aria-hidden="true" />
          <div className={`${styles.dot} ${styles.dotCoral}`} aria-hidden="true" />
          <div className={styles.photo}>
            <Image
              src="/therapist-playing-with-child.jpg"
              alt="A therapist playing with a child"
              fill
              sizes="(max-width: 700px) 70vw, 290px"
              className={styles.photoImage}
            />
          </div>
          <span className={`${styles.bubble} ${styles.bubbleOne}`} aria-hidden="true">
            ba-ba!
          </span>
          <span className={`${styles.bubble} ${styles.bubbleTwo}`} aria-hidden="true">
            more please
          </span>
          <span className={`${styles.bubble} ${styles.bubbleThree}`} aria-hidden="true">
            mama
          </span>
        </div>
      </div>

      <div className={`${ui.container} ${styles.waveWrap}`}>
        <SoundWave />
      </div>
    </section>
  );
}
