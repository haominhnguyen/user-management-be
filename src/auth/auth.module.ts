import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomLogger } from '../services/logger.service';
import { integer } from '@elastic/elasticsearch/lib/api/types';
import { env } from 'process';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '1h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User])
  ],
  providers: [
    AuthService, 
    JwtStrategy,
    User,
    {
      provide: CustomLogger,
      useValue: new CustomLogger('AuthService'),
    }
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {} 