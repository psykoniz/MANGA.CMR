import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { z } from 'zod';
import { DeclarantType } from '../entities/declaration.entity';

// ─── CreateDeclarationDto ────────────────────────────────────────────────────

export class CreateDeclarationDto {
  @IsEnum(DeclarantType)
  declarantType!: DeclarantType;

  @IsNumber()
  @IsOptional()
  montantDeclare?: number;
}

export const CreateDeclarationSchema = z.object({
  declarantType: z.nativeEnum(DeclarantType),
  montantDeclare: z.number().optional(),
});

// ─── UpdateDeclarationDto ────────────────────────────────────────────────────

export class UpdateDeclarationDto {
  @IsEnum(DeclarantType)
  @IsOptional()
  declarantType?: DeclarantType;

  @IsNumber()
  @IsOptional()
  montantDeclare?: number;

  @IsString()
  @IsOptional()
  notesInstructeur?: string;
}

export const UpdateDeclarationSchema = z.object({
  declarantType: z.nativeEnum(DeclarantType).optional(),
  montantDeclare: z.number().optional(),
  notesInstructeur: z.string().optional(),
});

// ─── SubmitDeclarationDto ────────────────────────────────────────────────────

const CAMEROON_PHONE_REGEX = /^(\+237|237)?6\d{8}$/;

export class SubmitDeclarationDto {
  @IsString()
  @Matches(CAMEROON_PHONE_REGEX, {
    message: 'Le numéro de téléphone doit être un numéro camerounais valide (ex: +237612345678)',
  })
  phone!: string;
}

export const SubmitDeclarationSchema = z.object({
  phone: z
    .string()
    .regex(CAMEROON_PHONE_REGEX, {
      message: 'Le numéro de téléphone doit être un numéro camerounais valide',
    }),
});

// ─── SignDeclarationDto ──────────────────────────────────────────────────────

export class SignDeclarationDto {
  @IsString()
  @Length(6, 6)
  otpCode!: string;
}

export const SignDeclarationSchema = z.object({
  otpCode: z.string().length(6),
});

// ─── ReviewDeclarationDto ────────────────────────────────────────────────────

export enum ReviewDecision {
  VALIDATE = 'VALIDATE',
  REJECT = 'REJECT',
  REQUEST_INCOMPLETE = 'REQUEST_INCOMPLETE',
}

export class ReviewDeclarationDto {
  @IsEnum(ReviewDecision)
  decision!: ReviewDecision;

  @IsString()
  comment!: string;

  @IsString()
  @IsOptional()
  notesInstructeur?: string;
}

export const ReviewDeclarationSchema = z.object({
  decision: z.nativeEnum(ReviewDecision),
  comment: z.string(),
  notesInstructeur: z.string().optional(),
});
