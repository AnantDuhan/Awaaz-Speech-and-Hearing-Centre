import Link from "next/link";
import type { ReactNode } from "react";
import ui from "@/styles/ui.module.css";
import styles from "./PageIntro.module.css";

type Crumb = { label: string; href?: string };

type PageIntroProps = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  children?: ReactNode;
};

/** Navy banner at the top of inner pages, with breadcrumbs. */
export function PageIntro({ crumbs, eyebrow, title, children }: PageIntroProps) {
  return (
    <div className={styles.intro}>
      <div className={`${ui.container} ${styles.inner}`}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            {crumbs.map((crumb, index) => (
              <li key={crumb.label}>
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span aria-current={index === crumbs.length - 1 ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {children ? <div className={styles.lede}>{children}</div> : null}
      </div>
    </div>
  );
}
