
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { team, site, links } from "@/content/site";
import ui from "@/styles/ui.module.css";
import styles from "./specialist.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/specialists/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const person = team.find((item) => item.slug === slug);

  if (!person) return {};

  return {
    title: `${person.name} – ${person.role}`,
    description: `${person.name}, ${person.qualification}. Registration number: ${person.registration}.`,
  };
}

export default async function SpecialistProfile({
  params,
}: PageProps<"/specialists/[slug]">) {
  const { slug } = await params;
  const person = team.find((item) => item.slug === slug);

  if (!person) notFound();

  return (
    <main className={styles.page}>
      <div className={ui.container}>
        <Link href="/#team" className={styles.back}>
          <Icon name="arrow" size={17} /> Back to our specialists
        </Link>

        <section className={styles.hero}>
          <div className={styles.portrait}>
            {person.photo ? (
              <img src={person.photo} alt={person.name} />
            ) : (
              <PhotoPlaceholder
                label={person.name}
                shape="circle"
              />
            )}
          </div>

          <div className={styles.identity}>
            <span className={styles.eyebrow}>
              OUR SPECIALIST
            </span>
            <h1>{person.name}</h1>
            <p className={styles.role}>{person.role}</p>
            <p>{person.qualification}</p>

            <div className={styles.registration}>
              <Icon name="check" size={19} />
              Registration No. {person.registration}
            </div>

            <a href={links.call} className={`${ui.btn} ${ui.btnDark}`}>
              <Icon name="phone" size={19} />
              Contact the clinic
            </a>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Professional profile</h2>
          <p>
            {person.bio ||
              "Professional biography will be published after verification."}
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span>Professional qualification</span>
              <strong>{person.qualification}</strong>
            </div>

            <div className={styles.infoCard}>
              <span>Registration number</span>
              <strong>{person.registration}</strong>
            </div>

            <div className={styles.infoCard}>
              <span>Professional experience</span>
              <strong>{person.experience || "To be updated"}</strong>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Areas of expertise</h2>

          {person.specializations.length ? (
            <ul className={styles.tags}>
              {person.specializations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Specializations will be added after verification.</p>
          )}
        </section>

        <section className={styles.section}>
          <h2>Education & qualifications</h2>

          {person.education.length ? (
            <div className={styles.documentList}>
              {person.education.map((item, index) => (
                <article key={`${item.degree}-${index}`}>
                  <h3>{item.degree}</h3>
                  <p>{item.institution}</p>
                  <span>{item.year}</span>
                </article>
              ))}
            </div>
          ) : (
            <p>Additional education details will be published after verification.</p>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.certificateHeading}>
            <div>
              <span className={styles.eyebrow}>VERIFIED DOCUMENTS</span>
              <h2>Certificates & credentials</h2>
              <p>
                Professional certificates and qualification documents.
              </p>
            </div>
            <Icon name="check" size={28} />
          </div>

          {person.certificates.length ? (
            <div className={styles.certificateGrid}>
              {person.certificates.map((certificate) => (
                <article
                  className={styles.certificate}
                  key={certificate.file}
                >
                  <div className={styles.documentIcon}>
                    <Icon name="book" size={30} />
                  </div>

                  <h3>{certificate.title}</h3>
                  <p>{certificate.issuer}</p>
                  <span>{certificate.year}</span>

                  <a
                    href={certificate.file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View certificate <Icon name="arrow" size={16} />
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyCertificates}>
              <Icon name="book" size={30} />
              <h3>Certificates will be published here</h3>
              <p>
                The clinic has not yet added the specialist&apos;s
                certificate documents.
              </p>
            </div>
          )}
        </section>

        <section className={styles.contact}>
          <h2>Want to consult our specialist?</h2>
          <p>
            Contact {site.name} to enquire about an assessment or appointment.
          </p>
          <a href={links.call} className={`${ui.btn} ${ui.btnHighlight}`}>
            <Icon name="phone" size={19} />
            Call {site.phone.display}
          </a>
        </section>
      </div>
    </main>
  );
}
