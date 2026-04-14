import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { DeclarationsModule } from './declarations/declarations.module';
import { DocumentsModule } from './documents/documents.module';
import { RulesEngineModule } from './rules-engine/rules-engine.module';
import { AttestationsModule } from './attestations/attestations.module';
import { PaymentsModule } from './payments/payments.module';
import { GeoModule } from './geo/geo.module';
import { FraudModule } from './fraud/fraud.module';
import { BiensModule } from './biens/biens.module';
import { NotificationsModule } from './notifications/notifications.module';

// Global Providers
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database (TypeORM + PostgreSQL + PostGIS)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'predem_dev'),
        password: configService.get('DATABASE_PASSWORD', 'predem_dev_password'),
        database: configService.get('DATABASE_NAME', 'predem_db'),
        entities: [
          'dist/**/*.entity.js',
        ],
        synchronize: false, // Use migrations instead
        logging: configService.get('LOG_LEVEL') === 'debug',
      }),
    }),

    // Redis + Bull Job Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
      }),
    }),

    // Feature Modules
    AuthModule,
    DeclarationsModule,
    DocumentsModule,
    RulesEngineModule,
    AttestationsModule,
    PaymentsModule,
    GeoModule,
    FraudModule,
    BiensModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
