import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signUp(@Body() authDto: AuthDto): Promise<{ access_token: string }> {
    return this.authService.signUp(authDto);
  }

  @Post('signin')
  @HttpCode(200)
  signIn(@Body() authDto: AuthDto): Promise<{ access_token: string }> {
    return this.authService.signIn(authDto);
  }
}
