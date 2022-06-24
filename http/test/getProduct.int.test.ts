import { ulid } from 'ulid';
import retry from 'async-retry';

import { Product } from '../src/models';
import ProductsRepository from '../src/repository';
import * as service from '../src/service';

const repo = new ProductsRepository();

describe('When invoking service getProduct()', () => {
  it('should return Product', async () => {
    // ARRANGE
    const testProduct: Product = {
      productId: ulid(),
      name: `nifty-product-${ulid()}`,
      price: 42,
      storeId: ulid(),
    };
    await repo.saveProduct(testProduct);

    await retry(
      async () => {
        // ACT
        const result = await service.getProduct({
          productId: testProduct.productId,
          storeId: testProduct.storeId,
        });

        // ASSERT
        expect(result.name).toEqual(testProduct.name);
      },
      { retries: 3 },
    );
  });
});
