import Link from "next/link";
import type { Service } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { Icon } from "./Icon";
import styles from "./ServiceCard.module.css";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} className={styles.card}>
      <span className={`${styles.icon} ${ui.tone}`} data-tone={service.tone}>
        <Icon name={service.icon} />
      </span>
      <span className={styles.title}>{service.title}</span>
      <span className={styles.text}>{service.short}</span>
      <span className={styles.more}>
        Learn more <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
