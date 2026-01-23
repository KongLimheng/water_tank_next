import slugify from 'slugify'
import { hashPassword } from './password.js'
import { prisma } from './prismaClient.js'

async function cleanup() {
  console.log('🧹 Cleaning up existing data...')

  // Delete in reverse order of dependencies to respect foreign key constraints

  // await prisma.product.deleteMany();
  // await prisma.category.deleteMany();
  await prisma.user.deleteMany()

  console.log('✅ Cleanup completed')
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data first
  await cleanup()

  // 1. Create users
  const hashedPassword = await hashPassword('Admin@123')

  await prisma.user.upsert({
    where: { email: 'superadmin@admin.com' },
    update: {},
    create: {
      email: 'superadmin@admin.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Super Admin',
    },
  })

  const seedData = [
    {
      brandName: 'Crown',
      categories: ['Plastic', 'Stainless Steel'], // I corrected "Stenless" to "Stainless"
    },
    {
      brandName: 'Diamond',
      categories: ['Plastic', 'Stainless Steel'],
    },
  ]

  for (const item of seedData) {
    // 1. Create the Brand
    const brandSlug = slugify(item.brandName)

    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: {}, // If exists, do nothing
      create: {
        name: item.brandName,
        slug: brandSlug,
      },
    })

    console.log(`✅ Brand: ${brand.name} (ID: ${brand.id})`)

    // 2. Create the Categories for this Brand
    for (const catName of item.categories) {
      // Slug Logic: brand_category (matches your API)
      const catSlug = `${brandSlug}_${slugify(catName)}`

      await prisma.category.upsert({
        where: { slug: catSlug },
        update: {
          // Optional: Update relation if needed
          brandId: brand.id,
        },
        create: {
          name: catName,
          slug: catSlug,
          brandId: brand.id,
          displayName: catName, // Optional default display name
        },
      })

      console.log(`   └─ Category: ${catName} [${catSlug}]`)
    }

    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        email: 'abc@admin.com',
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Created:')
  console.log(`- Users:  Admin`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
