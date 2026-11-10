import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SPEECH_BUBBLE_PATH } from "@/components/Logo";
import { links } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./not-found.module.css";

// Shown for any address that doesn't exist (exported as 404.html, which
// Netlify serves automatically). Next.js adds "noindex" to it on its own.
export const metadata: Metadata = {
  title: "Page not found",
};

const suggestions = [
  {
    href: "/services",
    title: "Our services",
    text: "Speech therapy and hearing care for children and adults.",
  },
  {
    href: "/checklist",
    title: "Is my child on track?",
    text: "A two-minute speech and language checklist for parents.",
  },
  {
    href: "/services/hearing-tests-children",
    title: "Hearing tests for kids",
    text: "From newborn screening to play-based hearing tests.",
  },
  {
    href: "/#visit",
    title: "Visit us",
    text: "Address, opening hours and directions.",
  },
];

export default function NotFound() {
  return (
    <main>
      <section className={styles.hero} aria-labelledby="not-found-title">
        <div className={`${ui.container} ${styles.grid}`}>
          <div className={styles.copy}>
            <p className={styles.chip}>Error 404 · Page not found</p>
            <h1 id="not-found-title" className={styles.title}>
              Sorry, we didn&apos;t catch that.
            </h1>
            <p className={styles.lede}>
              We couldn&apos;t find the page you&apos;re looking for. The link may be out of date, or
              the address may have a typo.
            </p>
            <div className={styles.ctas}>
              <Link href="/" className={`${ui.btn} ${ui.btnHighlight}`}>
                Go to the home page
              </Link>
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ui.btn} ${ui.btnOutlineLight}`}
              >
                Ask us on WhatsApp
              </a>
            </div>
          </div>

          <div className={styles.art} aria-hidden="true">
            <span className={`${styles.dot} ${styles.dotMint}`} />
            <span className={`${styles.dot} ${styles.dotCoral}`} />
            <svg viewBox="0 0 64 64" className={styles.bubble} focusable="false">
              <path d={SPEECH_BUBBLE_PATH} className={styles.bubbleShape} />
              <text x="32" y="25" textAnchor="middle" dominantBaseline="central" className={styles.bubbleText}>
                404
              </text>
            </svg>
          </div>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="suggestions-title">
        <div className={ui.container}>
          <h2 id="suggestions-title" className={`${ui.sectionTitle} ${styles.suggestionsTitle}`}>
            Try one of these instead
          </h2>
          <ul className={styles.suggestions}>
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.card}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.cardText}>{item.text}</span>
                  <span className={styles.cardArrow} aria-hidden="true">
                    <Icon name="arrow" size={20} strokeWidth={2.5} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
