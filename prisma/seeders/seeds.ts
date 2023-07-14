import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    const categories = [
      { name: 'Mensal', color: '#f5f5f5' },
      { name: 'Residencial', color: 'red' },
      { name: 'Trimestral', color: 'yellow' },
      { name: 'Semestral', color: 'green' },
    ];

    for (const category of categories) {
      await prisma.category.create({
        data: {
          name: category.name,
          color: category.color,
        },
      });
    }

    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

async function seedStatuses() {
  try {
    const statuses = [
      'Aguardando Confirmação',
      'Confirmado',
      'Cancelado',
      'Concluído',
    ]; // Add your desired statuses here

    for (const status of statuses) {
      await prisma.status.create({
        data: {
          name: status,
        },
      });
    }

    console.log('Statuses seeded successfully');
  } catch (error) {
    console.error('Error seeding statuses:', error);
  }
}

async function seedUsers() {
  try {
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

    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Call the seeders
async function seed() {
  await seedCategories();
  await seedStatuses();
  await seedUsers();

  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error('Error running seeders:', error);
  process.exit(1);
});
