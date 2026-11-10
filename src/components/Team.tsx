
import Link from "next/link";
import { team } from "@/content/site";
import { Icon } from "./Icon";
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
            Qualified, registered audiologists and speech-language
            professionals.
          </p>
        </div>

        <ul className={styles.grid}>
          {team.map((person) => (
            <li key={person.slug}>
              <Link
                href={`/specialists/${person.slug}`}
                className={styles.card}
                aria-label={`View ${person.name}'s professional profile`}
              >
                <div className={styles.photo}>
                  {person.photo ? (
                    <img src={person.photo} alt={person.name} />
                  ) : (
                    <span>{person.name.charAt(0)}</span>
                  )}
                </div>

                <div className={styles.text}>
                  <h3>{person.name}</h3>
                  <p className={styles.role}>{person.role}</p>
                  <p className={styles.meta}>{person.qualification}</p>
                  <p className={styles.meta}>
                    Registration: {person.registration}
                  </p>
                  <span className={styles.profileLink}>
                    View full profile <Icon name="arrow" size={17} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
