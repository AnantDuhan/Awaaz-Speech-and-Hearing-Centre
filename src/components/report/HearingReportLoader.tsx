"use client";

import dynamic from "next/dynamic";

// The tool draws on a <canvas> and uses today's date and a random report number,
// so it only renders in the browser — never during the static build.
const HearingReportTool = dynamic(
  () => import("./HearingReportTool").then((module) => module.HearingReportTool),
  {
    ssr: false,
    loading: () => <p>Loading the report tool…</p>,
  },
);

export function HearingReportLoader() {
  return <HearingReportTool />;
}
