// Redis client singleton for caching and queue management
// In production, connects to Redis. In development, provides a no-op fallback.

interface RedisLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string, options?: { ex?: number }): Promise<void>
  del(key: string): Promise<void>
}

class MemoryCache implements RedisLike {
  private cache = new Map<string, { value: string; expiresAt?: number }>()

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : undefined,
    })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }
}

// Use in-memory cache for development when Redis is not available
// In production, replace with ioredis client
export const cache: RedisLike = new MemoryCache()

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await cache.get(key)
  if (cached) {
    return JSON.parse(cached) as T
  }

  const data = await fetcher()
  await cache.set(key, JSON.stringify(data), { ex: ttlSeconds })
  return data
}
