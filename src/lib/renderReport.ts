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
export type ClinicInfo = {
  name: string;
  /** Shown above the audiologist's name, top right. */
  role: string;
  /** Up to four lines fit under the clinic name. */
  branches: { label: string; address: string }[];
  phone: string;
  email: string;
};
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
/** dd/mm/yyyy, as on the clinic's printed form. */
export function formatDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
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
// ---------------- letterhead (laid out like the clinic's printed form) ----------------
  const logoSize = 124;
  const logoWidth = (logoSize * logoImage.naturalWidth) / logoImage.naturalHeight;
  ctx.drawImage(logoImage, M, 36, logoWidth, logoSize);
  const headerTextX = M + logoWidth + 24;
  const rightBlockWidth = 340;
  const headerTextWidth = W - M - rightBlockWidth - 40 - headerTextX;
  write(fit(clinic.name, headerTextWidth, 40, 900), headerTextX, 78, 40, 900, C.navy);
  // Branches: labels in one column, a colon, then the address.
  setFont(14.5, 800);
  const branchLabelWidth = Math.max(0, ...clinic.branches.map((b) => ctx.measureText(b.label).width)) + 12;
  clinic.branches.slice(0, 4).forEach((branch, i) => {
    const y = 108 + i * 20;
    write(branch.label, headerTextX, y, 14.5, 800, C.ink);
    write(":", headerTextX + branchLabelWidth, y, 14.5, 800, C.ink);
    const addressX = headerTextX + branchLabelWidth + 14;
    write(fit(branch.address, headerTextX + headerTextWidth - addressX, 14.5, 600), addressX, y, 14.5, 600, C.muted);
  });
  // Audiologist and contact details, right-aligned; the CRR no. lines up with the last branch.
  const R = W - M;
  write(clinic.role.toUpperCase(), R, 58, 12, 800, C.faint, "right", 1.2);
  write(fit(orDash(data.audiologist.name), rightBlockWidth, 24, 900), R, 88, 24, 900, C.navy, "right");
  write(fit(`Mob. ${clinic.phone}`, rightBlockWidth, 15.5, 700), R, 114, 15.5, 700, C.ink, "right");
  write(fit(`Email: ${clinic.email}`, rightBlockWidth, 15, 600), R, 136, 15, 600, C.muted, "right");
  write(fit(`CRR No. ${orDash(data.audiologist.registration)}`, rightBlockWidth, 15.5, 800), R, 168, 15.5, 800, C.ink, "right");
  ctx.fillStyle = C.yellow;
  ctx.fillRect(M, 182, W - 2 * M, 5);
  // Title: centred and underlined, report number on the right of the same line.
  const titleY = 228;
  write("AUDIOGRAM", W / 2, titleY, 28, 900, C.navy, "center", 2);
  setFont(28, 900);
  const titleWidth = ctx.measureText("AUDIOGRAM").width + 2 * 8; // 9 letters × 2px spacing, minus the trailing gap
  ctx.fillStyle = C.navy;
  ctx.fillRect(W / 2 - titleWidth / 2, titleY + 7, titleWidth, 2.5);
  write(fit(`Report No. ${orDash(data.reportNo)}`, 320, 14, 700), R, titleY, 14, 700, C.muted, "right");
