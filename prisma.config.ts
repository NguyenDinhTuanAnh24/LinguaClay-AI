import { defineConfig } from '@prisma/config'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} ./prisma/seed.ts',
  },


})
