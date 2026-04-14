import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Transaction } from './entities/transaction.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MTNMobileMoneyProvider } from './providers/mtn.provider';
import { OrangeMobileMoneyProvider } from './providers/orange.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue({
      name: 'declaration-processing',
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MTNMobileMoneyProvider, OrangeMobileMoneyProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
