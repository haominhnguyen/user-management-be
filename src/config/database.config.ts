import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'user_management',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
  logging: true,
  autoLoadEntities: true,
})); 