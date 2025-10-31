import "dotenv/config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function main() {
  console.log("🌱 Starting database seeding...");

  // Hash passwords
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@example.com",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      lastLoginAt: null,
    },
  });
  console.log("✅ Super Admin created:", superAdmin.email);

  // Create Admin with feature flags
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      designation: "Operations Manager",
      featureFlags: {
        canApproveVendors: true,
        canManageOrders: true,
        canViewReports: true,
        canManageDisputes: true,
      },
      approvedById: superAdmin.id,
      lastLoginAt: null,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create Approved Vendor
  const approvedVendor = await prisma.user.upsert({
    where: { email: "vendor@example.com" },
    update: {},
    create: {
      name: "Approved Vendor",
      email: "vendor@example.com",
      passwordHash: hashedPassword,
      role: "VENDOR",
      companyName: "Acme Corp",
      phoneNumber: "+1234567890",
      address: "123 Business St, City, State 12345",
      website: "https://acmecorp.com",
      taxId: "TAX123456",
      approvedAt: new Date(),
      approvedById: admin.id,
      lastLoginAt: null,
    },
  });
  console.log("✅ Approved Vendor created:", approvedVendor.email);

  // Create Pending Vendor (not approved)
  const pendingVendor = await prisma.user.upsert({
    where: { email: "pending@example.com" },
    update: {},
    create: {
      name: "Pending Vendor",
      email: "pending@example.com",
      passwordHash: hashedPassword,
      role: "VENDOR",
      companyName: "New Business LLC",
      phoneNumber: "+9876543210",
      approvedAt: null, // Not approved yet
      approvedById: null,
      lastLoginAt: null,
    },
  });
  console.log("✅ Pending Vendor created:", pendingVendor.email);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("════════════════════════════════════════");
  console.log("Super Admin:");
  console.log("  Email: superadmin@example.com");
  console.log("  Password: password123");
  console.log("\nAdmin:");
  console.log("  Email: admin@example.com");
  console.log("  Password: password123");
  console.log("\nApproved Vendor:");
  console.log("  Email: vendor@example.com");
  console.log("  Password: password123");
  console.log("\nPending Vendor (Cannot Login):");
  console.log("  Email: pending@example.com");
  console.log("  Password: password123");
  console.log("════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
