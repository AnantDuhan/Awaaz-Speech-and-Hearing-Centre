import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageIntro } from "@/components/PageIntro";
import { ServiceCard } from "@/components/ServiceCard";
import { adultServices, childrenServices, site } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: `Speech therapy & hearing services in ${site.address.city}`,
  description:
    "Speech, language and hearing services for children and adults: speech therapy, late talking, stuttering, autism support, hearing tests, hearing aids, tinnitus care and therapy after stroke.",
  alternates: { canonical: "/services" },
};

const groups = [
  {
    id: "children",
    title: "For children",
    lede: "From newborn hearing screening to speech therapy for school-age children.",
    items: childrenServices,
  },
  {
    id: "adults",
    title: "For adults",
    lede: "Hearing care and therapy for adults, including after stroke or illness.",
    items: adultServices,
  },
];

export default function ServicesPage() {
  return (
    <main>
      <PageIntro crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]} title="Our services">
        <p>
          Assessment and therapy for speech, language and hearing — for children and adults, all
          under one roof.
        </p>
      </PageIntro>

      {groups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className={`${ui.section} ${styles.group}`}
          aria-labelledby={`${group.id}-title`}
        >
          <div className={ui.container}>
            <div className={ui.sectionHead}>
              <h2 id={`${group.id}-title`} className={ui.sectionTitle}>
                {group.title}
              </h2>
              <p className={`${ui.lede} ${styles.lede}`}>{group.lede}</p>
            </div>
            <ul className={styles.grid}>
              {group.items.map((service) => (
                <li key={service.slug}>
                  <ServiceCard service={service} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <ContactCta />
    </main>
  );
}
