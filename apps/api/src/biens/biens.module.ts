import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bien } from './entities/bien.entity';
import { BienMutation } from './entities/bien-mutation.entity';
import { BiensService } from './biens.service';
import { BiensController } from './biens.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bien, BienMutation])],
  controllers: [BiensController],
  providers: [BiensService],
  exports: [BiensService],
})
export class BiensModule {}
