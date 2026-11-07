import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { ServiceCard } from "@/components/ServiceCard";
import {
  formatHours,
  getService,
  links,
  services,
  site,
  whatsappLink,
} from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./service.module.css";

// Only the services listed in site.ts exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: `${service.seoTitle} in ${site.address.city}`,
    description: service.intro,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const audienceLabel = service.audience === "children" ? "For children" : "For adults";
  const related = services
    .filter((other) => other.audience === service.audience && other.slug !== service.slug)
    .slice(0, 3);

  return (
    <main>
      <PageIntro
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
        eyebrow={audienceLabel}
        title={service.seoTitle}
      >
        <p>{service.intro}</p>
      </PageIntro>

      <div className={`${ui.container} ${styles.layout}`}>
        <article className={styles.body}>
          <section aria-labelledby="signs-title">
            <h2 id="signs-title" className={styles.heading}>
              When to talk to us
            </h2>
            <ul className={styles.checks}>
              {service.signs.map((sign) => (
                <li key={sign}>
                  <span className={`${styles.checkIcon} ${ui.tone}`} data-tone={service.tone}>
                    <Icon name="check" size={18} strokeWidth={3} />
                  </span>
                  {sign}
                </li>
              ))}
            </ul>
            {service.note ? (
              <p className={styles.note}>
                <strong>Important: </strong>
                {service.note}
              </p>
            ) : null}
          </section>

          <section aria-labelledby="visit-title">
            <h2 id="visit-title" className={styles.heading}>
              Your first visit
            </h2>
            <p className={styles.paragraph}>{service.firstVisit}</p>
          </section>

          <section aria-labelledby="help-title">
            <h2 id="help-title" className={styles.heading}>
              How we help
            </h2>
            <ul className={styles.bullets}>
              {service.howWeHelp.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </article>

        <aside className={styles.aside} aria-labelledby="book-title">
          <div className={styles.bookCard}>
            <h2 id="book-title">Book an assessment</h2>
            <p>Call or WhatsApp us and we&apos;ll find a time that works for you.</p>
            <a href={links.call} className={`${ui.btn} ${ui.btnDark}`}>
              <Icon name="phone" size={20} />
              <span className={styles.btnLabel}>Call {site.phone.display}</span>
            </a>
            <a
              href={whatsappLink(`Hi, I'd like to ask about ${service.title.toLowerCase()}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ui.btn} ${ui.btnWhite}`}
            >
              <Icon name="chat" size={20} />
              <span className={styles.btnLabel}>WhatsApp us</span>
            </a>
            <dl className={styles.hours}>
              {site.hours.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{formatHours(row)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className={`${ui.section} ${ui.tinted}`} aria-labelledby="related-title">
          <div className={ui.container}>
            <h2 id="related-title" className={`${ui.sectionTitle} ${styles.relatedTitle}`}>
              Other services {service.audience === "children" ? "for children" : "for adults"}
            </h2>
            <ul className={styles.related}>
              {related.map((other) => (
                <li key={other.slug}>
                  <ServiceCard service={other} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
