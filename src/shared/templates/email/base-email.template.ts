import {
  EMAIL_STYLES,
  EMAIL_THEME,
  generateInlineStyles,
} from "@/shared/constants/email-theme.constants";
import { EmailFooterTemplate } from "./email-footer.template";

export interface BaseEmailData {
  firstName?: string;
}

export class BaseEmailTemplate {
  private footerTemplate = new EmailFooterTemplate();

  protected generateBaseTemplate(
    headerContent: string,
    bodyContent: string
  ): { subject: string; html: string } {
    return {
      subject: "", // To be overridden by child classes
      html: `
        <div style="width: 100%; background-color: #f8f9fa; padding: 20px 0; font-family: Arial, sans-serif;">
          <div style="${generateInlineStyles(EMAIL_STYLES.container)}">
            <div style="${generateInlineStyles(EMAIL_STYLES.header)}">
              ${headerContent}
            </div>
            <div style="${generateInlineStyles(EMAIL_STYLES.content)}">
              <div style="text-align: center;">
                ${bodyContent}
              </div>
            </div>
            ${this.generateDivider(EMAIL_THEME.textMuted, "2px")}
            ${this.footerTemplate.generate().html}
          </div>
        </div>
      `,
    };
  }

  protected generateHeader(
    emoji: string,
    title: string,
    subtitle?: string
  ): string {
    return `
      <h2 style="color: ${
  EMAIL_THEME.primary
}; font-size: 20px; font-weight: bold; margin: 0; text-align: center;">
        ${emoji} ${title}
      </h2>
      ${
  subtitle
    ? `<p style="color: ${EMAIL_THEME.lightMuted}; font-size: 14px; margin: 8px 0 0 0; text-align: center;">${subtitle}</p>`
    : ""
}
    `;
  }

  protected generateCodeDisplay(code: string): string {
    return `
      <div style="${generateInlineStyles(EMAIL_STYLES.codeContainer)}">
        <h1 style="${generateInlineStyles(EMAIL_STYLES.code)}">${code}</h1>
      </div>
    `;
  }

  protected generateInfoBox(title: string, content: string): string {
    return `
      <div style="${generateInlineStyles(EMAIL_STYLES.infoBox)}">
        <h3 style="${generateInlineStyles(EMAIL_STYLES.h3)}">${title}</h3>
        ${content}
      </div>
    `;
  }

  protected generateDivider(
    color: string = EMAIL_THEME.border,
    height: string = "1px"
  ): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0;">
        <tr>
          <td style="height: ${height}; background-color: ${color}; line-height: ${height}; font-size: 1px; mso-line-height-rule: exactly;">&nbsp;</td>
        </tr>
      </table>
    `;
  }
}
