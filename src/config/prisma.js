// Ensure env vars are loaded before creating the adapter
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Prevent pool from unreffing the event loop
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
module.exports.pool = pool;
