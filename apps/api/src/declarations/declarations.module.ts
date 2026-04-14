import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Declaration } from './entities/declaration.entity';
import { DeclarationEvent } from './entities/declaration-event.entity';
import { DeclarationsService } from './declarations.service';
import { DeclarationsController } from './declarations.controller';
import { DeclarationProcessor } from './processors/declaration.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Declaration, DeclarationEvent]),
    BullModule.registerQueue({
      name: 'declaration-processing',
    }),
  ],
  controllers: [DeclarationsController],
  providers: [DeclarationsService, DeclarationProcessor],
  exports: [DeclarationsService],
})
export class DeclarationsModule {}
