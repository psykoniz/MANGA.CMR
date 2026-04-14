import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  PaymentIntent,
  PaymentStatusResult,
  PaymentWebhook,
} from '../interfaces/payment-provider.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MTNMobileMoneyProvider implements IPaymentProvider {
  private readonly logger = new Logger(MTNMobileMoneyProvider.name);
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDev =
      configService.get<string>('NODE_ENV', 'development') !== 'production';
  }

  async initiate(amount: number, phone: string, reference: string): Promise<PaymentIntent> {
    try {
      if (this.isDev) {
        // Mode développement - simulation
        const transactionId = uuidv4();
        this.logger.log(
          JSON.stringify({ action: 'MTN_PAYMENT_INITIATED_MOCK', amount, phone, reference }),
        );
        return {
          transactionId,
          externalReference: `MTN-${Date.now()}`,
          status: 'PENDING',
          ussdCode: `*126*${amount}*${reference}#`,
          message: 'Paiement initié (mode test)',
        };
      }

      // TODO: Production MTN MoMo API call
      throw new Error('MTN Production non configuré');
    } catch (error) {
      this.logger.error('Erreur initiation paiement MTN', { error });
      throw error;
    }
  }

  async checkStatus(externalReference: string): Promise<PaymentStatusResult> {
    if (this.isDev) {
      return { externalReference, status: 'PENDING' };
    }
    // TODO: Production status check
    return { externalReference, status: 'PENDING' };
  }

  parseWebhook(payload: Record<string, unknown>): PaymentWebhook {
    return {
      externalReference: String(payload['externalId'] ?? ''),
      status: payload['status'] === 'SUCCESSFUL' ? 'SUCCESS' : 'FAILED',
      amount: Number(payload['amount'] ?? 0),
      phone: String(payload['payer'] ?? ''),
      metadata: payload,
    };
  }
}
