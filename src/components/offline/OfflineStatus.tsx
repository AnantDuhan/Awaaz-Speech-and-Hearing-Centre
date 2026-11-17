"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./OfflineStatus.module.css";

// Registers the staff-tools service worker (scripts/offline/tools-sw.js) and says
// whether this device has an offline copy. Rendered only in the browser.

type State = "saving" | "ready" | "unavailable";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

export function OfflineStatus() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  const [supported] = useState(() => "serviceWorker" in navigator && "caches" in window);
  const [state, setState] = useState<State>(supported ? "saving" : "unavailable");

  useEffect(() => {
    // Never in `next dev`: a cached dev build would get in the way of live reloading.
    if (!supported || process.env.NODE_ENV !== "production") return;
    let cancelled = false;
    navigator.serviceWorker
      .register("/tools-sw.js", { scope: "/tools" })
      .then(() => navigator.serviceWorker.ready)
      .then(async () => {
        const names = await caches.keys();
        if (!cancelled) setState(names.some((name) => name.startsWith("aawaz-tools-")) ? "ready" : "saving");
      })
      .catch(() => {
        if (!cancelled) setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [supported]);

  if (process.env.NODE_ENV !== "production") return null;

  const [tone, text] = !online
    ? (["offline", "You're offline. The report tool still works on this device."] as const)
    : state === "ready"
      ? (["ready", "Works offline on this device"] as const)
      : state === "saving"
        ? (["saving", "Saving a copy for offline use…"] as const)
        : (["unavailable", "This browser can't save an offline copy (a private window, perhaps)."] as const);

  return (
    <p className={styles.status} data-tone={tone} role="status">
      <span className={styles.dot} aria-hidden="true" />
      {text}
    </p>
  );
}
