import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const getDatabaseUrl = () => {
  const urlStr = process.env.DATABASE_URL
  if (!urlStr) return undefined

  if (urlStr.startsWith('prisma+postgres://')) {
    try {
      const url = new URL(urlStr)
      const apiKey = url.searchParams.get('api_key')
      if (apiKey) {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8')
        const parsed = JSON.parse(decoded)
        if (parsed.databaseUrl) {
          return parsed.databaseUrl
        }
      }
    } catch (e) {
      console.error('Failed to decode prisma+postgres API key:', e)
    }
  }
  return urlStr
}

const prismaClientSingleton = () => {
  const connectionString = getDatabaseUrl()
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
