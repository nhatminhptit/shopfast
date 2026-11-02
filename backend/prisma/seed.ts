import * as bcrypt from 'bcrypt';
import { OrderStatus, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const seedUsers = [
  { email: 'admin.seed@shopfast.local', role: Role.ADMIN },
  { email: 'agent.seed@shopfast.local', role: Role.AGENT },
  { email: 'warehouse.seed@shopfast.local', role: Role.WAREHOUSE },
  { email: 'customer01.seed@shopfast.local', role: Role.CUSTOMER },
  { email: 'customer02.seed@shopfast.local', role: Role.CUSTOMER },
  { email: 'customer03.seed@shopfast.local', role: Role.CUSTOMER },
  { email: 'customer04.seed@shopfast.local', role: Role.CUSTOMER },
  { email: 'customer05.seed@shopfast.local', role: Role.CUSTOMER },
  { email: 'customer06.seed@shopfast.local', role: Role.CUSTOMER },
  { email: 'customer07.seed@shopfast.local', role: Role.CUSTOMER },
];

const seedProducts = [
  {
    name: 'MacBook Pro 14 M3 Pro',
    price: 49990000,
    stock: 12,
    category: 'Laptop',
  },
  {
    name: 'Dell UltraSharp U2723QE 27-inch 4K',
    price: 15490000,
    stock: 8,
    category: 'Màn hình',
  },
  {
    name: 'NuPhy Halo75 V2 Bàn phím cơ không dây',
    price: 3250000,
    stock: 20,
    category: 'Bàn phím',
  },
  {
    name: 'Chuột Logitech MX Master 3S',
    price: 2590000,
    stock: 35,
    category: 'Chuột',
  },
  {
    name: 'Sony WH-1000XM5 Chống ồn chủ động',
    price: 7490000,
    stock: 15,
    category: 'Tai nghe',
  },
  {
    name: 'Keychron Q1 Pro QMK/VIA',
    price: 4290000,
    stock: 18,
    category: 'Bàn phím',
  },
  {
    name: 'Samsung T7 Shield SSD 1TB',
    price: 2490000,
    stock: 25,
    category: 'Phụ kiện',
  },
  {
    name: 'Logitech Brio 4K Webcam',
    price: 4290000,
    stock: 10,
    category: 'Webcam',
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    price: 38990000,
    stock: 7,
    category: 'Laptop',
  },
  {
    name: 'Anker 737 Power Bank 24000mAh',
    price: 2990000,
    stock: 30,
    category: 'Phụ kiện',
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash('ShopFast@123', 10);

  await prisma.$transaction(async (transaction) => {
    const users = await Promise.all(
      seedUsers.map((user) =>
        transaction.user.upsert({
          where: { email: user.email },
          update: { role: user.role, password: hashedPassword },
          create: {
            email: user.email,
            password: hashedPassword,
            role: user.role,
          },
        }),
      ),
    );

    const products = await Promise.all(
      seedProducts.map(async (product) => {
        const existingProduct = await transaction.product.findFirst({
          where: { name: product.name },
        });

        return (
          existingProduct ??
          (await transaction.product.create({ data: product }))
        );
      }),
    );

    const userIds = users.map((user) => user.id);
    const existingOrders = await transaction.order.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    const existingOrderIds = existingOrders.map((order) => order.id);

    if (existingOrderIds.length > 0) {
      await transaction.orderItem.deleteMany({
        where: { orderId: { in: existingOrderIds } },
      });
      await transaction.order.deleteMany({
        where: { id: { in: existingOrderIds } },
      });
    }

    for (let index = 0; index < 10; index += 1) {
      const user = users[index];
      const firstProduct = products[index];
      const secondProduct = products[(index + 1) % products.length];

      await transaction.order.create({
        data: {
          userId: user.id,
          status: [
            OrderStatus.DELIVERED,
            OrderStatus.SHIPPED,
            OrderStatus.PROCESSING,
            OrderStatus.PENDING,
          ][index % 4],
          items: {
            create: [
              {
                productId: firstProduct.id,
                quantity: (index % 3) + 1,
                price: firstProduct.price,
              },
              {
                productId: secondProduct.id,
                quantity: (index % 2) + 1,
                price: secondProduct.price,
              },
            ],
          },
        },
      });
    }
  });

  console.log(
    'Seed completed: 10 users, 10 products, 10 orders, and 20 order items.',
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
