import { env } from "@/infrastructure/config/env.config";
import mailLogger from "@/infrastructure/logger/mail.logger";
import {
  PasswordResetEmailTemplate,
  PasswordResetSuccessEmailTemplate,
} from "@/shared/templates/email/password-reset.template";
import { VerificationSuccessEmailTemplate } from "@/shared/templates/email/verification-success.template";
import { VerificationEmailTemplate } from "@/shared/templates/email/verification.template";
import AppException from "@/shared/utils/exception.util";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { APP_EMAIL_FROM } from "@/shared/constants/app.constants";
import nodemailer from "nodemailer";

export default class MailService {
  private transporter: nodemailer.Transporter;
  private userRepository: IUserRepository | undefined;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository;
    this.transporter = nodemailer.createTransport({
      host: env.vars.SMTP_HOST,
      port: env.vars.SMTP_PORT,
      secure: env.vars.SMTP_SECURE,
      service: env.vars.SMTP_SERVICE,
      auth: {
        user: env.vars.SMTP_USER,
        pass: env.vars.SMTP_PASSWORD,
      },
    });
  }

  private async sendEmail(
    to: string,
    { subject, html }: { subject: string; html: string }
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${APP_EMAIL_FROM}" <${env.vars.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      mailLogger.info(`Email sent successfully`, {
        recipient: to,
        subject,
        messageId: info.messageId,
      });

      return info;
    } catch (error: unknown) {
      mailLogger.error(`Failed to send email`, {
        recipient: to,
        subject,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw new AppException(
        `Failed to send email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error instanceof AppException ? error.status : 500
      );
    }
  }

  private async checkNotificationSettings(email: string): Promise<boolean> {
    if (!this.userRepository) {
      // If no userRepository is provided, allow sending (backwards compatibility)
      return true;
    }

    try {
      const user = await this.userRepository.findByEmail(email);
      return user?.allowNotifications ?? true;
    } catch (error) {
      // If we can't check settings, log warning and allow sending
      mailLogger.warn(
        "Failed to check notification settings, sending email anyway",
        {
          email,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
      return true;
    }
  }

  private async sendEmailWithNotificationCheck(
    to: string,
    content: { subject: string; html: string },
    bypassNotificationCheck = false
  ) {
    if (!bypassNotificationCheck) {
      const allowNotifications = await this.checkNotificationSettings(to);
      if (!allowNotifications) {
        mailLogger.info(
          "Email sending skipped due to user notification preferences",
          {
            recipient: to,
            subject: content.subject,
          }
        );
        return { messageId: "skipped-notifications-disabled" };
      }
    }

    return this.sendEmail(to, content);
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    firstName?: string
  ) {
    const emailContent = new VerificationEmailTemplate().generate({
      code: verificationCode,
      email: email,
      firstName: firstName || "User",
    });
    // Security emails should always be sent (bypass notification check)
    return this.sendEmailWithNotificationCheck(email, emailContent, true);
  }

  async sendVerificationSuccessEmail(email: string, firstName?: string) {
    const emailContent = new VerificationSuccessEmailTemplate().generate({
      email: email,
      firstName: firstName || "User",
    });
    // Security emails should always be sent (bypass notification check)
    return this.sendEmailWithNotificationCheck(email, emailContent, true);
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
    firstName?: string
  ) {
    const emailContent = new PasswordResetEmailTemplate().generate({
      code: resetCode,
      email: email,
      firstName: firstName || "User",
    });
    // Security emails should always be sent (bypass notification check)
    return this.sendEmailWithNotificationCheck(email, emailContent, true);
  }

  async sendPasswordResetSuccessEmail(email: string, _firstName?: string) {
    const emailContent = new PasswordResetSuccessEmailTemplate().generate();
    // Security emails should always be sent (bypass notification check)
    return this.sendEmailWithNotificationCheck(email, emailContent, true);
  }

  async sendEmailVerifiedConfirmation(email: string, firstName?: string) {
    return this.sendVerificationSuccessEmail(email, firstName);
  }

  async sendGenericEmail(
    to: string,
    content: { subject: string; html: string },
    bypassNotificationCheck = false
  ) {
    return this.sendEmailWithNotificationCheck(
      to,
      content,
      bypassNotificationCheck
    );
  }
}
