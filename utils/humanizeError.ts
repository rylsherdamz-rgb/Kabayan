const RULES: { pattern: RegExp; message: string }[] = [
  { pattern: /auth session missing|not authenticated|jwt|session expired|token/i, message: "Your session expired. Please sign in again." },
  { pattern: /invalid login credentials/i, message: "Incorrect email or password." },
  { pattern: /email not confirmed/i, message: "Please verify your email address before signing in." },
  { pattern: /already applied to this job/i, message: "You already applied to this job." },
  { pattern: /cannot apply to your own job|can't apply to your own job/i, message: "You cannot apply to your own job." },
  { pattern: /job not found/i, message: "This job is no longer available." },
  { pattern: /listing not found/i, message: "This listing is no longer available." },
  { pattern: /this user has not applied to the job/i, message: "You can only message applicants for this job." },
  { pattern: /workers can only message the employer/i, message: "You can only message the employer from this job post." },
  { pattern: /sender is not part of this conversation/i, message: "You are not allowed to send messages in this conversation." },
  { pattern: /message content is required/i, message: "Please type a message before sending." },
  { pattern: /duplicate key|already exists|unique constraint/i, message: "This record already exists." },
  { pattern: /violates check constraint|invalid input value/i, message: "Some fields have invalid values. Please review and try again." },
  { pattern: /foreign key constraint/i, message: "This action references missing or invalid data. Please refresh and try again." },
  { pattern: /row-level security|permission denied|not allowed|forbidden/i, message: "You do not have permission to perform this action." },
  { pattern: /schema cache|could not find.*function|relation .* does not exist|table .* does not exist|does not exist in schema/i, message: "The app and database are out of sync. Run the latest migrations and try again." },
  { pattern: /network request failed|failed to fetch|network error|fetch failed|internet/i, message: "Network error. Please check your connection and try again." },
  { pattern: /invalid input syntax for type uuid/i, message: "Invalid data format. Please refresh and try again." },
  { pattern: /timeout|timed out/i, message: "The request timed out. Please try again." },
];

const extractMessage = (error: unknown): string => {
  if (error == null) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const anyErr = error as { message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown };
    if (typeof anyErr.message === "string" && anyErr.message.trim()) return anyErr.message;
    if (typeof anyErr.error_description === "string" && anyErr.error_description.trim()) return anyErr.error_description;
    if (typeof anyErr.details === "string" && anyErr.details.trim()) return anyErr.details;
    if (typeof anyErr.hint === "string" && anyErr.hint.trim()) return anyErr.hint;
  }
  return "";
};

export default function humanizeError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw = extractMessage(error).trim();
  if (!raw) return fallback;

  for (const rule of RULES) {
    if (rule.pattern.test(raw)) return rule.message;
  }

  const cleaned = raw
    .replace(/\s+/g, " ")
    .replace(/details?:.*$/i, "")
    .replace(/hint:.*$/i, "")
    .trim();

  if (!cleaned) return fallback;

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
