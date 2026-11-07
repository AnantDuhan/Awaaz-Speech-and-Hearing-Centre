import { links, site } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./ContactCta.module.css";

export function ContactCta() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={ui.container}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <h2 id="contact-title">Let&apos;s have a chat about your child.</h2>
            <p>
              Call <a href={links.call}>{site.phone.display}</a> or WhatsApp{" "}
              <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
                {site.whatsapp.display}
              </a>
              . We&apos;ll suggest the right first step.
            </p>
          </div>
          <div className={styles.actions}>
            <a href={links.book} className={`${ui.btn} ${ui.btnDark}`}>
              Book a first visit
            </a>
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ui.btn} ${ui.btnWhite}`}
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
