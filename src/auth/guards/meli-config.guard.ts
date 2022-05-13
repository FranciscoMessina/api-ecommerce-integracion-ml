import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CryptoService } from 'src/utils/crypto';
import { ErrorActions } from 'src/types/actions.types';
import { UsersService } from 'src/users/users.service';
import { MeliOauth } from '../../meli/meli.oauth.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class MeliGuard implements CanActivate {
  constructor(
    private readonly meliOauth: MeliOauth,
    private usersService: UsersService,
    private reflector: Reflector,
    @Inject(CryptoService) private crypto: CryptoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest() as Request;

    if (!user || !user.config.meliId || !user.config.meliAccess) {
      throw new UnauthorizedException({
        message: 'Please link meli again',
        action: ErrorActions.LinkMeli,
      });
    }

    if (user.config.meliTokenExpires < Date.now()) {
      console.log('refreshing in meli guard');
      
      const refreshToken = this.crypto.decrypt(user.config.meliRefresh);
      const { data } = await this.meliOauth.refreshAccessToken(refreshToken);

      // console.log(data);

      if ('error' in data) {
        console.log(data);
        
        user.config.meliId = null;
        user.config.meliAccess = null;
        user.config.meliRefresh = null;
        throw new UnauthorizedException({
          message: 'Please link meli again',
          action: ErrorActions.LinkMeli,
        });
      }

      user.config.meliTokenExpires = Date.now() + data.expires_in * 1000;
      user.config.meliAccess = this.crypto.encrypt(data.access_token);
      user.config.meliRefresh = this.crypto.encrypt(data.refresh_token);

      await this.usersService.save(user);

      user.config.meliAccess = data.access_token
      user.config.meliRefresh = data.refresh_token

      return true;
    }

    user.config.meliAccess = this.crypto.decrypt(user.config.meliAccess);
    user.config.meliRefresh = this.crypto.decrypt(user.config.meliRefresh);

    return true;
  }
}
