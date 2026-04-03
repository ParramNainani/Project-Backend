const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── Create default Admin ──
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zorvyn.com' },
    update: {},
    create: {
      email: 'admin@zorvyn.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // ── Create sample Analyst ──
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@zorvyn.com' },
    update: {},
    create: {
      email: 'analyst@zorvyn.com',
      password: await bcrypt.hash('analyst123', 12),
      name: 'Jane Analyst',
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  // ── Create sample Viewer ──
  await prisma.user.upsert({
    where: { email: 'viewer@zorvyn.com' },
    update: {},
    create: {
      email: 'viewer@zorvyn.com',
      password: await bcrypt.hash('viewer123', 12),
      name: 'Sam Viewer',
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  // ── Seed financial records ──
  const categories = {
    INCOME: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Refunds'],
    EXPENSE: ['Rent', 'Utilities', 'Groceries', 'Transport', 'Entertainment', 'Office Supplies', 'Software', 'Marketing'],
  };

  const records = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.4 ? 'EXPENSE' : 'INCOME';
    const cats = categories[type];
    const category = cats[Math.floor(Math.random() * cats.length)];

    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const amount =
      type === 'INCOME'
        ? parseFloat((Math.random() * 10000 + 1000).toFixed(2))
        : parseFloat((Math.random() * 3000 + 50).toFixed(2));

    records.push({
      amount,
      type,
      category,
      date,
      notes: `Auto-seeded ${type.toLowerCase()} record #${i + 1}`,
      createdById: Math.random() > 0.5 ? admin.id : analyst.id,
    });
  }

  await prisma.record.createMany({ data: records });

  console.log(`✅ Seeded 3 users and ${records.length} financial records.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
