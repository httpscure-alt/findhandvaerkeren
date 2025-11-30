import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    console.log('✅ Connection test passed!');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
