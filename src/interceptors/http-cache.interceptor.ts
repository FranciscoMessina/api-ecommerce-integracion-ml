import { CacheInterceptor, CACHE_KEY_METADATA, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string {
    const cacheKey = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());

    if (cacheKey) {
      const req = context.switchToHttp().getRequest() as Request;
      // console.log(`${req.url}`);

      const url = new URL(req.url, `https://${req.headers.host}`);
      // console.log(url);

      return `${cacheKey}-${req.user.config.meliId}-${url.searchParams.toString()}`;
    }

    return super.trackBy(context);
  }
}
