import { APP_NAME } from "@/shared/constants/app.constants";
import {
  EMAIL_STYLES,
  generateInlineStyles,
} from "@/shared/constants/email-theme.constants";
import { BaseEmailTemplate, BaseEmailData } from "./base-email.template";

interface PasswordResetEmailData extends BaseEmailData {
  code: string;
  email: string;
}

export class PasswordResetEmailTemplate extends BaseEmailTemplate {
  generate(data: PasswordResetEmailData): { subject: string; html: string } {
    const headerContent = this.generateHeader(
      "🔑",
      "Restablecer Contraseña",
      "Tu código de restablecimiento es:"
    );

    const bodyContent = `
      ${this.generateCodeDisplay(data.code)}
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Solicitaste restablecer tu contraseña. Utiliza el código de arriba para crear una nueva contraseña.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Este código expirará en 15 minutos.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.pLight
  )}">Si no solicitaste este restablecimiento, puedes ignorar este correo de forma segura.</p>
    `;

    const result = this.generateBaseTemplate(headerContent, bodyContent);
    result.subject = `Código de restablecimiento - ${APP_NAME}`;

    return result;
  }
}

export class PasswordResetSuccessEmailTemplate extends BaseEmailTemplate {
  generate(): {
    subject: string;
    html: string;
    } {
    const headerContent = this.generateHeader("🔒", "Contraseña Actualizada");

    const bodyContent = `
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Tu contraseña ha sido restablecida exitosamente y tu cuenta está segura.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Ya puedes iniciar sesión con tu nueva contraseña.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.pLight
  )}">Si no realizaste este cambio, contacta a nuestro equipo de soporte inmediatamente.</p>
    `;

    const result = this.generateBaseTemplate(headerContent, bodyContent);
    result.subject = `¡Contraseña actualizada! - ${APP_NAME}`;

    return result;
  }
}
