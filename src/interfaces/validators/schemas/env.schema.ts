import { z } from "zod";

export class EnvSchema {
  private static readonly schema = z.object({
    // App
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z
      .string()
      .default("8000")
      .transform((val) => parseInt(val, 10)),
    COMPOSE_PROJECT_NAME: z.string().default("nexus_aaaimx_api_server"),
    API_VERSION: z.string().default("1"),
    ALLOWED_ORIGINS: z
      .string()
      .transform((val) => val.split(",").map((s) => s.trim())),
    BASE_URL: z.string().url(),
    API_URL: z.string().url(),
    FRONTEND_URL: z.string().url(),

    // Cookie configuration
    COOKIE_DOMAIN: z.string().optional(),

    // Mail
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().transform((val) => parseInt(val, 10)),
    SMTP_SECURE: z.string().transform((val) => val === "true"),
    SMTP_SERVICE: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    SECRET_CODE: z.string(),

    // Databases
    MYSQL_USER: z.string(),
    MYSQL_PASSWORD: z.string(),
    MYSQL_ROOT_PASS: z.string(),
    MYSQL_DB: z.string(),
    MYSQL_PORT: z
      .string()
      .default("3306")
      .transform((val) => parseInt(val, 10)),
    DATABASE_URL: z.string(),

    // JWT
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),
    LOGO_URL: z.string().url().optional(),
  });

  private static readonly developmentSchema = this.schema.extend({
    BASE_URL: z.string().url().default("http://localhost:8000"),
    API_URL: z.string().url().default("http://localhost:8000/api"),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
    ALLOWED_ORIGINS: z
      .string()
      .transform((val) => val.split(",").map((s) => s.trim()))
      .default(["http://localhost:3000"]),
    COOKIE_DOMAIN: z.string().optional(),
  });

  private static readonly productionSchema = this.schema.extend({
    BASE_URL: z.string().url(),
    API_URL: z.string().url(),
    FRONTEND_URL: z.string().url(),
    COOKIE_DOMAIN: z.string().optional(),
  });

  static validate(env: NodeJS.ProcessEnv): EnvVars {
    const nodeEnv = env["NODE_ENV"] || "development";

    if (nodeEnv === "production") {
      return this.productionSchema.parse(env);
    }

    return this.developmentSchema.parse(env);
  }

  static isDevelopment(env: EnvVars): boolean {
    return env.NODE_ENV === "development";
  }

  static isProduction(env: EnvVars): boolean {
    return env.NODE_ENV === "production";
  }
}

export type EnvVars = z.infer<(typeof EnvSchema)["schema"]>;
