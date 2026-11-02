import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Sản phẩm ID ${item.productId} không tồn tại`,
          );
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" không đủ tồn kho (Chỉ còn ${product.stock})`,
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

    
      const order = await tx.order.create({
        data: {
          userId: userId,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }

  async findAll(userId?: number) {
    return this.prisma.order.findMany({
      where: userId ? { userId: Number(userId) } : {},
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ID ${id}`);
    }
    return order;
  }

  async updateStatus(id: number, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id: Number(id) },
      data: { status: updateOrderDto.status },
    });
  }
}
