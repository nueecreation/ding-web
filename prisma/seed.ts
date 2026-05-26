import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Vendor user: find by email (Google OAuth user) ───────────────────────
  const vendorEmail = process.env.SEED_VENDOR_EMAIL ?? "deborah.onyibe@gmail.com";
  const vendor = await prisma.user.findUnique({ where: { email: vendorEmail } });
  if (!vendor) {
    console.log(`Vendor user not found (${vendorEmail}). Sign in with Google first.`);
  } else {
    console.log(`Seeding vendor accounts for ${vendor.email}…`);
    await prisma.linkedBankAccount.deleteMany({ where: { userId: vendor.id, monoAccountId: { startsWith: "mock_vendor_" } } });
    await prisma.linkedBankAccount.createMany({
      data: [
        {
          userId: vendor.id,
          monoAccountId: "mock_vendor_gtb_001",
          institutionName: "GTBank",
          bankCode: "058",
          accountNumber: "0987654321",
          accountName: vendor.name ?? "Deborah Onyibe",
          isDefault: true,
        },
        {
          userId: vendor.id,
          monoAccountId: "mock_vendor_access_001",
          institutionName: "Access Bank",
          bankCode: "044",
          accountNumber: "0123456789",
          accountName: vendor.name ?? "Deborah Onyibe",
          isDefault: false,
        },
        {
          userId: vendor.id,
          monoAccountId: "mock_vendor_kuda_001",
          institutionName: "Kuda",
          bankCode: "090267",
          accountNumber: "1234567890",
          accountName: vendor.name ?? "Deborah Onyibe",
          isDefault: false,
        },
      ],
      skipDuplicates: true,
    });
    console.log("  Vendor accounts seeded.");
  }

  // ── Payer test user: phone OTP user ──────────────────────────────────────
  const payerPhone = "+2348000000001";
  let payer = await prisma.user.findUnique({ where: { phone: payerPhone } });
  if (!payer) {
    payer = await prisma.user.create({
      data: { phone: payerPhone, name: "Test Payer" },
    });
    console.log(`Created test payer user (${payerPhone}).`);
  } else {
    console.log(`Seeding payer accounts for ${payer.phone}…`);
  }

  await prisma.linkedBankAccount.deleteMany({ where: { userId: payer.id, monoAccountId: { startsWith: "mock_payer_" } } });
  await prisma.linkedBankAccount.createMany({
    data: [
      {
        userId: payer.id,
        monoAccountId: "mock_payer_opay_001",
        institutionName: "Opay",
        bankCode: "100004",
        accountNumber: "8012345678",
        accountName: "Test Payer",
        isDefault: true,
        balanceKobo: 4_520_000,
      },
      {
        userId: payer.id,
        monoAccountId: "mock_payer_gtb_001",
        institutionName: "GTBank",
        bankCode: "058",
        accountNumber: "0123456789",
        accountName: "Test Payer",
        isDefault: false,
        balanceKobo: 1_280_000,
      },
      {
        userId: payer.id,
        monoAccountId: "mock_payer_zenith_001",
        institutionName: "Zenith Bank",
        bankCode: "057",
        accountNumber: "2012345678",
        accountName: "Test Payer",
        isDefault: false,
        balanceKobo: 310_000,
      },
    ],
    skipDuplicates: true,
  });
  console.log("  Payer accounts seeded.");
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
