import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.url(),
  JWT_ACCESS_SECRET:z.string().min(30),
  JWT_REFRESH_SECRET:z.string().min(30),
  JWT_ACCESS_EXPIRES:z.string(),
  JWT_REFRESH_EXPIRES:z.string()
});

const parsedEnv =
  envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:"
  );

  console.error(
    parsedEnv.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = parsedEnv.data;