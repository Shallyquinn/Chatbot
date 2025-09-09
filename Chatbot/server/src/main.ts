import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import helmet  from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true}));
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
