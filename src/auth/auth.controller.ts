import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { GoogleAuthGuard } from '../common/guards/google-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FacebookAuthGuard } from '../common/guards/facebook-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login by username, password' })
  @ApiCreatedResponse({
    description: 'Return {userId, accessToken}',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary:
      'Login by google, redirect to https://every-blog.onrender.com/userId/accessToken',
  })
  loginGoogle() {}

  @Get('redirect/google')
  @Redirect()
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async handleGoogleRedirect(@User() user) {
    const accessToken = await this.authService.getAccessTokenFromUserEntity(
      user,
    );
    return {
      url: `https://every-blog.onrender.com/${user.id}/${accessToken}`,
    };
  }

  @Get('login/facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary:
      'Login by facebook, redirect to https://every-blog.onrender.com/userId/accessToken',
  })
  loginFacebook() {}

  @Get('redirect/facebook')
  @Redirect()
  @UseGuards(FacebookAuthGuard)
  @ApiExcludeEndpoint()
  async handleFacebookRedirect(@User() user) {
    const accessToken = await this.authService.getAccessTokenFromUserEntity(
      user,
    );
    return {
      url: `https://every-blog.onrender.com/${user.id}/${accessToken}`,
    };
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Your password has been changed',
  })
  changePassword(
    @User('id') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Send link reset password to email',
  })
  @ApiCreatedResponse({
    description: 'Link reset password has been sent to your email',
  })
  forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPassword);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiCreatedResponse({
    description: 'Your password has been reset',
  })
  resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.authService.resetPassword(resetPassword);
  }
}
