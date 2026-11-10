"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { fullAddress, site, team } from "@/content/site";
import {
  ALL_FREQUENCIES,
  BC_FREQUENCIES,
  type Conduction,
  type Ear,
  emptyThresholds,
  formatDb,
  isInvalid,
  MAX_DB,
  MIN_DB,
  type PointStatus,
  pureToneAverage,
  SCALES,
  type Scale,
  STATUS_OPTIONS,
  type Thresholds,
} from "@/lib/audiometry";
import { jpegToPdf } from "@/lib/pdf";
import { type ClinicInfo, drawReport, type ReportData } from "@/lib/renderReport";
import ui from "@/styles/ui.module.css";
import styles from "./HearingReportTool.module.css";

const CLINIC: ClinicInfo = { name: site.name, address: fullAddress, phone: site.phone.display };
const REPORT_PREFIX = "AWZ";
const EARS: Ear[] = ["left", "right"];
const EAR_LABEL: Record<Ear, string> = { right: "Right ear", left: "Left ear" };
const KIND_LABEL: Record<Conduction, string> = { ac: "air conduction", bc: "bone conduction" };

const isPlaceholder = (value: string) => /\[.*\]/.test(value);

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function newReportNo() {
  const date = today().replace(/-/g, "").slice(2);
  return `${REPORT_PREFIX}-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function blankReport(): ReportData {
  const member = team.find((person) => !isPlaceholder(person.name));
  const real = (value: string | undefined) => (value && !isPlaceholder(value) ? value : "");
  return {
    reportNo: newReportNo(),
    testDate: today(),
    patient: { name: "", age: "", sex: "", id: "", referredBy: "", mobile: "", address: "" },
    scaleId: "who",
    thresholds: emptyThresholds(),
    audiologist: {
      name: "Pushpak Kumar",
      qualification: real(member?.qualification),
      registration: "A81403",
    },
  };
}

function setPoints(
  thresholds: Thresholds,
  ear: Ear,
  kind: Conduction,
  values: Record<number, number | [number, PointStatus]>,
) {
  for (const [hz, entry] of Object.entries(values)) {
    const [db, status] = Array.isArray(entry) ? entry : [entry, "" as PointStatus];
    thresholds[ear][kind][Number(hz)] = { value: String(db), status };
  }
}

/** Clearly fictional data, so the doctor can see a filled-in report. */
function exampleReport(): ReportData {
  const report = blankReport();
  report.patient = {
    name: "Sample Patient",
    age: "45",
    sex: "Male",
    id: "DEMO-001",
    referredBy: "Dr. Example (ENT)",
    mobile: "9876543210",
    address: "Sample address",
  };
  const t = report.thresholds;
  setPoints(t, "right", "ac", { 250: 40, 500: 40, 1000: 45, 2000: 45, 4000: 50, 8000: 55 });
  setPoints(t, "right", "bc", { 250: 10, 500: [15, "masked"], 1000: [15, "masked"], 2000: [20, "masked"], 4000: 25 });
  setPoints(t, "left", "ac", { 250: 15, 500: 15, 1000: 20, 2000: 20, 4000: 25, 8000: 30 });
  setPoints(t, "left", "bc", { 500: 10, 1000: 15, 2000: 15, 4000: 20 });
  return report;
}

/** Keeps letters from any script (so Hindi names survive), drops everything else. */
function fileSlug(text: string) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "patient"
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}

export function HearingReportTool() {
  const [data, setData] = useState<ReportData>(blankReport);
  const [fontFamily] = useState(
    () => getComputedStyle(document.body).fontFamily || "system-ui, sans-serif",
  );
  const [fontsReady, setFontsReady] = useState(false);
  const [status, setStatus] = useState("");
  const [canShare] = useState(() => {
    try {
      return (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [new File([""], "report.pdf", { type: "application/pdf" })] })
      );
    } catch {
      return false;
    }
  });
  const previewRef = useRef<HTMLCanvasElement>(null);

  const update = (change: (draft: ReportData) => void) =>
    setData((previous) => {
      const next = structuredClone(previous);
      change(next);
      return next;
    });

  // Wait for the site font so the report doesn't render in a fallback font.
  useEffect(() => {
    let cancelled = false;
    Promise.all([600, 700, 800, 900].map((weight) => document.fonts.load(`${weight} 16px ${fontFamily}`)))
      .then(() => document.fonts.ready)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fontFamily]);

  // Redraw the preview after every change.
  useEffect(() => {
    if (!fontsReady) return;
    const frame = requestAnimationFrame(() => {
      const canvas = previewRef.current;
      if (!canvas) return;
      drawReport(canvas, data, CLINIC, { scale: 1, fontFamily });
    });
    return () => cancelAnimationFrame(frame);
  }, [data, fontsReady, fontFamily]);

  const scale: Scale = SCALES[data.scaleId];
  const pta = {
    right: pureToneAverage(data.thresholds, "right", scale),
    left: pureToneAverage(data.thresholds, "left", scale),
  };

  const frequencies = ALL_FREQUENCIES;

  const invalidCount = EARS.reduce(
    (count, ear) =>
      count +
      Object.values(data.thresholds[ear].ac).filter(isInvalid).length +
      Object.values(data.thresholds[ear].bc).filter(isInvalid).length,
    0,
  );

  /** Draws the A4 landscape report at 300 dpi and returns it as a JPEG. */
  const renderJpeg = () =>
    new Promise<{ blob: Blob; width: number; height: number } | null>((resolve) => {
      const canvas = document.createElement("canvas");
      drawReport(canvas, data, CLINIC, { scale: 2, fontFamily });
      canvas.toBlob(
        (blob) => resolve(blob ? { blob, width: canvas.width, height: canvas.height } : null),
        "image/jpeg",
        0.9,
      );
    });

  const fileName = (extension: string) =>
    `hearing-report-${fileSlug(data.patient.name)}-${data.testDate || "undated"}.${extension}`;

  const makeFile = async (format: "pdf" | "jpg") => {
    const image = await renderJpeg();
    if (!image) return null;
    if (format === "jpg") return new File([image.blob], fileName("jpg"), { type: "image/jpeg" });
    const bytes = new Uint8Array(await image.blob.arrayBuffer());
    const pdf = jpegToPdf(bytes, image.width, image.height, {
      title: `Hearing test report${data.patient.name.trim() ? ` — ${data.patient.name.trim()}` : ""}`,
      author: site.name,
    });
    return new File([pdf], fileName("pdf"), { type: "application/pdf" });
  };

  const download = async (format: "pdf" | "jpg") => {
    const file = await makeFile(format);
    if (!file) {
      setStatus("Sorry, the report couldn't be created in this browser.");
      return;
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus(`Saved ${file.name}`);
  };

  const share = async () => {
    const file = await makeFile("pdf");
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "Hearing test report" });
      setStatus("Shared.");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setStatus("Sharing didn't work — download the PDF instead.");
    }
  };

  const startNew = () => {
    if (window.confirm("Clear this report and start a new one?")) {
      setData(blankReport());
      setStatus("Started a new report.");
    }
  };

  const ptaSummary = (ear: Ear) => {
    const result = pta[ear];
    return result.ok
      ? `${formatDb(result.value)} dB HL · ${result.degree}`
      : `Not calculated yet (${result.reason})`;
  };

  return (
    <div className={styles.layout}>
      <div className={styles.form}>
        <p className={styles.privacy} role="note">
          <strong>Private by design:</strong> nothing you type is saved or sent anywhere. The report is
          drawn in this browser and disappears when you close the page. Downloaded images are saved
          on this device.
        </p>

        <div className={styles.toolbar}>
          <button type="button" className={styles.secondary} onClick={() => setData(exampleReport())}>
            Load example
          </button>
          <button type="button" className={styles.secondary} onClick={startNew}>
            Start a new report
          </button>
        </div>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Patient</legend>
          <div className={styles.grid}>
            <Field label="Patient name">
              <input
                className={styles.input}
                value={data.patient.name}
                maxLength={60}
                autoComplete="off"
                onChange={(e) => update((d) => void (d.patient.name = e.target.value))}
              />
            </Field>
            <Field label="Age" hint="Years, or e.g. “18 months”">
              <input
                className={styles.input}
                value={data.patient.age}
                maxLength={20}
                autoComplete="off"
                onChange={(e) => update((d) => void (d.patient.age = e.target.value))}
              />
            </Field>
            <Field label="Sex">
              <select
                className={styles.input}
                value={data.patient.sex}
                onChange={(e) => update((d) => void (d.patient.sex = e.target.value))}
              >
                <option value="">—</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Patient ID">
              <input
                className={styles.input}
                value={data.patient.id}
                maxLength={30}
                autoComplete="off"
                onChange={(e) => update((d) => void (d.patient.id = e.target.value))}
              />
            </Field>
            <Field label="Date of test">
              <input
                className={styles.input}
                type="date"
                value={data.testDate}
                onChange={(e) => update((d) => void (d.testDate = e.target.value))}
              />
            </Field>
            <Field label="Referred by">
              <input
                className={styles.input}
                value={data.patient.referredBy}
                maxLength={50}
                autoComplete="off"
                onChange={(e) => update((d) => void (d.patient.referredBy = e.target.value))}
              />
            </Field>
          </div>
          <div className={styles.grid}>
            <Field label="Mobile number">
              <input className={styles.input} type="tel" value={data.patient.mobile} maxLength={20} autoComplete="tel" onChange={(e) => update((d) => void (d.patient.mobile = e.target.value))} />
            </Field>
            <Field label="Address">
              <input className={styles.input} value={data.patient.address} maxLength={120} autoComplete="street-address" onChange={(e) => update((d) => void (d.patient.address = e.target.value))} />
            </Field>
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Pure-tone thresholds (dB HL)</legend>
          <p className={styles.help}>
            Type each threshold ({MIN_DB} to {MAX_DB}). Use the small menu for masking (M), no
            response (NR) or both. Leave untested frequencies empty.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={ui.srOnly}>Pure-tone thresholds for each ear in dB HL</caption>
              <thead>
                <tr>
                  <th scope="col">Hz</th>
                  <th scope="col" className={styles.left}>Left AC</th>
                  <th scope="col" className={styles.left}>Left BC</th>
                  <th scope="col" className={styles.right}>Right AC</th>
                  <th scope="col" className={styles.right}>Right BC</th>
                </tr>
              </thead>
              <tbody>
                {frequencies.map((hz) => (
                  <tr key={hz}>
                    <th scope="row">{hz}</th>
                    {(["left", "right"] as Ear[]).flatMap((ear) =>
                      (["ac", "bc"] as Conduction[]).map((kind) => {
                        if (kind === "bc" && !BC_FREQUENCIES.includes(hz)) {
                          return (
                            <td key={`${ear}-${kind}`} className={styles.na}>
                              <span aria-label="Not tested">—</span>
                            </td>
                          );
                        }
                        const point = data.thresholds[ear][kind][hz];
                        const name = `${EAR_LABEL[ear]} ${KIND_LABEL[kind]} at ${hz} Hz`;
                        return (
                          <td key={`${ear}-${kind}`}>
                            <div className={styles.cell}>
                              <input
                                type="number"
                                inputMode="numeric"
                                step={5}
                                min={MIN_DB}
                                max={MAX_DB}
                                className={styles.number}
                                value={point.value}
                                aria-label={`${name}, dB HL`}
                                aria-invalid={isInvalid(point)}
                                onChange={(e) =>
                                  update((d) => void (d.thresholds[ear][kind][hz].value = e.target.value))
                                }
                              />
                              <select
                                className={styles.statusSelect}
                                value={point.status}
                                aria-label={`${name}, response`}
                                onChange={(e) =>
                                  update(
                                    (d) =>
                                      void (d.thresholds[ear][kind][hz].status = e.target.value as PointStatus),
                                  )
                                }
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value} title={option.description}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        );
                      }),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalidCount > 0 ? (
            <p className={styles.warning} role="alert">
              {invalidCount} value{invalidCount === 1 ? " is" : "s are"} outside {MIN_DB} to {MAX_DB} dB HL
              and won&apos;t be plotted.
            </p>
          ) : null}

          <div className={styles.scale} role="radiogroup" aria-label="Hearing loss grading">
            <span className={styles.label}>Hearing loss grading</span>
            {[SCALES.who].map((option) => (
              <label key={option.id} className={styles.radio}>
                <input
                  type="radio"
                  name="scale"
                  value={option.id}
                  checked={data.scaleId === option.id}
                  onChange={() => update((d) => void (d.scaleId = option.id))}
                />
                <span>
                  <strong>{option.name}</strong> — PTA of{" "}
                  {option.frequencies.map((hz) => (hz >= 1000 ? `${hz / 1000}k` : hz)).join(", ")} Hz
                </span>
              </label>
            ))}
          </div>

          <dl className={styles.pta} aria-live="polite">
            {EARS.map((ear) => (
              <div key={ear}>
                <dt className={ear === "right" ? styles.right : styles.left}>{EAR_LABEL[ear]} PTA</dt>
                <dd>{ptaSummary(ear)}</dd>
              </div>
            ))}
          </dl>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Audiologist and report</legend>
          <div className={styles.grid}>
            <Field label="Name">
              <input
                className={styles.input}
                value="Pushpak Kumar"
                readOnly
                maxLength={50}
              />
            </Field>
            <Field label="Qualification">
              <input
                className={styles.input}
                value={data.audiologist.qualification}
                maxLength={50}
                onChange={(e) => update((d) => void (d.audiologist.qualification = e.target.value))}
              />
            </Field>
            <Field label="Registration no.">
              <input
                className={styles.input}
                value="A81403"
                readOnly
                maxLength={30}
              />
            </Field>
            <Field label="Report no.">
              <input
                className={styles.input}
                value={data.reportNo}
                maxLength={30}
                onChange={(e) => update((d) => void (d.reportNo = e.target.value))}
              />
            </Field>
          </div>
        </fieldset>
      </div>

      <aside className={styles.previewColumn} aria-labelledby="preview-title">
        <div className={styles.previewHead}>
          <h2 id="preview-title">Report preview</h2>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnSmall} ${ui.btnAccent} ${styles.action}`}
              disabled={!fontsReady}
              onClick={() => download("pdf")}
            >
              Download PDF
            </button>
            {canShare ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnSmall} ${styles.action} ${styles.actionOutline}`}
                disabled={!fontsReady}
                onClick={share}
              >
                Share PDF
              </button>
            ) : null}
          </div>
          <p className={styles.altDownload}>
            Need a picture instead?{" "}
            <button
              type="button"
              className={styles.linkButton}
              disabled={!fontsReady}
              onClick={() => download("jpg")}
            >
              Download as JPEG image
            </button>
          </p>
          <p className={styles.statusMessage} aria-live="polite">
            {status}
          </p>

        </div>
        <canvas
          ref={previewRef}
          className={styles.preview}
          role="img"
          aria-label="Preview of the hearing test report"
        />
      </aside>
    </div>
  );
}
