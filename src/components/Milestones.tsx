import Link from "next/link";
import { milestones } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./Milestones.module.css";

export function Milestones() {
  return (
    <section
      id="milestones"
      className={`${ui.section} ${ui.tinted}`}
      aria-labelledby="milestones-title"
    >
      <div className={ui.container}>
        <div className={styles.head}>
          <h2 id="milestones-title" className={ui.sectionTitle}>
            Is my child on track?
          </h2>
          <p className={ui.lede}>
            A quick guide for parents. Every child is different — if something feels off, a
            check-up is the fastest way to know.
          </p>
        </div>

        <ul className={styles.grid}>
          {milestones.map((item) => (
            <li key={item.age} className={styles.card}>
              <span className={`${styles.badge} ${ui.tone}`} data-tone={item.tone}>
                {item.age}
              </span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <Link href="/checklist" className={`${ui.btn} ${ui.btnSmall} ${ui.btnAccent}`}>
            Take the 2-minute checklist
          </Link>
          <p className={styles.note}>
            General guidance only — not a diagnosis. Talk to us if you have any concerns.
          </p>
        </div>
      </div>
    </section>
  );
}
