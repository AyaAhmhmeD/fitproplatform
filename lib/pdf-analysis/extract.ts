import { PDFParse } from "pdf-parse";

/** Extracts raw text from a PDF file buffer (e.g. an InBody/Omron body-composition scan). */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

/** Structured metrics parsed out of a body-composition scan PDF. All fields are optional
 * since layout/label variance across devices (InBody, Omron, trainer-typed reports, etc.)
 * means any given metric may not be present or may not be recognized. */
export interface ExtractedBodyMetrics {
  weightKg?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  bmi?: number;
  visceralFat?: number;
  bmr?: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
}

/** Tries each label pattern (in order) against `text` and returns the first captured number found. */
function matchNumber(text: string, labelPatterns: RegExp[]): number | undefined {
  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match && match[1] !== undefined) {
      const value = Number(match[1]);
      if (!Number.isNaN(value)) return value;
    }
  }
  return undefined;
}

/**
 * Parses free-form extracted PDF text for common body-composition metrics.
 * Tolerant of label wording, spacing/colon variance, and units with or without
 * a leading space (e.g. "78.4 kg" or "78.4kg"). More specific label patterns are
 * tried before more generic ones so, e.g., "Skeletal Muscle Mass" is matched before
 * a bare "Mass" pattern would otherwise (incorrectly) grab the same number.
 */
export function extractBodyAnalysisMetrics(text: string): ExtractedBodyMetrics {
  const metrics: ExtractedBodyMetrics = {
    weightKg: matchNumber(text, [
      /body\s*weight\s*[:\-]?\s*([\d.]+)\s*kg/i,
      /weight\s*[:\-]?\s*([\d.]+)\s*kg/i,
      /weight\s*[:\-]?\s*([\d.]+)\b/i,
    ]),
    bodyFatPct: matchNumber(text, [
      /body\s*fat\s*(?:percentage|pct|%)?\s*[:\-]?\s*([\d.]+)\s*%/i,
      /fat\s*mass\s*%\s*[:\-]?\s*([\d.]+)\s*%/i,
      /body\s*fat\s*[:\-]?\s*([\d.]+)\s*%/i,
      /\bpbf\s*[:\-]?\s*([\d.]+)\s*%/i,
    ]),
    muscleMassKg: matchNumber(text, [
      /skeletal\s*muscle\s*mass\s*[:\-]?\s*([\d.]+)\s*kg/i,
      /\bsmm\s*[:\-]?\s*([\d.]+)\s*kg/i,
      /muscle\s*mass\s*[:\-]?\s*([\d.]+)\s*kg/i,
    ]),
    bmi: matchNumber(text, [
      /\bbmi\s*[:\-]?\s*([\d.]+)/i,
      /body\s*mass\s*index\s*[:\-]?\s*([\d.]+)/i,
    ]),
    visceralFat: matchNumber(text, [
      /visceral\s*fat\s*level\s*[:\-]?\s*([\d.]+)/i,
      /visceral\s*fat\s*[:\-]?\s*([\d.]+)/i,
      /\bvfl\s*[:\-]?\s*([\d.]+)/i,
    ]),
    bmr: matchNumber(text, [
      /basal\s*metabolic\s*rate\s*[:\-]?\s*([\d.]+)\s*kcal/i,
      /\bbmr\s*[:\-]?\s*([\d.]+)\s*kcal/i,
      /\bbmr\s*[:\-]?\s*([\d.]+)/i,
    ]),
    waistCm: matchNumber(text, [
      /waist\s*circumference\s*[:\-]?\s*([\d.]+)\s*cm/i,
      /waist\s*[:\-]?\s*([\d.]+)\s*cm/i,
    ]),
    chestCm: matchNumber(text, [
      /chest\s*circumference\s*[:\-]?\s*([\d.]+)\s*cm/i,
      /chest\s*[:\-]?\s*([\d.]+)\s*cm/i,
    ]),
    hipCm: matchNumber(text, [
      /hip\s*circumference\s*[:\-]?\s*([\d.]+)\s*cm/i,
      /hip\s*[:\-]?\s*([\d.]+)\s*cm/i,
    ]),
    armCm: matchNumber(text, [
      /arm\s*circumference\s*[:\-]?\s*([\d.]+)\s*cm/i,
      /arm\s*[:\-]?\s*([\d.]+)\s*cm/i,
    ]),
    thighCm: matchNumber(text, [
      /thigh\s*circumference\s*[:\-]?\s*([\d.]+)\s*cm/i,
      /thigh\s*[:\-]?\s*([\d.]+)\s*cm/i,
    ]),
  };

  return metrics;
}

const METRIC_LABELS: Record<keyof ExtractedBodyMetrics, { label: string; unit: string }> = {
  weightKg: { label: "weight", unit: "kg" },
  bodyFatPct: { label: "body fat", unit: "%" },
  muscleMassKg: { label: "muscle mass", unit: "kg" },
  bmi: { label: "BMI", unit: "" },
  visceralFat: { label: "visceral fat level", unit: "" },
  bmr: { label: "BMR", unit: "kcal" },
  waistCm: { label: "waist", unit: "cm" },
  chestCm: { label: "chest", unit: "cm" },
  hipCm: { label: "hip", unit: "cm" },
  armCm: { label: "arm", unit: "cm" },
  thighCm: { label: "thigh", unit: "cm" },
};

/** Builds a short, human-readable summary of what was (and wasn't) detected in the scan. */
export function summarizeExtraction(metrics: ExtractedBodyMetrics): string {
  const keys = Object.keys(METRIC_LABELS) as (keyof ExtractedBodyMetrics)[];
  const found = keys.filter((key) => metrics[key] !== undefined);
  const missingCount = keys.length - found.length;

  if (found.length === 0) {
    return "No recognizable body-composition metrics were detected in this report — you can add measurements manually.";
  }

  const parts = found.map((key) => {
    const { label, unit } = METRIC_LABELS[key];
    const value = metrics[key];
    return `${label} (${value}${unit})`;
  });

  let sentence: string;
  if (parts.length === 1) {
    sentence = `Extracted ${parts[0]} from the uploaded report.`;
  } else {
    const last = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(", ");
    sentence = `Extracted ${rest}, and ${last} from the uploaded report.`;
  }

  if (missingCount > 0) {
    sentence += ` ${missingCount} additional metric${missingCount === 1 ? " was" : "s were"} not detected — you can add ${
      missingCount === 1 ? "it" : "them"
    } manually.`;
  }

  return sentence;
}
