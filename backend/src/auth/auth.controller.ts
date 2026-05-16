import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupSchema, SignupDto } from './dto/signup.dto';
import { LoginSchema, LoginDto } from './dto/login.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
