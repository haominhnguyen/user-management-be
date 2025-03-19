import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AuthModule } from './auth/auth.module';
import { KafkaService } from './kafka/kafka.service';
import { RedisService } from './redis/redis.service';
import { SearchService } from './elasticsearch/elasticsearch.service';
import { CustomLogger } from './services/logger.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import databaseConfig from './config/database.config';
import kafkaConfig from './kafka/kafka.config';
import redisConfig from './config/redis.config';
import elasticsearchConfig from './config/elasticsearch.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, kafkaConfig, redisConfig, elasticsearchConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_DATABASE || 'user_management',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      entities: [User],
      logging: true,
      retryAttempts: 3,
      retryDelay: 3000,
      ssl: false,
      extra: {
        max: 20,
        connectionTimeoutMillis: 5000,
      },
    }),
    TypeOrmModule.forFeature([User]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: require('cache-manager-redis-store'),
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        ttl: configService.get('redis.ttl'),
      }),
      inject: [ConfigService],
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get('elasticsearch.node'),
        auth: configService.get('elasticsearch.auth'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  providers: [
    // TODO, FIXME: Uncomment this when Kafka is ready
    // KafkaService,
    RedisService,
    SearchService,
    LoggerMiddleware,
    UserRepository,
    {
      provide: CustomLogger,
      useValue: new CustomLogger('App'),
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
      // .forRoutes('/:path*');

  }
}
