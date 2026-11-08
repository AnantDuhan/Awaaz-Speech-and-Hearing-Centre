import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { HearingReportLoader } from "@/components/report/HearingReportLoader";
import ui from "@/styles/ui.module.css";

// Staff tool: not linked from the site, not in the sitemap, and never indexed —
// even after launch. Anyone with the address can open it, but nothing typed here
// leaves the browser.
export const metadata: Metadata = {
  title: "Hearing test report",
  robots: { index: false, follow: false },
};

export default function HearingReportPage() {
  return (
    <main>
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Staff tools" }, { label: "Hearing test report" }]}
        eyebrow="For clinic staff"
        title="Hearing test report"
      >
        <p>Enter the test results to create an A4 PDF report to print or send on WhatsApp.</p>
      </PageIntro>
      <section className={ui.section} aria-label="Report form">
        <div className={ui.container}>
          <HearingReportLoader />
        </div>
      </section>
    </main>
  );
}