// ---------------- patient details: one bordered row, as on the printed form ----------------
  const boxTop = 246;
  const boxHeight = 64;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(M, boxTop, W - 2 * M, boxHeight);
  const age = data.patient.age.trim();
  const sex = data.patient.sex.trim();
  const gender = sex === "Male" ? "M" : sex === "Female" ? "F" : sex;
  const ageGender = [age && /^\d+$/.test(age) ? `${age} Yrs.` : age, gender].filter(Boolean).join("/") || "—";
  const referredBy = data.patient.referredBy.trim();
  const fields: { label: string; value: string; weight: number }[] = [
    { label: "C. R. No.", value: orDash(data.patient.id), weight: 1 },
    { label: "Patient's Name", value: orDash(data.patient.name), weight: 1.7 },
    { label: "Age/G", value: ageGender, weight: 1 },
    { label: "Address", value: orDash(data.patient.address), weight: 1.7 },
    { label: "Mobile No.", value: orDash(data.patient.mobile), weight: 1.1 },
    { label: "Date", value: data.testDate ? formatDate(data.testDate) : "—", weight: 0.9 },
    // Not on the printed form, so it only appears when staff fill it in.
    ...(referredBy ? [{ label: "Referred By", value: referredBy, weight: 1.3 }] : []),
    { label: "Doctor Name", value: orDash(data.audiologist.name), weight: 1.2 },
  ];
  const fieldsWidth = W - 2 * M - 48;
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  let fieldX = M + 24;
  for (const field of fields) {
    const fieldWidth = (fieldsWidth * field.weight) / totalWeight;
    write(field.label, fieldX, boxTop + 26, 15, 800, C.navy);
    write(fit(field.value, fieldWidth - 16, 16, 600), fieldX, boxTop + 50, 16, 600, C.ink);
    fieldX += fieldWidth;
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
  // The bottom strip holds the results table (left) and the signature (right),
  // so the audiograms get all the height between the patient box and that strip.
  const signatureTop = H - 168;
  const panelTop = 322;
  const panelGap = 54;
  const panelWidth = (W - 2 * M - panelGap) / 2;
  const chartTop = panelTop + 34;
  const belowChart = 86; // frequency labels, axis title and symbol legend
  const chartBottomLimit = signatureTop - 22 - belowChart;
  // Chart height in octaves (ASHA: 20 dB on the y-axis = one octave on the x-axis).
  const dbOctaves = (MAX_DB - MIN_DB) / 20;
  // The grid is 14 equal columns, each half an octave wide (half an octave of
  // margin either side of 125 Hz and 8000 Hz). 750, 1500, 3000 and 6000 Hz sit
  // midway between their octaves, as on printed audiogram forms. A column is as
  // wide as a 10 dB row is tall, so every grid box is the same square.
  const COLUMNS = 14;
  const unit = Math.min((panelWidth - 66) / 7, (chartBottomLimit - chartTop) / dbOctaves);
  const cell = unit / 2;
  const column = (hz: number) => Math.round(2 * Math.log2(hz / 125)) + 1;
  const drawAudiogram = (ear: Ear, px: number) => {
    const color = EAR_COLOR[ear];
    const width = cell * COLUMNS;
    const left = px + (panelWidth - width) / 2;
    const top = chartTop;
    const height = unit * dbOctaves;
    const xFor = (hz: number) => left + column(hz) * cell;
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
    // Every column line is drawn the same, including the two unlabelled ones
    // between 125–250 Hz and 250–500 Hz, so all boxes look identical.
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < COLUMNS; i++) {
      line(left + i * cell, top, left + i * cell, top + height);
    }
    for (const hz of ALL_FREQUENCIES) {
      write(String(hz), xFor(hz), top + height + 22, 13, 700, C.muted, "center");
    }
    ctx.strokeStyle = C.gridStrong;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left, top, width, height);
    write("Frequency (Hz)", left + width / 2, top + height + 50, 14, 800, C.ink, "center");
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
    const r = cell * 0.24;
    for (const hz of ALL_FREQUENCIES) {
      const point = readPoint(side.ac[hz]);
      if (!point) continue;
      symbol(ear, "ac", point.masked, xFor(hz), yFor(point.db), r);
      if (point.noResponse) noResponseArrow(ear, xFor(hz), yFor(point.db), r);
    }
    const offset = (ear === "right" ? -1 : 1) * cell * 0.36;
    for (const hz of BC_FREQUENCIES) {
      const point = readPoint(side.bc[hz]);
      if (!point) continue;
      symbol(ear, "bc", point.masked, xFor(hz) + offset, yFor(point.db), r);
      if (point.noResponse) noResponseArrow(ear, xFor(hz) + offset, yFor(point.db), r);
    }
  // Clinical symbol legend for this ear.
  const legendY = top + height + belowChart;
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
  // Sits in the bottom strip, left of the signature, with its last row level
  // with the registration number.
  const sigWidth = 420;
  const sigLeft = W - M - sigWidth;
  const tableLeft = M;
  const tableWidth = sigLeft - 48 - M;
  const tableTop = signatureTop + 38;
  const rowHeight = 30;
  const labelWidth = 340;
  const valueWidth = (tableWidth - labelWidth) / 2;
  roundRect(tableLeft, tableTop, tableWidth, rowHeight, 10);
  ctx.fillStyle = C.tint;
  ctx.fill();
  write("RESULT", tableLeft + 16, tableTop + 20, 12, 800, C.faint, "left", 1);
  write("LEFT EAR", tableLeft + labelWidth + 16, tableTop + 20, 12.5, 900, EAR_COLOR.left, "left", 1);
  write("RIGHT EAR", tableLeft + labelWidth + valueWidth + 16, tableTop + 20, 12.5, 900, EAR_COLOR.right, "left", 1);
  rows.forEach(([label, left, right], i) => {
    const y = tableTop + rowHeight * (i + 1);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 2.8;
    line(tableLeft, y + rowHeight, tableLeft + tableWidth, y + rowHeight);
    write(fit(label, labelWidth - 28, 15, 700), tableLeft + 16, y + 21, 15, 700, C.muted);
    const notCalculated = (v: string) => v.startsWith("Not calculated");
    write(
      fit(left, valueWidth - 28, notCalculated(left) ? 13.5 : 16, notCalculated(left) ? 700 : 800),
      tableLeft + labelWidth + 16,
      y + 21,
      notCalculated(left) ? 13.5 : 16,
      notCalculated(left) ? 700 : 800,
      notCalculated(left) ? C.faint : C.ink,
    );
    write(
      fit(right, valueWidth - 28, notCalculated(right) ? 13.5 : 16, notCalculated(right) ? 700 : 800),
      tableLeft + labelWidth + valueWidth + 16,
      y + 21,
      notCalculated(right) ? 13.5 : 16,
      notCalculated(right) ? 700 : 800,
      notCalculated(right) ? C.faint : C.ink,
    );
  });
// ---------------- signature & footer ----------------
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.2;
  line(sigLeft, signatureTop + 48, W - M, signatureTop + 48);
  write("Signature & Stamp", W - M, signatureTop + 65, 11.5, 700, C.faint, "right");
  write(fit(orDash(data.audiologist.name), sigWidth, 17, 800), W - M, signatureTop + 88, 17, 800, C.ink, "right");
  write(fit(orDash(data.audiologist.qualification), sigWidth, 14, 600), W - M, signatureTop + 108, 14, 600, C.muted, "right");
  write(
    fit(`CRR No. ${orDash(data.audiologist.registration)}`, sigWidth, 14, 600),
    W - M,
    signatureTop + 128,
    14,
    600,
    C.muted,
    "right",
  );
  return { overflow: false };
}
