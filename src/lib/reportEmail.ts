import { type ClinicInfo, formatDate, type ReportData } from "./renderReport";

// Email that goes out with the audiogram PDF. Plain text only: mailto links and
// phone share sheets can't carry HTML. Test results are deliberately left out of
// the body (they show up in inbox previews and on lock screens); the PDF has them.

export type ReportEmail = { subject: string; body: string };

export type ReportEmailOptions = {
  /** Optional personal message from the audiologist, added after the opening paragraph. */
  note?: string;
  /** Adds a short Hindi paragraph for patients who prefer it. */
  hindi?: boolean;
};

export function buildReportEmail(
  data: ReportData,
  clinic: ClinicInfo,
  { note = "", hindi = false }: ReportEmailOptions = {},
): ReportEmail {
  const name = data.patient.name.trim();
  const date = data.testDate ? formatDate(data.testDate) : "";
  const reportNo = data.reportNo.trim();
  const audiologist = data.audiologist.name.trim();
  const mainBranch = clinic.branches[0];

  const subject = `Your audiogram report${date ? ` (${date})` : ""} – ${clinic.name}`;

  const paragraphs = [
    name ? `Dear ${name},` : "Dear Sir/Madam,",
    `Thank you for visiting ${clinic.name}. Your hearing test report (audiogram)` +
      `${date ? ` from ${date}` : ""} is attached to this email as a PDF.`,
    note.trim(),
    [reportNo ? `Report No.: ${reportNo}` : "", date ? `Date of test: ${date}` : ""].filter(Boolean).join("\n"),
    "Please keep this report safe and bring it with you to your next visit, or show it to your ENT doctor. " +
      `If you have any questions about your results, call or WhatsApp us on ${clinic.phone}.`,
    hindi
      ? "नमस्ते,\n" +
        "आपकी सुनने की जाँच (ऑडियोग्राम) की रिपोर्ट इस ईमेल के साथ PDF फ़ाइल में भेजी गई है। " +
        "कृपया इसे संभाल कर रखें और अगली बार आते समय साथ लाएँ। " +
        `रिपोर्ट के बारे में कोई भी सवाल हो तो हमें ${clinic.phone} पर कॉल या WhatsApp करें।`
      : "",
    [
      "Warm regards,",
      audiologist,
      clinic.role,
      clinic.name,
      mainBranch ? `${mainBranch.label}: ${mainBranch.address}` : "",
      `Mob. ${clinic.phone} | Email: ${clinic.email}`,
    ]
      .filter(Boolean)
      .join("\n"),
    "This email and its attachment are confidential and meant only for the person named above. " +
      "If you received it by mistake, please let us know and delete it.",
  ];

  return { subject, body: paragraphs.filter(Boolean).join("\n\n") };
}

/**
 * A mailto: link with the subject and body filled in. Attachments can't be added
 * this way, so the PDF is downloaded separately for staff to attach.
 */
export function mailtoLink(to: string, { subject, body }: ReportEmail) {
  const encode = (value: string) => encodeURIComponent(value.replace(/\r?\n/g, "\r\n"));
  return `mailto:${to}?subject=${encode(subject)}&body=${encode(body)}`;
}

/** Simple check: something@something.something, with nothing that would break a mailto link. */
export function isEmailAddress(value: string) {
  return /^[^\s@?&#,;:<>"]+@[^\s@?&#,;:<>"]+\.[^\s@?&#,;:<>".]+$/.test(value);
}
