import { CookieOptions } from "express";
import { env } from "../config/env";
import { REFRESH_TOKEN_EXPIRATION_DURATION } from "./hashToken";

const isProduction = env.NODE_ENV === "production";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  maxAge: REFRESH_TOKEN_EXPIRATION_DURATION,
};

export const refreshCookieSignoutOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
};
