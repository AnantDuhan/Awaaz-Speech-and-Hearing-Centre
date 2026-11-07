import { whatsappLink } from "@/content/site";
import { Icon } from "./Icon";
import styles from "./WhatsAppButton.module.css";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
    >
      <Icon name="chat" size={26} strokeWidth={2} />
      <span className={styles.label}>Chat on WhatsApp</span>
    </a>
  );
}
