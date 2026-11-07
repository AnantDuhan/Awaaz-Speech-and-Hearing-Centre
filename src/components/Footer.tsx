import { cacheLife } from "next/cache";
import Link from "next/link";
import { formatHours, fullAddress, links, site } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./Footer.module.css";

// Cached so pages can still be prerendered; refreshed daily.
async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getCurrentYear();

  return (
    <footer className={styles.footer}>
      <div className={`${ui.container} ${styles.inner}`}>
        <address className={styles.block}>
          <strong className={styles.name}>{site.name}</strong>
          <span>{fullAddress}</span>
          <span>
            <a href={links.call}>{site.phone.display}</a> ·{" "}
            <a href={links.email}>{site.email}</a>
          </span>
        </address>

        <div className={styles.block}>
          <strong className={styles.label}>Hours</strong>
          {site.hours.map((row) => (
            <span key={row.label}>
              {row.label}: {formatHours(row)}
            </span>
          ))}
        </div>

        <nav aria-label="Footer" className={styles.block}>
          <strong className={styles.label}>Explore</strong>
          <Link href="/services">All services</Link>
          <Link href="/checklist">Milestone checklist</Link>
          <Link href="/#faq">Questions</Link>
        </nav>

        <p className={styles.copyright}>
          © {year} {site.name}
        </p>
      </div>
    </footer>
  );
}
