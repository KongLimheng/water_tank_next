import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
// Load .env.local file

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env.local')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected successfully.')
  } catch (error) {
    console.log(error)
  }
}
export { prisma }

