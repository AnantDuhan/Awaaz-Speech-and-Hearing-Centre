import { faq } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./Faq.module.css";

export function Faq() {
  return (
    <section id="faq" className={`${ui.section} ${styles.section}`} aria-labelledby="faq-title">
      <div className={`${ui.container} ${styles.layout}`}>
        <div className={styles.head}>
          <h2 id="faq-title" className={ui.sectionTitle}>
            Questions parents ask
          </h2>
          <p className={ui.lede}>Can&apos;t find your answer? Call or WhatsApp us.</p>
        </div>

        <div className={styles.list}>
          {faq.items.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary className={styles.question}>
                <span>{item.question}</span>
                <span className={styles.marker} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
