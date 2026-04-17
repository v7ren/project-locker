/** Classify Resend `emails.send` errors for OTP UX (no secrets). */
export type OtpResendHintCode = "resend_testing" | "resend_from" | "resend_unknown";

export function classifyResendOtpHint(error: { message: string; name: string }): OtpResendHintCode {
  const m = error.message.toLowerCase();
  const n = error.name.toLowerCase();
  if (
    m.includes("only send testing") ||
    m.includes("verify a domain") ||
    m.includes("your own email") ||
    m.includes("testing emails")
  ) {
    return "resend_testing";
  }
  if (n.includes("invalid_from") || m.includes("from address") || m.includes("invalid from")) {
    return "resend_from";
  }
  return "resend_unknown";
}
