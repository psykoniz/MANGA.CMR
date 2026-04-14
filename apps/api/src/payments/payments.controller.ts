import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService, InitiatePaymentResult, TransactionStatusResult } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

interface InitiatePaymentBody {
  declarationId: string;
  phone: string;
}

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiatePayment(
    @Body() body: InitiatePaymentBody,
    @Request() req: AuthenticatedRequest,
  ): Promise<InitiatePaymentResult> {
    const { declarationId, phone } = body;

    if (!declarationId) {
      throw new BadRequestException('declarationId est requis');
    }
    if (!phone) {
      throw new BadRequestException('phone est requis');
    }

    return this.paymentsService.initiate(declarationId, phone, req.user.id);
  }

  @Get(':id/status')
  async getTransactionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<TransactionStatusResult> {
    return this.paymentsService.checkStatus(id, req.user.id);
  }

  @Post('webhook/mtn')
  @Public()
  async mtnWebhook(
    @Body() payload: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    await this.paymentsService.handleWebhook(payload, 'MTN');
    return { received: true };
  }

  @Post('webhook/orange')
  @Public()
  async orangeWebhook(
    @Body() payload: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    await this.paymentsService.handleWebhook(payload, 'ORANGE');
    return { received: true };
  }
}
