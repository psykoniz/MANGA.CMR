export interface PaymentIntent {
  transactionId: string;
  externalReference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  ussdCode?: string;
  message?: string;
}

export interface PaymentStatusResult {
  externalReference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount?: number;
  confirmedAt?: Date;
}

export interface PaymentWebhook {
  externalReference: string;
  status: 'SUCCESS' | 'FAILED';
  amount: number;
  phone: string;
  metadata: Record<string, unknown>;
}

export interface IPaymentProvider {
  initiate(amount: number, phone: string, reference: string): Promise<PaymentIntent>;
  checkStatus(externalReference: string): Promise<PaymentStatusResult>;
  parseWebhook(payload: Record<string, unknown>): PaymentWebhook;
}
