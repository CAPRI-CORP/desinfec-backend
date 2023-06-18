// prisma/seeders/seeds.js

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Define your seed data
    const users = [
      {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('passworD1!57', 10),
        phone: '1234567890',
      },
    ];

    await prisma.user.createMany({
      data: users,
    });

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
