export class CreateOrderDto {
  items: Array<{ productId: number; quantity: number }>;
}
