import { team } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./Team.module.css";

export function Team() {
  return (
    <section id="team" className={ui.section} aria-labelledby="team-title">
      <div className={ui.container}>
        <div className={ui.sectionHead}>
          <h2 id="team-title" className={ui.sectionTitle}>
            Meet the specialists
          </h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Qualified, registered audiologists and speech-language pathologists.
          </p>
        </div>

        <ul className={styles.grid}>
          {team.map((person, index) => (
            <li key={`${person.role}-${index}`} className={styles.card}>
              {/* Swap for next/image with a real, friendly photo of this person. */}
              <div className={styles.photo} role="img" aria-label={`Photo placeholder: ${person.name}`}>
                Photo
              </div>
              <div className={styles.text}>
                <h3>{person.name}</h3>
                <p className={styles.role}>{person.role}</p>
                <p className={styles.meta}>{person.qualification}</p>
                <p className={styles.meta}>Registration no. {person.registration}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
