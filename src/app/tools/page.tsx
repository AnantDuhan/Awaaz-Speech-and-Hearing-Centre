import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import ui from "@/styles/ui.module.css";
import styles from "./tools.module.css";

// Staff-only index: not linked from the public site, not in the sitemap,
// and never indexed, even after launch.
export const metadata: Metadata = {
  title: "Staff tools",
  robots: { index: false, follow: false },
};

type Tool = {
  href: string;
  title: string;
  text: string;
  output: string;
  icon: IconName;
  tone: "yellow" | "coral" | "mint" | "sky";
};

const tools: Tool[] = [
  {
    href: "/tools/hearing-report",
    title: "Hearing test report",
    text: "Turn the audiometer's results into a one-page report with right and left audiograms, pure-tone averages, speech and tympanometry results, and findings.",
    output: "A4 PDF · print, share on WhatsApp or email",
    icon: "ear",
    tone: "yellow",
  },
];

export default function ToolsPage() {
  return (
    <main>
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Staff tools" }]}
        eyebrow="For clinic staff"
        title="Staff tools"
      >
        <p>
          Tools for the clinic team. This page isn&apos;t linked from the public website, so bookmark
          it on the clinic computer.
        </p>
      </PageIntro>

      <section className={ui.section} aria-label="Tools">
        <div className={`${ui.container} ${styles.layout}`}>
          <ul className={styles.list}>
            {tools.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className={styles.card}>
                  <span className={`${styles.icon} ${ui.tone}`} data-tone={tool.tone}>
                    <Icon name={tool.icon} size={28} />
                  </span>
                  <span className={styles.body}>
                    <span className={styles.title}>{tool.title}</span>
                    <span className={styles.text}>{tool.text}</span>
                    <span className={styles.output}>{tool.output}</span>
                  </span>
                  <span className={styles.open}>
                    Open <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <aside className={styles.notes} aria-labelledby="notes-title">
            <h2 id="notes-title">Good to know</h2>
            <ul>
              <li>
                <strong>Nothing is saved or sent.</strong> Everything you type stays in this browser,
                and closing the tab clears it. Download the report before you leave the page.
              </li>
              <li>
                <strong>Downloads stay on this device.</strong> Keep patient reports in a private
                folder, not on a shared desktop.
              </li>
              <li>
                <strong>Log every report number</strong> in the clinic register. That&apos;s how staff
                confirm a report is genuine when someone calls to check it.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
