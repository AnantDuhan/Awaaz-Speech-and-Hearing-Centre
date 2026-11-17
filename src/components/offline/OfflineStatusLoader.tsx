"use client";

import dynamic from "next/dynamic";

// Browser-only: it reads navigator.onLine and registers the service worker.
const OfflineStatus = dynamic(() => import("./OfflineStatus").then((module) => module.OfflineStatus), {
  ssr: false,
});

export function OfflineStatusLoader() {
  return <OfflineStatus />;
}
