import type { Metadata } from "next";
import { Checklist } from "@/components/Checklist";
import { PageIntro } from "@/components/PageIntro";
import ui from "@/styles/ui.module.css";

export const metadata: Metadata = {
  title: "Is my child on track? A 2-minute speech and language checklist",
  description:
    "Answer a few quick questions about your child's speech and language. A guide for parents of children up to 3 years — not a diagnosis.",
  alternates: { canonical: "/checklist" },
};

export default function ChecklistPage() {
  return (
    <main>
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Milestone checklist" }]}
        eyebrow="For parents"
        title="Is my child on track?"
      >
        <p>
          Answer a few quick questions about what your child does now. It takes about two minutes.
        </p>
      </PageIntro>

      <section className={ui.section} aria-label="Checklist">
        <div className={ui.container}>
          <Checklist />
        </div>
      </section>
    </main>
  );
}
