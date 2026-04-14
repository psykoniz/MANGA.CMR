import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonePreemption } from './entities/zone-preemption.entity';
import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ZonePreemption])],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
