import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/signin-dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { AuthGuard } from './auth.guard';
import { UserInfoDto } from './dto/userinfo-dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('register')
  register(@Body() signInDto: RegisterDto) {
    return this.authService.register(
      signInDto.email,
      signInDto.password,
      signInDto.fullName,
    );
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout() {
    return { message: 'Sesión cerrada correctamente' };
  }
  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() request: Request) {
    const loggedInUser = request['user'] as UserInfoDto;
    return this.authService.getUserProfile(loggedInUser.id);
  }
}
