import { prisma } from "./prisma";

export async function testDatabaseConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test basic query
    const restaurantCount = await prisma.restaurant.count();
    console.log(`📊 Current restaurants count: ${restaurantCount}`);

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
