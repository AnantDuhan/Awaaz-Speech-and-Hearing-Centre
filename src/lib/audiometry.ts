
/**
 * Pure-tone audiometry data and calculations for the hearing test report.
 * No patient data is stored anywhere: it lives only in the page's memory.
 */

export type Ear = "right" | "left";
export type Conduction = "ac" | "bc";

/** "" = ordinary response, "masked" = masking used, "nr" = no response. */
export type PointStatus = "" | "masked" | "nr" | "masked-nr";

export const STATUS_OPTIONS: {
  value: PointStatus;
  label: string;
  description: string;
}[] = [
  { value: "", label: "—", description: "Response" },
  { value: "masked", label: "M", description: "Masked" },
  { value: "nr", label: "NR", description: "No response" },
  { value: "masked-nr", label: "M+NR", description: "Masked, no response" },
];

/** Octave frequencies, labelled on the audiogram. */
export const OCTAVE_FREQUENCIES = [125, 250, 500, 1000, 2000, 4000, 8000];

export type Point = {
  value: string;
  status: PointStatus;
};

export type Thresholds = Record<
  Ear,
  Record<Conduction, Record<number, Point>>
>;

export const MAIN_FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];
export const EXTRA_FREQUENCIES = [125, 750, 1500, 3000, 6000];

export const ALL_FREQUENCIES = [
  125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000,
];

/** Bone conduction is only tested within the bone vibrator's range. */
export const BC_FREQUENCIES = [
  250, 500, 750, 1000, 1500, 2000, 3000, 4000,
];

export const MIN_DB = -10;
export const MAX_DB = 120;

export function formatFrequency(hz: number) {
  return hz >= 1000 ? `${hz / 1000}k` : String(hz);
}

export function emptyThresholds(): Thresholds {
  const side = () => ({
    ac: Object.fromEntries(
      ALL_FREQUENCIES.map((f) => [f, { value: "", status: "" }])
    ),
    bc: Object.fromEntries(
      BC_FREQUENCIES.map((f) => [f, { value: "", status: "" }])
    ),
  });

  return {
    right: side(),
    left: side(),
  } as Thresholds;
}

/** Parsed threshold, or null when the cell is empty or invalid. */
export function readPoint(point: Point | undefined) {
  if (!point || point.value.trim() === "") return null;

  const db = Number(point.value);

  if (!Number.isFinite(db) || db < MIN_DB || db > MAX_DB) {
    return null;
  }

  return {
    db,
    masked: point.status === "masked" || point.status === "masked-nr",
    noResponse: point.status === "nr" || point.status === "masked-nr",
  };
}

export function isInvalid(point: Point | undefined) {
  return !!point && point.value.trim() !== "" && readPoint(point) === null;
}

/* ------------------------------------------------------------------ */
/* WHO (2021) hearing-loss classification                              */
/* ------------------------------------------------------------------ */

type Band = {
  label: string;
  /** Inclusive upper limit; Infinity for the last band. */
  max: number;
  strict?: boolean;
};

export type Scale = {
  id: "who";
  name: string;
  short: string;
  frequencies: number[];
  /** Top of the normal range, used to shade the audiogram. */
  normalLimit: number;
  bands: Band[];
};

export const SCALES: Record<Scale["id"], Scale> = {
  who: {
    id: "who",
    name: "WHO (2021)",
    short: "WHO (2021), PTA of 0.5, 1, 2 and 4 kHz",
    frequencies: [500, 1000, 2000, 4000],
    normalLimit: 20,
    bands: [
      { label: "Normal hearing", max: 20, strict: true },
      { label: "Mild hearing loss", max: 35, strict: true },
      { label: "Moderate hearing loss", max: 50, strict: true },
      { label: "Moderately severe hearing loss", max: 65, strict: true },
      { label: "Severe hearing loss", max: 80, strict: true },
      { label: "Profound hearing loss", max: 95, strict: true },
      { label: "Complete or total hearing loss", max: Infinity },
    ],
  },
};

/** Classifies a PTA using the selected hearing-loss scale. */
export function classify(pta: number, scale: Scale): string {
  const band = scale.bands.find((b) =>
    b.strict ? pta < b.max : pta <= b.max
  );

  return band?.label ?? scale.bands[scale.bands.length - 1].label;
}

export type PtaResult =
  | {
      ok: true;
      value: number;
      degree: string;
    }
  | {
      ok: false;
      reason: string;
    };

/**
 * Pure-tone average of air-conduction thresholds for one ear.
 * WHO PTA uses 500, 1000, 2000 and 4000 Hz.
 */
export function pureToneAverage(
  thresholds: Thresholds,
  ear: Ear,
  scale: Scale
): PtaResult {
  const values: number[] = [];

  for (const frequency of scale.frequencies) {
    const point = readPoint(thresholds[ear].ac[frequency]);

    if (!point) {
      return {
        ok: false,
        reason: `needs ${frequency} Hz`,
      };
    }

    if (point.noResponse) {
      return {
        ok: false,
        reason: `no response at ${frequency} Hz`,
      };
    }

    values.push(point.db);
  }

  const value =
    Math.round(
      (values.reduce((sum, current) => sum + current, 0) /
        values.length) *
        10
    ) / 10;

  return {
    ok: true,
    value,
    degree: classify(value, scale),
  };
}

/**
 * Calculates hearing-loss degree for both ears.
 * Returns null degree when the required PTA thresholds are incomplete.
 */
export function calculateHearingDegrees(thresholds: Thresholds) {
  const scale = SCALES.who;

  return {
    right: pureToneAverage(thresholds, "right", scale),
    left: pureToneAverage(thresholds, "left", scale),
  };
}

export function formatDb(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
