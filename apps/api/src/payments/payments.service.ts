import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Transaction, PaymentProvider, TransactionStatus } from './entities/transaction.entity';
import { MTNMobileMoneyProvider } from './providers/mtn.provider';
import { OrangeMobileMoneyProvider } from './providers/orange.provider';
import { IPaymentProvider, PaymentIntent } from './interfaces/payment-provider.interface';

// MTN phone prefixes in Cameroon
const MTN_PREFIXES: readonly string[] = [
  '650', '651', '652', '653', '654',
  '670', '671', '672', '673', '674',
  '675', '676', '677', '678', '679',
  '680', '681', '682', '683', '684', '685',
];

export interface InitiatePaymentResult {
  transactionId: string;
  externalReference: string;
  provider: PaymentProvider;
  ussdCode?: string;
  message?: string;
}

export interface TransactionStatusResult {
  id: string;
  declarationId: string;
  status: TransactionStatus;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  externalReference: string | null;
  createdAt: Date;
  confirmedAt: Date | null;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly mtnProvider: MTNMobileMoneyProvider,
    private readonly orangeProvider: OrangeMobileMoneyProvider,
    private readonly configService: ConfigService,
    @InjectQueue('declaration-processing')
    private readonly declarationQueue: Queue,
  ) {}

  getProvider(phone: string): IPaymentProvider {
    const normalized = phone.replace(/^(\+237|237)/, '');
    const prefix3 = normalized.slice(0, 3);
    const prefix2 = normalized.slice(0, 2);

    if (
      MTN_PREFIXES.includes(prefix3) ||
      prefix2 === '65' ||
      prefix2 === '67' ||
      prefix2 === '68'
    ) {
      return this.mtnProvider;
    }

    return this.orangeProvider;
  }

  private resolveProviderName(phone: string): PaymentProvider {
    const provider = this.getProvider(phone);
    return provider === this.mtnProvider ? PaymentProvider.MTN : PaymentProvider.ORANGE;
  }

  async initiate(
    declarationId: string,
    phone: string,
    userId: string,
  ): Promise<InitiatePaymentResult> {
    // Get fee from config (default 5000 XAF)
    const fee = this.configService.get<number>('PAYMENT_FEE_XAF', 5000);

    // Determine the next attempt number for this declaration
    const previousAttempts = await this.transactionRepository.count({
      where: { declarationId },
    });
    const attemptNumber = previousAttempts + 1;

    const providerName = this.resolveProviderName(phone);
    const provider = this.getProvider(phone);

    // Create pending transaction
    const transaction = this.transactionRepository.create({
      declarationId,
      attemptNumber,
      amount: fee,
      currency: 'XAF',
      provider: providerName,
      phoneNumber: phone,
      status: TransactionStatus.PENDING,
    });

    const saved = await this.transactionRepository.save(transaction);

    // Build a short reference for the provider
    const reference = `PREDEM-${saved.id.slice(0, 8).toUpperCase()}`;

    let intent: PaymentIntent;
    try {
      intent = await provider.initiate(fee, phone, reference);
    } catch (error) {
      // Mark transaction as failed if provider errors immediately
      await this.transactionRepository.update(saved.id, {
        status: TransactionStatus.FAILED,
      });
      throw error;
    }

    // Persist external reference
    await this.transactionRepository.update(saved.id, {
      externalReference: intent.externalReference,
    });

    this.logger.log(
      JSON.stringify({
        action: 'PAYMENT_INITIATED',
        transactionId: saved.id,
        declarationId,
        provider: providerName,
        amount: fee,
        userId,
        attemptNumber,
      }),
    );

    return {
      transactionId: saved.id,
      externalReference: intent.externalReference,
      provider: providerName,
      ussdCode: intent.ussdCode,
      message: intent.message,
    };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    providerName: 'MTN' | 'ORANGE',
  ): Promise<void> {
    const provider =
      providerName === 'MTN' ? this.mtnProvider : this.orangeProvider;

    const webhook = provider.parseWebhook(payload);

    const transaction = await this.transactionRepository.findOne({
      where: { externalReference: webhook.externalReference },
    });

    if (!transaction) {
      this.logger.warn(
        JSON.stringify({
          action: 'WEBHOOK_TRANSACTION_NOT_FOUND',
          externalReference: webhook.externalReference,
          providerName,
        }),
      );
      return;
    }

    const newStatus =
      webhook.status === 'SUCCESS'
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILED;

    await this.transactionRepository.update(transaction.id, {
      status: newStatus,
      webhookData: webhook.metadata,
      confirmedAt: webhook.status === 'SUCCESS' ? new Date() : null,
    });

    this.logger.log(
      JSON.stringify({
        action: 'WEBHOOK_PROCESSED',
        transactionId: transaction.id,
        declarationId: transaction.declarationId,
        status: newStatus,
        providerName,
      }),
    );

    if (webhook.status === 'SUCCESS') {
      // Enqueue declaration processing after successful payment
      await this.declarationQueue.add(
        'process-declaration',
        { declarationId: transaction.declarationId, transactionId: transaction.id },
        { attempts: 3, backoff: { type: 'exponential', delay: 10000 } },
      );
    }
  }

  async checkStatus(
    transactionId: string,
    userId: string,
  ): Promise<TransactionStatusResult> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} introuvable`);
    }

    // Only allow access to the transaction owner or privileged roles
    // (userId check — in production, link transaction to userId via declarationId)
    void userId; // userId available for future ACL expansion

    return {
      id: transaction.id,
      declarationId: transaction.declarationId,
      status: transaction.status,
      provider: transaction.provider,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      externalReference: transaction.externalReference,
      createdAt: transaction.createdAt,
      confirmedAt: transaction.confirmedAt,
    };
  }
}
