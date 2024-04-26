// seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const reset = async () => {
  await prisma.user.deleteMany({});
};

const seed = async () => {
  const users = [
    {
      email: 'temp-email@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }
};

async function main() {
  try {
    await reset();
    await seed();

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error during seeding:', error);

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
