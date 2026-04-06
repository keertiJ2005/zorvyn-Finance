import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // gotta clear these in order or foreign keys get mad
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finance.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✓ Created ADMIN user: ${admin.email}`);

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: hashedPassword,
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✓ Created ANALYST user: ${analyst.email}`);

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@finance.com',
      password: hashedPassword,
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✓ Created VIEWER user: ${viewer.email}`);

  // just gonna dump a bunch of hardcoded ones so the dashboard doesn't look empty when we boot up
  const transactionData = [
    {
      amount: 75000,
      type: 'INCOME',
      category: 'Salary',
      date: new Date('2024-01-15'),
      description: 'January monthly salary',
      createdBy: admin.id,
    },
    {
      amount: 75000,
      type: 'INCOME',
      category: 'Salary',
      date: new Date('2024-02-15'),
      description: 'February monthly salary',
      createdBy: admin.id,
    },
    {
      amount: 75000,
      type: 'INCOME',
      category: 'Salary',
      date: new Date('2024-03-15'),
      description: 'March monthly salary',
      createdBy: admin.id,
    },
    {
      amount: 15000,
      type: 'INCOME',
      category: 'Freelance',
      date: new Date('2024-01-20'),
      description: 'Freelance web development project',
      createdBy: admin.id,
    },
    {
      amount: 25000,
      type: 'INCOME',
      category: 'Investment',
      date: new Date('2024-02-28'),
      description: 'Stock dividend payout',
      createdBy: admin.id,
    },
    {
      amount: 5000,
      type: 'INCOME',
      category: 'Investment',
      date: new Date('2024-03-10'),
      description: 'Mutual fund returns',
      createdBy: admin.id,
    },
    {
      amount: 20000,
      type: 'EXPENSE',
      category: 'Rent',
      date: new Date('2024-01-01'),
      description: 'January apartment rent',
      createdBy: admin.id,
    },
    {
      amount: 20000,
      type: 'EXPENSE',
      category: 'Rent',
      date: new Date('2024-02-01'),
      description: 'February apartment rent',
      createdBy: admin.id,
    },
    {
      amount: 20000,
      type: 'EXPENSE',
      category: 'Rent',
      date: new Date('2024-03-01'),
      description: 'March apartment rent',
      createdBy: admin.id,
    },
    {
      amount: 8500,
      type: 'EXPENSE',
      category: 'Food',
      date: new Date('2024-01-10'),
      description: 'Monthly groceries and dining out',
      createdBy: admin.id,
    },
    {
      amount: 7200,
      type: 'EXPENSE',
      category: 'Food',
      date: new Date('2024-02-12'),
      description: 'Monthly groceries',
      createdBy: admin.id,
    },
    {
      amount: 9000,
      type: 'EXPENSE',
      category: 'Food',
      date: new Date('2024-03-08'),
      description: 'Groceries and restaurant visits',
      createdBy: admin.id,
    },
    {
      amount: 3500,
      type: 'EXPENSE',
      category: 'Utilities',
      date: new Date('2024-01-05'),
      description: 'Electricity and water bills',
      createdBy: admin.id,
    },
    {
      amount: 3200,
      type: 'EXPENSE',
      category: 'Utilities',
      date: new Date('2024-02-05'),
      description: 'Electricity, water, and internet',
      createdBy: admin.id,
    },
    {
      amount: 12000,
      type: 'EXPENSE',
      category: 'Shopping',
      date: new Date('2024-01-25'),
      description: 'New laptop accessories and electronics',
      createdBy: admin.id,
    },
    {
      amount: 5000,
      type: 'EXPENSE',
      category: 'Transport',
      date: new Date('2024-02-10'),
      description: 'Monthly metro pass and fuel',
      createdBy: admin.id,
    },
    {
      amount: 4500,
      type: 'EXPENSE',
      category: 'Transport',
      date: new Date('2024-03-10'),
      description: 'Fuel and cab rides',
      createdBy: admin.id,
    },
    {
      amount: 2000,
      type: 'EXPENSE',
      category: 'Entertainment',
      date: new Date('2024-01-18'),
      description: 'Movie tickets and streaming subscriptions',
      createdBy: admin.id,
    },
    {
      amount: 15000,
      type: 'EXPENSE',
      category: 'Healthcare',
      date: new Date('2024-02-20'),
      description: 'Annual health checkup and medicines',
      createdBy: admin.id,
    },
    {
      amount: 10000,
      type: 'EXPENSE',
      category: 'Education',
      date: new Date('2024-03-05'),
      description: 'Online course subscription',
      createdBy: admin.id,
    },
  ];

  for (const data of transactionData) {
    await prisma.transaction.create({ data });
  }
  console.log(`  ✓ Created ${transactionData.length} sample transactions`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:   admin@finance.com   / password123');
  console.log('  Analyst: analyst@finance.com / password123');
  console.log('  Viewer:  viewer@finance.com  / password123\n');
}

main()
  .catch((e) => {
    // print it so I dont have to guess what broke
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
