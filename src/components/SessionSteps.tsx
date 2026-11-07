import { sessionSteps } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./SessionSteps.module.css";

const BLOBS = ["var(--blob-1)", "var(--blob-2)", "var(--blob-3)"];

export function SessionSteps() {
  return (
    <section className={`${ui.section} ${ui.tinted}`} aria-labelledby="session-title">
      <div className={ui.container}>
        <h2 id="session-title" className={`${ui.sectionTitle} ${styles.title}`}>
          What a session looks like
        </h2>
        <ol className={styles.steps}>
          {sessionSteps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span
                className={`${styles.number} ${ui.tone}`}
                data-tone={step.tone}
                style={{ borderRadius: BLOBS[index % BLOBS.length] }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
