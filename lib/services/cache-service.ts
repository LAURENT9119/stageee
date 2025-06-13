
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000 // Convertir en millisecondes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      return null
    }

    // Vérifier si le cache a expiré
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Cache wrapper pour les appels API
  async getCached<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttlMinutes: number = 5
  ): Promise<T> {
    const cached = this.get(key)
    
    if (cached) {
      return cached
    }

    const data = await fetchFunction()
    this.set(key, data, ttlMinutes)
    return data
  }
}

export const cacheService = new CacheService()
