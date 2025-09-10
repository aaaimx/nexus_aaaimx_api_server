import { APP_NAME, APP_DESCRIPTION } from "@/shared/constants/app.constants";
import {
  EMAIL_STYLES,
  generateInlineStyles,
} from "@/shared/constants/email-theme.constants";

export class EmailFooterTemplate {
  generate(): { html: string } {
    return {
      html: `
        <div style="${generateInlineStyles(EMAIL_STYLES.footer)}">
          <center>
            <div style="${generateInlineStyles(EMAIL_STYLES.footerBrand)}">
              ${APP_NAME}
            </div>
            <div style="${generateInlineStyles(
    EMAIL_STYLES.footerDescription
  )}">
              ${APP_DESCRIPTION}
            </div>
          </center>
        </div>
      `,
    };
  }
}
