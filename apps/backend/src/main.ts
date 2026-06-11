import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as helmet_lib from 'helmet';
const helmet = helmet_lib.default || helmet_lib;
import * as compression_lib from 'compression';
const compression = compression_lib.default || compression_lib;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  
  // Security
  app.use(helmet({ crossOriginResourcePolicy: false }));
  
  // Speed Optimization
  app.use(compression());
  
  // Strict Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://digitaltechsouls.com',
      'https://www.digitaltechsouls.com'
    ],
    credentials: true
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
