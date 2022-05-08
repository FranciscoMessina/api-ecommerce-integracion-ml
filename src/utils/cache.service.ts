import { Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async clearCache(key: string, userId?: number | string) {
    const keys: string[] = await this.cache.store.keys();

    // console.log(userId);

    if (!userId) {
      return keys.forEach(async (cacheKey) => {
        if (cacheKey.startsWith(key)) {
          await this.cache.store.del(cacheKey);
        }
      });
    }

    // console.log(keys);

    return keys.forEach(async (cacheKey) => {
      if (cacheKey.startsWith(key) && cacheKey.includes(userId.toString())) {
        await this.cache.store.del(cacheKey);
      }
    });
  }
}
