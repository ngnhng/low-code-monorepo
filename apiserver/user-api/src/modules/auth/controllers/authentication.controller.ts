import { Public } from '@decorators/public-route.decorator';
import { LoginDto, RefreshDto } from '@dtos/auth.dto';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { PasetoAuthGuard } from '@guards/paseto-auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticationService } from '@services/authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @UseGuards(PasetoAuthGuard)
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return await this.authService.refresh(refreshDto);
  }
}
