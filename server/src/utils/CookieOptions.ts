import { CookieOptions } from "express";
import { REFRESH_TOKEN_EXPIRATION_DURATION } from "./hashToken";
export const refreshCookieOptions: CookieOptions =
  {
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "strict",

    maxAge:
      REFRESH_TOKEN_EXPIRATION_DURATION,
};

export const refreshCookieSignoutOptions: CookieOptions =
  {
        httpOnly:true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite:'strict'
  };