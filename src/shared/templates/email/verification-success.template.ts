import { APP_NAME } from "@/shared/constants/app.constants";
import {
  EMAIL_STYLES,
  generateInlineStyles,
} from "@/shared/constants/email-theme.constants";
import { BaseEmailTemplate, BaseEmailData } from "./base-email.template";

interface VerificationSuccessEmailData extends BaseEmailData {
  email: string;
}

export class VerificationSuccessEmailTemplate extends BaseEmailTemplate {
  generate(data: VerificationSuccessEmailData): {
    subject: string;
    html: string;
  } {
    const headerContent = this.generateHeader("✅", "¡Cuenta Verificada!");

    const bodyContent = `
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Tu dirección de correo electrónico <strong>${
  data.email
}</strong> ha sido verificada exitosamente.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.p
  )}">Ahora puedes acceder a todas las funciones de tu cuenta y disfrutar de la experiencia completa.</p>
      <p style="${generateInlineStyles(
    EMAIL_STYLES.pLight
  )}">Si tienes alguna pregunta, nuestro equipo de soporte está aquí para ayudarte.</p>
    `;

    const result = this.generateBaseTemplate(headerContent, bodyContent);
    result.subject = `¡Cuenta verificada! - ${APP_NAME}`;

    return result;
  }
}
