import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { id, accessToken, refreshToken, roles } = await this.authService.signUp(createUserDto);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 2592000000, // 1 month,
      sameSite: 'lax',
    });

    return {
      id,
      accessToken,
      roles,
    };
  }

  @Post('/signin')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async signIn(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.signIn(user);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 2592000000, // 1 month,
      sameSite: 'lax',
    });

    return {
      id: user.id,
      meliId: user.config.meliId,
      accessToken,
      roles: [2001, 1984, 5150],
    };
  }

  @Post('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { jwt } = req.cookies;

    if (!jwt) return;

    const loggedOut = await this.authService.signOut(jwt, false);

    if (loggedOut) {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        maxAge: 2592000000, // 1 month,
        sameSite: 'lax',
      });
      return;
    }

    return 'Esto es raro';
  }

  @Get('/refresh')
  @UseGuards(JwtRefreshGuard)
  refreshToken(@Req() req: Request) {
    const { cookies } = req;

    if (!cookies?.jwt) throw new UnauthorizedException('No token provided');

    return this.authService.refreshToken(cookies.jwt);
  }
}
