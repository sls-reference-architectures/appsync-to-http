import retry from 'async-retry';

import { ulid } from 'ulid';
import * as service from '../src/service';
import { TestHelpers } from '../../common/testHelpers';

describe('When invoking service.getProducts()', () => {
  const testHelpers = new TestHelpers();

  afterAll(async () => {
    await testHelpers.teardown();
  });

  describe('with no items in database', () => {
    it('should return an empty array and no cursor', async () => {
      // ARRANGE
      const storeId = 'I-do-not-exist';

      // ACT
      const result = await service.getProducts({ storeId });

      // ASSERT
      expect(result.items).toBeArray();
      expect(result.items).toBeEmpty();
      expect(result.cursor).toBeUndefined();
    });
  });

  describe('with items in database', () => {
    it('should return those items', async () => {
      // ARRANGE
      const myStoreId = ulid();
      const otherStoreId = ulid();
      await testHelpers.createRandomProductInDb({ storeId: myStoreId });
      await testHelpers.createRandomProductInDb({ storeId: myStoreId });
      await testHelpers.createRandomProductInDb({ storeId: otherStoreId });

      await retry(
        async () => {
          // ACT
          const result = await service.getProducts({ storeId: myStoreId });

          // ASSERT
          expect(result.items).toHaveLength(2);
        },
        { retries: 3 },
      );
    });
  });

  describe('when using limit', () => {
    it('should restrict result to limit', async () => {
      // ARRANGE
      const myStoreId = ulid();
      const { productId: id1 } = await testHelpers.createRandomProductInDb({ storeId: myStoreId });
      await testHelpers.createRandomProductInDb({ storeId: myStoreId });

      await retry(
        async () => {
          // ACT
          const result = await service.getProducts({ storeId: myStoreId, limit: 1 });

          // ASSERT
          expect(result.items).toHaveLength(1);
          expect(result.items[0].productId).toEqual(id1);
        },
        { retries: 3 },
      );
    });

    it('should return cursor if there are more items', async () => {
      // ARRANGE
      const myStoreId = ulid();
      await testHelpers.createRandomProductInDb({ storeId: myStoreId });
      await testHelpers.createRandomProductInDb({ storeId: myStoreId });

      await retry(
        async () => {
          // ACT
          const result = await service.getProducts({ storeId: myStoreId, limit: 1 });

          // ASSERT
          expect(result.cursor).toBeString();
        },
        { retries: 3 },
      );
    });

    it('should allow cursor to fetch the next set of records', async () => {
      // ARRANGE
      const myStoreId = ulid();
      await testHelpers.createRandomProductInDb({ storeId: myStoreId });
      const { productId: id2 } = await testHelpers.createRandomProductInDb({ storeId: myStoreId });

      await retry(
        async () => {
          const { cursor } = await service.getProducts({ storeId: myStoreId, limit: 1 });

          // ACT
          const result = await service.getProducts({ storeId: myStoreId, cursor });

          // ASSERT
          expect(result.items[0].productId).toEqual(id2);
        },
        { retries: 3 },
      );
    });
  });
});
