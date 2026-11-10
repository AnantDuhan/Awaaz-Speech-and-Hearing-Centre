/**
 * Wraps one JPEG in a single-page A4 PDF, in the browser, with no library.
 * The JPEG is embedded as-is (DCTDecode), so the PDF matches the preview exactly.
 */

const A4 = { width: 841.89, height: 595.28 }; // A4 landscape, points

/** PDF text string as UTF-16BE hex, so any name (including Devanagari) is stored safely. */
function pdfText(text: string) {
  let hex = "FEFF";
  for (let i = 0; i < text.length; i++) hex += text.charCodeAt(i).toString(16).padStart(4, "0");
  return `<${hex.toUpperCase()}>`;
}

function pdfDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function jpegToPdf(
  jpeg: Uint8Array<ArrayBuffer>,
  pixelWidth: number,
  pixelHeight: number,
  info: { title: string; author: string },
): Blob {
  const encoder = new TextEncoder();
  const parts: Uint8Array<ArrayBuffer>[] = [];
  const offsets: number[] = [];
  let length = 0;

  const add = (part: string | Uint8Array<ArrayBuffer>) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    parts.push(bytes);
    length += bytes.length;
  };
  const startObject = (id: number) => {
    offsets[id] = length;
    add(`${id} 0 obj\n`);
  };

  // Header; the second line marks the file as binary.
  add("%PDF-1.4\n");
  add(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  startObject(1);
  add("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  startObject(2);
  add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  startObject(3);
  add(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.width} ${A4.height}] ` +
      "/Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n",
  );

  startObject(4);
  add(
    `<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  add(jpeg);
  add("\nendstream\nendobj\n");

  // Draw the image across the whole A4 page.
  const content = `q\n${A4.width} 0 0 ${A4.height} 0 0 cm\n/Im0 Do\nQ\n`;
  startObject(5);
  add(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  startObject(6);
  add(
    `<< /Title ${pdfText(info.title)} /Author ${pdfText(info.author)} ` +
      `/Creator (Awaaz hearing report tool) /CreationDate (${pdfDate(new Date())}) >>\nendobj\n`,
  );

  const xrefOffset = length;
  add("xref\n0 7\n0000000000 65535 f \n");
  for (let id = 1; id <= 6; id++) add(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  add(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return new Blob(parts, { type: "application/pdf" });
}
