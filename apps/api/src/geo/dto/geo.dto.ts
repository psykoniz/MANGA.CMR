import { IsString, IsNumber, IsOptional, IsObject, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckPreemptionDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng!: number;
}

export class GeoLocateDto {
  @IsUUID()
  declarationId!: string;

  @IsNumber()
  @Type(() => Number)
  lat!: number;

  @IsNumber()
  @Type(() => Number)
  lng!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  confidenceScore!: number;

  @IsString()
  method!: string;
}

export class CreateZoneDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  type!: string;

  @IsObject()
  geometry!: object;

  @IsOptional()
  @IsString()
  description?: string;
}
