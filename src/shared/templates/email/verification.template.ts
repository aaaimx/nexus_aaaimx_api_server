import { APP_NAME } from "@/shared/constants/app.constants";
import {
  EMAIL_STYLES,
  generateInlineStyles,
} from "@/shared/constants/email-theme.constants";
import { BaseEmailTemplate, BaseEmailData } from "./base-email.template";

interface VerificationEmailData extends BaseEmailData {
  code: string;
  email: string;
}

export class VerificationEmailTemplate extends BaseEmailTemplate {
  generate(data: VerificationEmailData): { subject: string; html: string } {
    const headerContent = this.generateHeader(
      "🔐",
      `¡Bienvenido a ${APP_NAME}!`,
      "Tu código de verificación es:"
    );

    const bodyContent = `
      ${this.generateCodeDisplay(data.code)}
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Utiliza el código de arriba para verificar tu dirección de correo electrónico.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Este código expirará en 15 minutos.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.pLight
  )}">Si no solicitaste esta verificación, puedes ignorar este correo de forma segura.</p>
    `;

    const result = this.generateBaseTemplate(headerContent, bodyContent);
    result.subject = `Código de verificación - ${APP_NAME}`;

    return result;
  }
}
