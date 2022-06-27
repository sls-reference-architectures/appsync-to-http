import Parser from 'appsync-template-tester';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ulid } from 'ulid';

describe('When resolving getProducts request template', () => {
  const template = readFileSync(
    join(__dirname, '../mappingTemplates', 'Query.getProducts.request.vtl'),
    'utf-8',
  );
  const parser = new Parser(template);

  describe('with a valid context', () => {
    it('populates storeId header', () => {
      // ARRANGE
      const storeId = ulid();
      const context = {
        arguments: {
          input: {
            storeId,
          },
        },
      };

      // ACT
      const result = parser.resolve(context);

      // ASSERT
      expect(result.params.headers['x-custom-store-id']).toEqual(storeId);
    });
  });

  describe('with no limit', () => {
    it('should set query params to empty object', () => {
      const context = {
        arguments: {
          input: {
            storeId: 'x',
          },
        },
      };

      // ACT
      const result = parser.resolve(context);

      // ASSERT
      expect(result.params.query).toBeObject();
      expect(result.params.query).toBeEmpty();
    });
  });

  describe('with a value for limit', () => {
    it('should set query params with limit', () => {
      const context = {
        arguments: {
          input: {
            storeId: 'x',
            limit: 42,
          },
        },
      };

      // ACT
      const result = parser.resolve(context);

      // ASSERT
      expect(result.params.query.limit).toEqual('42');
    });
  });

  describe('with a value for cursor', () => {
    it('should set query params with cursor', () => {
      const context = {
        arguments: {
          input: {
            storeId: 'x',
            cursor: 'abc',
          },
        },
      };

      // ACT
      const result = parser.resolve(context);

      // ASSERT
      expect(result.params.query.cursor).toEqual('abc');
    });
  });
});
