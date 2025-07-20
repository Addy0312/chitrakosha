const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@chitrakosha.com',
        name: 'Admin User',
        password: hashedPassword,
        isArtist: false,
      },
    });

    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();