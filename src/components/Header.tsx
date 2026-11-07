"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks, site } from "@/content/site";
import ui from "@/styles/ui.module.css";
import { Icon } from "./Icon";
import { LogoMark } from "./Logo";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={`${ui.container} ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={close}>
          <LogoMark />
          <span className={styles.brandText}>
            <strong>{site.name}</strong>
            <span>{site.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main" className={styles.nav} data-open={open}>
          <ul id="main-menu" className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link
            href="/#contact"
            className={`${ui.btn} ${ui.btnSmall} ${ui.btnHighlight} ${styles.bookButton}`}
          >
            Book a visit
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="main-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} />
            <span className={ui.srOnly}>{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
