import Link from "next/link";
import { childrenServices } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { Icon } from "./Icon";
import styles from "./Services.module.css";

export function Services() {
  return (
    <section id="services" className={ui.section} aria-labelledby="services-title">
      <div className={ui.container}>
        <div className={ui.sectionHead}>
          <h2 id="services-title" className={ui.sectionTitle}>
            How we help children
          </h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Assessment and therapy in one place, from first words to the classroom.
          </p>
        </div>

        <ol className={styles.list}>
          {childrenServices.map((service, index) => (
            <li key={service.slug} className={styles.row}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={`${styles.icon} ${ui.tone}`} data-tone={service.tone}>
                <Icon name={service.icon} />
              </span>
              <h3 className={styles.title}>
                <Link href={`/services/${service.slug}`}>{service.title}</Link>
              </h3>
              <p className={styles.text}>{service.short}</p>
              <Link href={`/services/${service.slug}`} className={styles.more} tabIndex={-1} aria-hidden="true">
                Learn more
              </Link>
            </li>
          ))}
        </ol>

        <p className={styles.adultsLink}>
          Looking for adult services? <Link href="/services#adults">See hearing aids, tinnitus care and therapy after stroke</Link>
        </p>
      </div>
    </section>
  );
}
