import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with encryption keys' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login using the derived authKey' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('salt')
  @ApiOperation({ summary: 'Get user salt for key derivation' })
  async getSalt(@Query('email') email: string) {
    return this.authService.getSalt(email);
  }
}
