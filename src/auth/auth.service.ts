import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CustomLogger } from '../services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly logger: CustomLogger,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.debug({
      message: 'Validating user credentials',
      email,
    });

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn({
        message: 'User not found during validation',
        email,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn({
        message: 'Invalid password during validation',
        email,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.debug({
      message: 'User validated successfully',
      email,
      userId: user.id,
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    this.logger.debug({
      message: 'Generating JWT token for user',
      userId: user.id,
      email: user.email,
    });

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.logger.debug({
      message: 'JWT token generated successfully',
      userId: user.id,
      email: user.email,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }

  async register(userData: Partial<User>) {
    this.logger.debug({
      message: 'Starting user registration',
      email: userData.email,
    });

    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      this.logger.warn({
        message: 'User already exists during registration',
        email: userData.email,
      });
      throw new UnauthorizedException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    await this.userRepository.save(user);
    
    this.logger.debug({
      message: 'User registered successfully',
      userId: user.id,
      email: user.email,
    });

    const { password: _, ...result } = user;
    return result;
  }
} 