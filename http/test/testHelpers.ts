import { ulid } from 'ulid';

import { Product } from '../src/models';
import ProductsRepository from '../src/repository';

export const createRandomProduct = () => ({
  productId: ulid(),
  name: `nifty-product-${ulid()}`,
  price: 42,
  storeId: ulid(),
});

export class TestHelpers {
  private repo: ProductsRepository;

  private createdProducts: Product[];

  constructor() {
    this.repo = new ProductsRepository();
    this.createdProducts = [];
  }

  async createRandomProductInDb(overrideWith?: Partial<Product>): Promise<Product> {
    let product = createRandomProduct();
    if (overrideWith) {
      product = { ...product, ...overrideWith };
    }
    await this.repo.saveProduct(product);
    this.createdProducts.push(product);

    return product;
  }

  async teardown() {
    await Promise.all(this.createdProducts.map(async (p) => this.repo.deleteProduct(p)));
  }
}
