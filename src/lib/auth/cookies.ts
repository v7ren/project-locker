export const SESSION_COOKIE = "pm_session";
export const OTP_COOKIE = "pm_otp";

export const OTP_TTL_SEC = 600;
export const SESSION_TTL_SEC = 14 * 24 * 60 * 60;

/** Legacy sessions used only `email` + `exp` without `mode`. */
export type SessionTokenPayload =
  | {
      v: 1;
      typ: "session";
      mode: "email";
      email: string;
      exp: number;
    }
  | {
      v: 1;
      typ: "session";
      mode: "user";
      userId: string;
      username: string;
      exp: number;
    }
  | {
      v: 1;
      typ: "session";
      email: string;
      exp: number;
    };

export type OtpTokenPayload = {
  v: 1;
  typ: "otp";
  email: string;
  exp: number;
  saltB64: string;
  hashB64: string;
};

export function cookieBaseOptions(): {
  httpOnly: true;
  sameSite: "lax";
  path: string;
  secure: boolean;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}
