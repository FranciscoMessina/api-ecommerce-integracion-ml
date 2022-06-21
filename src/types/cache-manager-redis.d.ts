declare module 'cache-manager-redis-store' {
  import { CacheStoreFactory } from '@nestjs/common';

  const cacheStore: CacheStoreFactory;

  export = cacheStore;
}
