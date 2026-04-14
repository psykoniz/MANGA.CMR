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
export class OrangeMobileMoneyProvider implements IPaymentProvider {
  private readonly logger = new Logger(OrangeMobileMoneyProvider.name);
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
          JSON.stringify({ action: 'ORANGE_PAYMENT_INITIATED_MOCK', amount, phone, reference }),
        );
        return {
          transactionId,
          externalReference: `OM-${Date.now()}`,
          status: 'PENDING',
          ussdCode: `#144*${amount}*${reference}#`,
          message: 'Paiement initié (mode test)',
        };
      }

      // TODO: Production Orange Money API call
      throw new Error('Orange Money Production non configuré');
    } catch (error) {
      this.logger.error('Erreur initiation paiement Orange Money', { error });
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
      externalReference: String(payload['notifToken'] ?? payload['txnid'] ?? ''),
      status: payload['status'] === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
      amount: Number(payload['amount'] ?? 0),
      phone: String(payload['msisdn'] ?? payload['phone'] ?? ''),
      metadata: payload,
    };
  }
}
