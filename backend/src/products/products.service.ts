import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        price: Number(createProductDto.price),
        stock: Number(createProductDto.stock),
        category: createProductDto.category,
      },
    });
  }

  async findAll(query: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const cacheKey = `products_${JSON.stringify(query)}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      console.log('--> Lấy dữ liệu từ REDIS CACHE (Siêu tốc)');
      return cachedData;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined)
        where.price.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined)
        where.price.lte = Number(query.maxPrice);
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take: limit }),
      this.prisma.product.count({ where }),
    ]);

    const result = {
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };

    await this.cacheManager.set(cacheKey, result, 30000);

    return result;
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID ${id}`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const dataToUpdate: any = { ...updateProductDto };
    if (updateProductDto.price !== undefined)
      dataToUpdate.price = Number(updateProductDto.price);
    if (updateProductDto.stock !== undefined)
      dataToUpdate.stock = Number(updateProductDto.stock);

    return this.prisma.product.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Kiểm tra tồn tại trước khi xoá
    return this.prisma.product.delete({
      where: { id: Number(id) },
    });
  }
}
