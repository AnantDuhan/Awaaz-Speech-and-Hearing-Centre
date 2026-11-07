import { formatHours, fullAddress, links, site } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { Icon } from "./Icon";
import styles from "./VisitUs.module.css";

// Only Google's "Embed a map" URLs may be shown in an iframe. Share links
// (share.google, maps.app.goo.gl) are blocked by Google and show
// "refused to connect", so they are ignored here.
const EMBED_PREFIX = "https://www.google.com/maps/embed";

export function VisitUs() {
  const { google } = site;
  const embedUrl: string = google.mapEmbedUrl;
  const canEmbed = embedUrl.startsWith(EMBED_PREFIX);
  const mapsLink: string = google.profileUrl || links.directions;

  return (
    <section id="visit" className={styles.section} aria-labelledby="visit-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.mapWrap}>
          {canEmbed ? (
            <iframe
              src={embedUrl}
              title={`Map showing ${site.name}`}
              className={styles.map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              <span className={styles.mapPin}>
                <Icon name="pin" size={32} />
              </span>
              <span className={styles.mapLinkTitle}>Open in Google Maps</span>
              <span className={styles.mapLinkText}>
                {site.address.area}, {site.address.city}
              </span>
            </a>
          )}
        </div>

        <div className={styles.details}>
          <h2 id="visit-title" className={ui.sectionTitle}>
            Visit us
          </h2>

          <ul className={styles.facts}>
            <li>
              <span className={styles.factIcon}>
                <Icon name="pin" />
              </span>
              <span>{fullAddress}</span>
            </li>
            <li>
              <span className={styles.factIcon}>
                <Icon name="clock" />
              </span>
              <span className={styles.hours}>
                {site.hours.map((row) => (
                  <span key={row.label}>
                    {row.label}: {formatHours(row)}
                  </span>
                ))}
              </span>
            </li>
            <li>
              <span className={styles.factIcon}>
                <Icon name="phone" />
              </span>
              <a href={links.call}>{site.phone.display}</a>
            </li>
          </ul>

          <div className={styles.actions}>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ui.btn} ${ui.btnSmall} ${ui.btnAccent}`}
            >
              Get directions
            </a>
            {google.reviewsUrl ? (
              <a
                href={google.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ui.btn} ${ui.btnSmall} ${styles.reviews}`}
              >
                <Icon name="star" size={20} />
                Read our Google reviews
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
