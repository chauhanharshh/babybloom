const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  {
    name: "Girls",
    slug: "girls",
    description: "Trendy & comfortable wear for little girls (1-9 Years)",
    imageUrl: "/images/categories/girls-wear.jpg",
    subcategories: [
      { name: "Regular", slug: "regular" },
      { name: "Casual", slug: "casual" },
      { name: "Party Wear", slug: "party-wear" },
      { name: "Ethnic Wear", slug: "ethnic-wear" },
      { name: "Frocks", slug: "frocks" },
      { name: "Dresses", slug: "dresses" },
    ],
  },
  {
    name: "Boys",
    slug: "boys",
    description: "Smart and stylish outfits for boys (1-9 Years)",
    imageUrl: "/images/categories/boys-wear.jpg",
    subcategories: [
      { name: "Regular", slug: "regular" },
      { name: "Casual", slug: "casual" },
      { name: "Party Wear", slug: "party-wear" },
      { name: "Ethnic Wear", slug: "ethnic-wear" },
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Jeans", slug: "jeans" },
      { name: "Sets", slug: "sets" },
    ],
  },
  {
    name: "Newborn",
    slug: "newborn",
    description: "Soft & gentle organic clothing for babies (0-12 Months)",
    imageUrl: "/images/categories/newborn-romper.jpg",
    subcategories: [
      { name: "Regular", slug: "regular" },
      { name: "Rompers", slug: "rompers" },
      { name: "Fleece Sets", slug: "fleece-sets" },
      { name: "Innerwear", slug: "innerwear" },
      { name: "Sleepsuits", slug: "sleepsuits" },
    ],
  },
];

async function main() {
  console.log("Seeding categories and subcategories...");

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { name: cat.name },
      include: { subcategories: true },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          subcategories: {
            create: cat.subcategories,
          },
        },
      });
      console.log(`Created category: ${cat.name} with ${cat.subcategories.length} subcategories`);
    } else {
      console.log(`Category ${cat.name} already exists. Checking subcategories...`);
      for (const sub of cat.subcategories) {
        const subExists = existing.subcategories.some(
          (s) => s.name.toLowerCase() === sub.name.toLowerCase()
        );
        if (!subExists) {
          await prisma.subcategory.create({
            data: {
              name: sub.name,
              slug: sub.slug,
              categoryId: existing.id,
            },
          });
          console.log(`  Added subcategory ${sub.name} to ${cat.name}`);
        }
      }
    }
  }

  const all = await prisma.category.findMany({
    include: { subcategories: true },
  });
  console.log(`Done! Total categories in DB: ${all.length}`);
}

main()
  .catch((e) => {
    console.error("Error seeding categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
