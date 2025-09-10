import { EnvSchema, EnvVars } from "@/interfaces/validators/schemas/env.schema";

export default class EnvConfig {
  private readonly config: EnvVars;

  constructor(rawEnv: NodeJS.ProcessEnv) {
    this.config = EnvSchema.validate(rawEnv);
  }

  get vars(): EnvVars {
    return this.config;
  }

  get isDevelopment(): boolean {
    return EnvSchema.isDevelopment(this.config);
  }

  get isProduction(): boolean {
    return EnvSchema.isProduction(this.config);
  }

  get port(): number {
    return this.config.PORT;
  }

  get apiVersion(): string {
    return this.config.API_VERSION;
  }

  get baseUrl(): string {
    return this.config.BASE_URL;
  }

  get apiUrl(): string {
    return this.isDevelopment
      ? this.getDefaultApiUrl()
      : this.config.API_URL ?? this.getDefaultApiUrl();
  }

  get allowedOrigins(): string[] {
    return this.config.ALLOWED_ORIGINS;
  }

  get secretCode(): string {
    return this.config.SECRET_CODE;
  }

  get smtpService(): string {
    return this.config.SMTP_SERVICE;
  }

  get smtpUser(): string {
    return this.config.SMTP_USER;
  }

  get smtpPassword(): string {
    return this.config.SMTP_PASSWORD;
  }

  get googleClientId(): string {
    return this.config.GOOGLE_CLIENT_ID;
  }

  get googleClientSecret(): string {
    return this.config.GOOGLE_CLIENT_SECRET;
  }

  get googleCallbackUrl(): string {
    return this.config.GOOGLE_CALLBACK_URL;
  }

  get frontendUrl(): string {
    return this.config.FRONTEND_URL;
  }

  get logoUrl(): string | undefined {
    return this.config.LOGO_URL;
  }

  get cookieDomain(): string | undefined {
    return this.config.COOKIE_DOMAIN;
  }

  getDefaultApiUrl(): string {
    return `http://localhost:${this.port}/api/v${this.apiVersion}/`;
  }
}

export const env = new EnvConfig(process.env);
