/**
 * Foundation: Redis client (cache, BullMQ, pub/sub come in later modules).
 *
 * IMPLEMENT:
 * - Connect via env.REDIS_URL.
 * - Expose ping/quit for readiness + graceful shutdown.
 */

export type RedisClient = {
  ping: () => Promise<void>;
  quit: () => Promise<void>;
};

export async function createRedisClient(_redisUrl: string): Promise<RedisClient> {
  throw new Error("TODO(foundation): implement infrastructure/redis/client.ts");
}
