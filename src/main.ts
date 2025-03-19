import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { CustomLogger } from './services/logger.service';
import { ValidationPipe } from './pipes/validation.pipe';
import { TransformPipe } from './pipes/transform.pipe';
import { CreateUserDto } from './auth/dto/create-user.dto';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(CustomLogger);
  
  app.enableCors();
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalPipes(
    new ValidationPipe(),
    new TransformPipe(CreateUserDto),
  );

  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API documentation for User Management')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    )
    .build();

  // const document = SwaggerModule.createDocument(app, config);     
  // SwaggerModule.setup('swagger', app, document, {
  //   jsonDocumentUrl: 'swagger.json',
  // });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger documentation is available at: http://localhost:${port}/swagger`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
