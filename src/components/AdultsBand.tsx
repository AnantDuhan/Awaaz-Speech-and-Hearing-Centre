import Link from "next/link";
import ui from "@/styles/ui.module.css";
import styles from "./AdultsBand.module.css";

export function AdultsBand() {
  return (
    <section id="adults" className={styles.section} aria-labelledby="adults-title">
      <div className={ui.container}>
        <div className={styles.band}>
          <div className={styles.copy}>
            <h2 id="adults-title">Looking for help for a grown-up?</h2>
            <p>
              Hearing tests, hearing aids, tinnitus care, and speech therapy after stroke — same
              team, same care.
            </p>
          </div>
          <Link href="/services#adults" className={styles.link}>
            See adult services <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
