import crypto from "crypto"
export const hashToken = (token:string) => crypto.createHash("sha256").update(token).digest("hex");
export const MAX_REFRESH_TOKENS = 5;
export const REFRESH_TOKEN_EXPIRATION_DURATION=7 * 24 * 60 * 60 * 1000;