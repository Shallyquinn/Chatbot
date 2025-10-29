// src/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Makes RedisService available throughout the application
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
