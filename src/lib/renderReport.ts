/**
 * Draws the hearing test report onto a <canvas>, entirely in the browser.
 * The page is A4 landscape (1754 × 1240 at 150 dpi); downloads are drawn at 2× (300 dpi).
 *
 * Audiogram conventions (ASHA): right ear red, left ear blue; 20 dB on the
 * y-axis spans the same distance as one octave on the x-axis.
 *   Right: AC ○, AC masked △, BC <, BC masked [
 *   Left:  AC ✕, AC masked □, BC >, BC masked ]
 *   No response: an arrow pointing down and away from the symbol.
 */
import {
  ALL_FREQUENCIES,
  BC_FREQUENCIES,
  type Ear,
  formatDb,
  MAX_DB,
  MIN_DB,
  OCTAVE_FREQUENCIES,
  pureToneAverage,
  readPoint,
  SCALES,
  type Scale,
  type Thresholds,
} from "./audiometry";
export const PAGE = { width: 1754, height: 1240 };
export type ReportData = {
  reportNo: string;
  testDate: string;
  patient: {
    name: string;
    age: string;
    sex: string;
    id: string;
    referredBy: string;
    mobile: string;
    address: string;
  };
  scaleId: Scale["id"];
  thresholds: Thresholds;
  audiologist: { name: string; qualification: string; registration: string };
};
export type ClinicInfo = { name: string; address: string; phone: string };
const C = {
  navy: "#0B1B3A",
  ink: "#1F1D36",
  muted: "#4B4864",
  faint: "#5E6278",
  grid: "#DDE2EC",
  gridStrong: "#A9B2C8",
  tint: "#F6F8FD",
  band: "#ECF6F0",
  yellow: "#FFD23F",
  white: "#FFFFFF",
};
const EAR_COLOR: Record<Ear, string> = { right: "#C81E1E", left: "#1D4ED8" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}
export function drawReport(
  canvas: HTMLCanvasElement,
  data: ReportData,
  clinic: ClinicInfo,
  options: { scale: number; fontFamily: string },
  logoImage: HTMLImageElement,
): { overflow: boolean } {
  const W = PAGE.width;
  const H = PAGE.height;
  const M = 58;
  const logoWidth = (68 * logoImage.naturalWidth) / logoImage.naturalHeight;
  canvas.width = W * options.scale;
  canvas.height = H * options.scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { overflow: false };
  ctx.setTransform(options.scale, 0, 0, options.scale, 0, 0);
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, H);
  const scale = SCALES[data.scaleId];
  const pta = {
    right: pureToneAverage(data.thresholds, "right", scale),
    left: pureToneAverage(data.thresholds, "left", scale),
  };
