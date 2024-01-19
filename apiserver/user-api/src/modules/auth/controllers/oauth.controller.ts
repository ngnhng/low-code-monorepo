import { Public } from '@decorators/public-route.decorator';
import { RedirectingExceptionFilter } from '@filters/redirect-filter';
import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from '@services/authentication.service';
import { ApiConfigService } from '@shared/services/api-config.service';
@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly apiConfigService: ApiConfigService,
  ) {}

  @Get('google')
  @Public()
  @UseFilters(RedirectingExceptionFilter)
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Res() res) {}

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    const user = req.user;
    const tokens: [string, string] = await this.authService.login(user);

    const redirectUrl = `${this.apiConfigService.app.clientUrl}/api/auth`;
    // Add tokens to the redirect url
    const redirectUrlWithToken = `${redirectUrl}?accessToken=${tokens[0]}&refreshToken=${tokens[1]}`;

    res.redirect(redirectUrlWithToken);
  }
}
