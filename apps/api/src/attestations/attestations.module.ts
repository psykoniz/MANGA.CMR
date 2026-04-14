import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttestationsService } from './attestations.service';
import { AttestationsController } from './attestations.controller';
import { Attestation } from './entities/attestation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attestation])],
  providers: [AttestationsService],
  controllers: [AttestationsController],
  exports: [AttestationsService],
})
export class AttestationsModule {}
