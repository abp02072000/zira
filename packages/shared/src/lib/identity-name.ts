const FORBIDDEN_NAME_KEYWORDS = [
  "date",
  "naiss",
  "lieu",
  "adresse",
  "origine",
  "code",
  "carte",
  "electeur",
  "délivrance",
  "delivrance",
];

export function extractIdentityNameCandidate(rawValue?: string): string | null {
  const value = (rawValue ?? "").replace(/\s+/g, " ").trim();
  if (!value) return null;

  const cleaned = value
    .replace(/\d+/g, " ")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'’ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 4) return null;

  const words = cleaned
    .split(" ")
    .map((word) => word.replace(/^[-'’]+|[-'’]+$/g, ""))
    .filter(Boolean);

  if (words.length < 2 || words.length > 6) return null;

  const candidate = words.join(" ");
  const lower = candidate.toLowerCase();

  if (FORBIDDEN_NAME_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return null;
  }

  return candidate;
}
