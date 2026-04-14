import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT || 3000;

  // Security: Helmet middleware
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('PREDEM / SmartFoncier Africa API')
    .setDescription('Digital platform for municipal property declarations and land tenure verification in Douala, Cameroon')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access_token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Declarations', 'Declaration workflow')
    .addTag('Documents', 'Document upload & OCR')
    .addTag('Rules Engine', 'Rule evaluation')
    .addTag('Attestations', 'Digital attestations')
    .addTag('Payments', 'Payment processing')
    .addTag('Geo', 'Geographic/Preemption zones')
    .addTag('Fraud', 'Fraud detection')
    .addTag('Biens', 'Property referential')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 PREDEM API started on http://0.0.0.0:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
