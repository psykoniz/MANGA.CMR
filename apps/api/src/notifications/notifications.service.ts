import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      // Stub: in production use nodemailer
      this.logger.log(
        JSON.stringify({
          action: 'EMAIL_SENT',
          to,
          subject,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.error('Erreur envoi email', { error });
    }
  }

  async sendSms(phone: string, message: string): Promise<void> {
    try {
      // Stub: in production use SMS provider API
      this.logger.log(
        JSON.stringify({
          action: 'SMS_SENT',
          phone,
          messageLength: message.length,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.warn('Erreur envoi SMS', { error });
    }
  }

  async notifyDeclarationStatusChange(
    declarationId: string,
    newStatus: string,
    declarantEmail: string,
    _declarantPhone?: string,
  ): Promise<void> {
    const subject = `Mise à jour de votre déclaration - ${newStatus}`;
    const html = `<p>Votre déclaration ${declarationId} a été mise à jour à l'état: ${newStatus}</p>`;
    await this.sendEmail(declarantEmail, subject, html);
  }

  async notifyInstructeur(
    instructeurEmail: string,
    declarationReference: string,
    message: string,
  ): Promise<void> {
    const subject = `Nouvelle déclaration à traiter - ${declarationReference}`;
    const html = `<p>${message}</p>`;
    await this.sendEmail(instructeurEmail, subject, html);
  }

  async notifySuperviseurSlaAlert(
    superviseurEmail: string,
    declarationReference: string,
    hoursElapsed: number,
  ): Promise<void> {
    const subject = `⚠️ Alerte SLA - ${declarationReference}`;
    const html = `<p>La déclaration ${declarationReference} dépasse le SLA de 48h (${hoursElapsed}h écoulées).</p>`;
    await this.sendEmail(superviseurEmail, subject, html);
  }
}