// ---------------- text helpers ----------------
  const setFont = (size: number, weight: number) => {
    ctx.font = `${weight} ${size}px ${options.fontFamily}`;
  };
  const setSpacing = (px: number) => {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px}px`;
  };
  const write = (
    text: string,
    x: number,
    y: number,
    size: number,
    weight: number,
    color: string,
    align: CanvasTextAlign = "left",
    spacing = 0,
  ) => {
    setFont(size, weight);
    setSpacing(spacing);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x, y);
    setSpacing(0);
  };
  const fit = (text: string, maxWidth: number, size: number, weight: number) => {
    setFont(size, weight);
    if (ctx.measureText(text).width <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
    return `${cut.trimEnd()}…`;
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  const orDash = (value: string) => (value.trim() ? value.trim() : "—");
// ---------------- header ----------------
  ctx.save();
  ctx.drawImage(logoImage, M - 4, 40, logoWidth, 68);
  ctx.restore();
  const headerTextX = M + 82;
  write(fit(clinic.name, 720, 30, 900), headerTextX, 84, 30, 900, C.navy);
  write(fit(`${clinic.address}  ·  ${clinic.phone}`, 1080, 15, 600), headerTextX, 112, 15, 600, C.muted);
  write("REPORT NO.", W - M, 74, 12, 800, C.faint, "right", 1.2);
  write(fit(orDash(data.reportNo), 220, 18, 800), W - M, 100, 18, 800, C.ink, "right");
  ctx.fillStyle = C.yellow;
  ctx.fillRect(M, 134, W - 2 * M, 6);
  write("AUDIOLOGICAL EVALUATION REPORT", M, 186, 24, 900, C.navy, "left", 1.5);
// ---------------- patient details ----------------
  const boxTop = 190;
  const boxHeight = 104;
  roundRect(M, boxTop, W - 2 * M, boxHeight, 16);
  ctx.fillStyle = C.tint;
  ctx.fill();
  const age = data.patient.age.trim();
  const ageText = age ? (/^\d+$/.test(age) ? `${age} yrs` : age) : "—";
// Four columns across two compact rows.
  const cells: { label: string; value: string; column: number; row: number; span: number }[] = [
    { label: "Patient name", value: orDash(data.patient.name), column: 0, row: 0, span: 1 },
    { label: "Age / Sex", value: `${ageText} / ${orDash(data.patient.sex)}`, column: 1, row: 0, span: 1 },
    { label: "Patient ID", value: orDash(data.patient.id), column: 2, row: 0, span: 1 },
    { label: "Date of test", value: data.testDate ? formatDate(data.testDate) : "—", column: 3, row: 0, span: 1 },
    { label: "Referred by", value: orDash(data.patient.referredBy), column: 0, row: 1, span: 1 },
    { label: "Mobile", value: orDash(data.patient.mobile), column: 1, row: 1, span: 1 },
    { label: "Address", value: orDash(data.patient.address), column: 2, row: 1, span: 2 },
  ];
  const cellWidth = (W - 2 * M - 48) / 4;
  for (const cell of cells) {
    const x = M + 24 + cell.column * cellWidth;
    const y = boxTop + 24 + cell.row * 42;
    write(cell.label.toUpperCase(), x, y, 11.5, 800, C.faint, "left", 1);
    write(fit(cell.value, cellWidth * cell.span - 20, 16, 800), x, y + 20, 16, 800, C.ink);
  }
// ---------------- audiograms ----------------
  const symbol = (ear: Ear, kind: "ac" | "bc", masked: boolean, x: number, y: number, r: number) => {
    ctx.save();
    ctx.strokeStyle = EAR_COLOR[ear];
    ctx.fillStyle = C.white;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    if (kind === "ac" && ear === "right" && !masked) {
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (kind === "ac" && ear === "right") {
      ctx.moveTo(x, y - r * 1.15);
      ctx.lineTo(x + r * 1.05, y + r * 0.75);
      ctx.lineTo(x - r * 1.05, y + r * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (kind === "ac" && !masked) {
      const d = r * 0.8;
      ctx.moveTo(x - d, y - d);
      ctx.lineTo(x + d, y + d);
      ctx.moveTo(x + d, y - d);
      ctx.lineTo(x - d, y + d);
      ctx.stroke();
    } else if (kind === "ac") {
      const d = r * 0.85;
      ctx.rect(x - d, y - d, 2 * d, 2 * d);
      ctx.fill();
      ctx.stroke();
    } else {
// Bone conduction: "<" / "[" for the right ear, ">" / "]" for the left.
      const dir = ear === "right" ? -1 : 1;
      const w = r * 0.6;
      if (!masked) {
        ctx.moveTo(x + dir * w, y - r);
        ctx.lineTo(x - dir * w, y);
        ctx.lineTo(x + dir * w, y + r);
      } else {
        ctx.moveTo(x + dir * w, y - r);
        ctx.lineTo(x - dir * w, y - r);
        ctx.lineTo(x - dir * w, y + r);
        ctx.lineTo(x + dir * w, y + r);
      }
      ctx.stroke();
    }
    ctx.restore();
  };
  const noResponseArrow = (ear: Ear, x: number, y: number, r: number) => {
    const dir = ear === "right" ? -1 : 1;
    const sx = x + dir * r * 0.75;
    const sy = y + r * 0.75;
    const ex = sx + dir * 15;
    const ey = sy + 15;
    ctx.save();
    ctx.strokeStyle = EAR_COLOR[ear];
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    line(sx, sy, ex, ey);
    ctx.beginPath();
    ctx.moveTo(ex - dir * 7, ey);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex, ey - 7);
    ctx.stroke();
    ctx.restore();
  };
  const panelTop = 312;
  const panelGap = 54;
  const panelWidth = (W - 2 * M - panelGap) / 2;
  let panelBottom = 0;
  const drawAudiogram = (ear: Ear, px: number) => {
    const color = EAR_COLOR[ear];
    const availableWidth = panelWidth - 58 - 8;
    const unit = Math.min(availableWidth / 7, 70); // preserve 20 dB per octave on landscape paper
    const width = unit * 7;
    const left = px + (panelWidth - width) / 2;
    const top = panelTop + 34;
    const height = unit * ((MAX_DB - MIN_DB) / 20);
    const lowest = Math.log2(125) - 0.5;
    const xFor = (hz: number) => left + (Math.log2(hz) - lowest) * unit;
    const yFor = (db: number) => top + ((db - MIN_DB) / 20) * unit;
    write(ear === "right" ? "RIGHT EAR" : "LEFT EAR", left, panelTop + 18, 17, 900, color, "left", 1.2);
    const result = pta[ear];
    if (result.ok) {
      write(`PTA ${formatDb(result.value)} dB HL`, left + width, panelTop + 18, 15, 800, C.ink, "right");
    }
// Normal range band
    ctx.fillStyle = C.band;
    ctx.fillRect(left, yFor(MIN_DB), width, yFor(scale.normalLimit) - yFor(MIN_DB));
// Grid: solid horizontal and vertical lines.
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    for (let db = MIN_DB; db <= MAX_DB; db += 10) {
      ctx.strokeStyle = db === 0 ? C.gridStrong : C.grid;
      line(left, yFor(db), left + width, yFor(db));
      write(String(db), left - 10, yFor(db) + 4.5, 12.5, 700, C.muted, "right");
    }
    for (const hz of ALL_FREQUENCIES) {
      const octave = OCTAVE_FREQUENCIES.includes(hz);
      const emphasized = hz === 750 || hz === 1500 || hz === 3000 || hz === 6000;
      ctx.strokeStyle = octave || emphasized ? C.gridStrong : C.grid;
      ctx.lineWidth = emphasized ? 1.5 : 1;
      ctx.setLineDash([]);
      line(xFor(hz), top, xFor(hz), top + height);
      const labelY = top + height + (ALL_FREQUENCIES.indexOf(hz) % 2 === 0 ? 20 : 36);
      write(String(hz), xFor(hz), labelY, 12, 700, C.muted, "center");
    }
    ctx.strokeStyle = C.gridStrong;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left, top, width, height);
    write("Frequency (Hz)", left + width / 2, top + height + 59, 14, 800, C.ink, "center");
    ctx.save();
    ctx.translate(px + 12, top + height / 2);
    ctx.rotate(-Math.PI / 2);
    write("Hearing level (dB HL)", 0, 0, 12.5, 800, C.ink, "center");
    ctx.restore();
// Air conduction: connect responses in frequency order; never connect to "no response".
    const side = data.thresholds[ear];
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    let previous: { x: number; y: number } | null = null;
    for (const hz of ALL_FREQUENCIES) {
      const point = readPoint(side.ac[hz]);
      if (!point) continue;
      if (point.noResponse) {
        previous = null;
        continue;
      }
      const current = { x: xFor(hz), y: yFor(point.db) };
      if (previous) line(previous.x, previous.y, current.x, current.y);
      previous = current;
    }
    ctx.restore();
    const r = 10.5;
    for (const hz of ALL_FREQUENCIES) {
      const point = readPoint(side.ac[hz]);
      if (!point) continue;
      symbol(ear, "ac", point.masked, xFor(hz), yFor(point.db), r);
      if (point.noResponse) noResponseArrow(ear, xFor(hz), yFor(point.db), r);
    }
    const offset = ear === "right" ? -15 : 15;
    for (const hz of BC_FREQUENCIES) {
      const point = readPoint(side.bc[hz]);
      if (!point) continue;
      symbol(ear, "bc", point.masked, xFor(hz) + offset, yFor(point.db), r);
      if (point.noResponse) noResponseArrow(ear, xFor(hz) + offset, yFor(point.db), r);
    }
  // Clinical symbol legend for this ear.
  const legendY = top + height + 96;
  const items: { kind: "ac" | "bc" | "nr"; masked: boolean; label: string }[] = [
    { kind: "ac", masked: false, label: ear === "right" ? "ACR" : "ACL" },
    { kind: "bc", masked: false, label: ear === "right" ? "BCR" : "BCL" },
    { kind: "ac", masked: true, label: ear === "right" ? "ACRM" : "ACLM" },
    { kind: "bc", masked: true, label: ear === "right" ? "BCRM" : "BCLM" },
    { kind: "nr", masked: false, label: "NR" },
  ];

  setFont(12, 700);
  const labelWidths = items.map(({ label }) => ctx.measureText(label).width);
  const itemWidths = items.map(({ kind }, index) => (kind === "nr" ? 28 : 20) + labelWidths[index]);
  const itemGap = 12;
  const totalWidth = itemWidths.reduce((total, itemWidth) => total + itemWidth, 0) + itemGap * (items.length - 1);
  let legendX = left + (width - totalWidth) / 2;

  for (const [index, item] of items.entries()) {
    const cx = legendX + 8;
    const cy = legendY - 5;
    const labelOffset = item.kind === "nr" ? 28 : 20;

    if (item.kind === "nr") {
      noResponseArrow(
        ear,
        ear === "right" ? cx + 12 : cx - 8,
        cy - 9,
        5,
      );
    } else {
      symbol(ear, item.kind, item.masked, cx, cy, 6.5);
    }

    write(item.label, legendX + labelOffset, legendY, 12, 700, C.muted);
    legendX += itemWidths[index] + itemGap;
  }

  panelBottom = Math.max(panelBottom, legendY);
  };
  drawAudiogram("left", M);
  drawAudiogram("right", M + panelWidth + panelGap);
// ---------------- results table ----------------
  const ptaText = (ear: Ear) => {
    const result = pta[ear];
    return result.ok ? `${formatDb(result.value)} dB HL` : "—";
  };
  const degreeText = (ear: Ear) => {
    const result = pta[ear];
    return result.ok ? result.degree : "—";
  };

  const rows: [string, string, string][] = [
    ["Pure-tone average (PTA)", ptaText("left"), ptaText("right")],
    ["Degree of hearing loss", degreeText("left"), degreeText("right")],
  ];
  const tableTop = panelBottom + 12;
  const rowHeight = 30;
  const labelWidth = 400;
  const valueWidth = (W - 2 * M - labelWidth) / 2;
  roundRect(M, tableTop, W - 2 * M, rowHeight, 10);
  ctx.fillStyle = C.tint;
  ctx.fill();
  write("RESULT", M + 16, tableTop + 20, 12, 800, C.faint, "left", 1);
  write("LEFT EAR", M + labelWidth + 16, tableTop + 20, 12.5, 900, EAR_COLOR.left, "left", 1);
  write("RIGHT EAR", M + labelWidth + valueWidth + 16, tableTop + 20, 12.5, 900, EAR_COLOR.right, "left", 1);
  rows.forEach(([label, left, right], i) => {
    const y = tableTop + rowHeight * (i + 1);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 2.8;
    line(M, y + rowHeight, W - M, y + rowHeight);
    write(fit(label, labelWidth - 28, 15, 700), M + 16, y + 21, 15, 700, C.muted);
    const notCalculated = (v: string) => v.startsWith("Not calculated");
    write(
      fit(left, valueWidth - 28, notCalculated(left) ? 13.5 : 16, notCalculated(left) ? 700 : 800),
      M + labelWidth + 16,
      y + 21,
      notCalculated(left) ? 13.5 : 16,
      notCalculated(left) ? 700 : 800,
      notCalculated(left) ? C.faint : C.ink,
    );
    write(
      fit(right, valueWidth - 28, notCalculated(right) ? 13.5 : 16, notCalculated(right) ? 700 : 800),
      M + labelWidth + valueWidth + 16,
      y + 21,
      notCalculated(right) ? 13.5 : 16,
      notCalculated(right) ? 700 : 800,
      notCalculated(right) ? C.faint : C.ink,
    );
  });
// ---------------- signature & footer ----------------
  const signatureTop = H - 168;
  const sigLeft = W - M - 330;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.2;
  line(sigLeft, signatureTop + 48, W - M, signatureTop + 48);
  write("Signature & Stamp", W - M, signatureTop + 65, 11.5, 700, C.faint, "right");
  write(fit(orDash(data.audiologist.name), 330, 17, 800), W - M, signatureTop + 88, 17, 800, C.ink, "right");
  write(fit(orDash(data.audiologist.qualification), 330, 14, 600), W - M, signatureTop + 108, 14, 600, C.muted, "right");
  write(
    fit(`Reg. no. ${orDash(data.audiologist.registration)}`, 330, 14, 600),
    W - M,
    signatureTop + 128,
    14,
    600,
    C.muted,
    "right",
  );
  return { overflow: false };
}
