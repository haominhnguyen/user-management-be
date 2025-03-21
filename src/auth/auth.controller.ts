import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: Partial<User>) {
    return this.authService.register(registerDto);
  }

  @Get('test')
  @UseGuards(AuthGuard('jwt'))
  async test(@Req() req) {
    console.log(req.user);
    return "haonm";
  }
} 