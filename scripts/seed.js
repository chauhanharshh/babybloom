const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    name: "Beautiful Party Frock",
    description: "Exquisite layered party frock with soft cotton lining, premium lace finish, and delicate bow details. Perfect for birthdays, weddings, and festive celebrations.",
    price: 899,
    stock: 25,
    category: "Girls",
    ageGroup: "1-6 Yrs",
    imageUrl: "/images/products/party-frock.jpg",
  },
  {
    name: "Stylish Boy Set",
    description: "Smart casual 2-piece outfit featuring a breathable cotton shirt and stretchable trousers with suspenders. Ideal for formal parties and family outings.",
    price: 799,
    stock: 30,
    category: "Boys",
    ageGroup: "1-6 Yrs",
    imageUrl: "/images/products/boy-set.jpg",
  },
  {
    name: "Summer Floral Dress",
    description: "Vibrant yellow floral cotton frock with ruffled collar and lightweight fabric. Keeps your little princess cool and comfortable all day long.",
    price: 699,
    stock: 20,
    category: "Girls",
    ageGroup: "1-5 Yrs",
    imageUrl: "/images/products/floral-dress.jpg",
  },
  {
    name: "Cute Hoodie Set",
    description: "Cozy fleece pullover hoodie paired with elastic waist joggers. Super soft on sensitive baby skin with playful bear ears.",
    price: 899,
    stock: 18,
    category: "Boys",
    ageGroup: "2-6 Yrs",
    imageUrl: "/images/products/hoodie-set.jpg",
  },
  {
    name: "Denim Dungaree",
    description: "Classic washed denim dungaree with adjustable shoulder buckles and cute embroidered pocket badge. Comes with matching soft cotton tee.",
    price: 799,
    stock: 15,
    category: "Girls",
    ageGroup: "1-4 Yrs",
    imageUrl: "/images/products/denim-dungaree.jpg",
  },
  {
    name: "Fleece Wear Set",
    description: "Plush organic teddy fleece hooded bodysuit and pants. Provides snug warmth during cooler winter months with front snap buttons for easy diaper changes.",
    price: 999,
    stock: 22,
    category: "Newborn",
    ageGroup: "0-3 Yrs",
    imageUrl: "/images/products/fleece-set.jpg",
  },
  {
    name: "Soft Cotton Romper",
    description: "100% GOTS certified organic combed cotton ribbed onesie with nickel-free snaps and expandable shoulders for effortless dressing.",
    price: 499,
    stock: 40,
    category: "Newborn",
    ageGroup: "0-12 Months",
    imageUrl: "/images/categories/newborn-romper.jpg",
  },
  {
    name: "Boys Summer Co-ord Set",
    description: "Everyday summer graphic tee with elastic waistband drawstring bermuda shorts. Breathable, durable, and fade-resistant fabric.",
    price: 599,
    stock: 28,
    category: "Boys",
    ageGroup: "1-6 Yrs",
    imageUrl: "/images/categories/boys-wear.jpg",
  },
  {
    name: "Princess Ballerina Frock",
    description: "Delicate tulle flared party gown with satin belt and floral accents. Soft inner cotton lining ensures itch-free wear for your baby.",
    price: 1099,
    stock: 14,
    category: "Girls",
    ageGroup: "1-6 Yrs",
    imageUrl: "/images/categories/frocks.jpg",
  },
  {
    name: "Kids Animal Sweatshirt",
    description: "Crew neck sweatshirt with brushed interior and ribbed cuffs. Features cute animal graphics that kids adore.",
    price: 749,
    stock: 20,
    category: "Boys",
    ageGroup: "1-6 Yrs",
    imageUrl: "/images/categories/sweatshirts.jpg",
  },
  {
    name: "Kids Comfort Jeans",
    description: "Flexible comfort-stretch denim jeans with internal elastic waistband adjustment. Durable reinforced knee stitching for active play.",
    price: 699,
    stock: 24,
    category: "Boys",
    ageGroup: "2-6 Yrs",
    imageUrl: "/images/categories/pants-jeans.jpg",
  },
  {
    name: "Cotton Baby Innerwear Set",
    description: "Super soft breathable sleeveless cotton undershirts designed to keep baby fresh, sweat-free, and irritation-free.",
    price: 449,
    stock: 35,
    category: "Newborn",
    ageGroup: "0-12 Months",
    imageUrl: "/images/categories/innerwear.jpg",
  },
];

async function seed() {
  console.log("Seeding database with mock products...");

  // Update existing dummy product if id 1 exists, otherwise insert
  const existingProduct1 = await prisma.product.findUnique({ where: { id: 1 } });
  
  if (existingProduct1) {
    console.log("Updating product #1 to Party Frock...");
    await prisma.product.update({
      where: { id: 1 },
      data: PRODUCTS[0],
    });
  } else {
    await prisma.product.create({
      data: PRODUCTS[0],
    });
  }

  // Insert the remaining products (skip if already exist with same name)
  for (let i = 1; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const exists = await prisma.product.findFirst({
      where: { name: p.name },
    });

    if (!exists) {
      await prisma.product.create({ data: p });
      console.log(`Created product: ${p.name}`);
    } else {
      console.log(`Product already exists: ${p.name}`);
    }
  }

  // Check orders count
  const orderCount = await prisma.order.count();
  if (orderCount <= 1) {
    console.log("Creating sample orders for Admin Dashboard...");
    const products = await prisma.product.findMany({ take: 4 });

    if (products.length >= 2) {
      // Sample Order 1: Approved
      await prisma.order.create({
        data: {
          customerName: "Pooja Sharma (WhatsApp)",
          total: products[0].price + products[1].price,
          status: "approved",
          items: {
            create: [
              {
                productId: products[0].id,
                name: products[0].name,
                price: products[0].price,
                quantity: 1,
                ageGroup: products[0].ageGroup,
              },
              {
                productId: products[1].id,
                name: products[1].name,
                price: products[1].price,
                quantity: 1,
                ageGroup: products[1].ageGroup,
              },
            ],
          },
        },
      });

      // Sample Order 2: Pending
      await prisma.order.create({
        data: {
          customerName: "Amit Verma (WhatsApp)",
          total: products[0].price * 2,
          status: "pending",
          items: {
            create: [
              {
                productId: products[0].id,
                name: products[0].name,
                price: products[0].price,
                quantity: 2,
                ageGroup: products[0].ageGroup,
              },
            ],
          },
        },
      });
      console.log("Sample orders created!");
    }
  }

  const finalProductCount = await prisma.product.count();
  const finalOrderCount = await prisma.order.count();
  console.log(`Database seeded successfully! Total Products: ${finalProductCount}, Total Orders: ${finalOrderCount}`);
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
