import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudService } from './fraud.service';
import { FraudAlert } from './entities/fraud-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FraudAlert])],
  providers: [FraudService],
  exports: [FraudService],
})
export class FraudModule {}
