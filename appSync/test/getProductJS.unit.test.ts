import { ulid } from 'ulid';

// import { request, response } from '../resolvers/Query.getProduct';
const { request, response } = require('../resolvers/Query.getProduct');

describe('When invoking Query.getProduct request resolver', () => {
  it('should put productId in the resource path', () => {
    // ARRANGE
    const productId = ulid();
    const context = {
      arguments: {
        input: {
          storeId: 'x',
          productId,
        },
      },
    };

    // ACT
    const result = request(context);

    // ASSERT
    expect(result.resourcePath).toEndWith(productId);
  });

  it('should put storeId in headers', () => {
    // ARRANGE
    const storeId = ulid();
    const context = {
      arguments: {
        input: {
          storeId,
          productId: 'x',
        },
      },
    };

    // ACT
    const result = request(context);

    // ASSERT
    expect(result.params.headers['x-custom-store-id']).toEqual(storeId);
  });
});

describe('When invoking Query.getProduct response resolver', () => {
  describe('with a 200 status code', () => {
    it('should return the body', () => {
      // ARRANGE
      const body = ulid();
      const context = {
        result: {
          statusCode: 200,
          body,
        },
      };

      // ACT
      const result = response(context);

      // ASSERT
      expect(result).toEqual(body);
    });
  });
});
