import Parser from 'appsync-template-tester';
import fs from 'fs';
import path from 'path';
import { ulid } from 'ulid';

describe('When resolving getProducts request template', () => {
  const template = fs.readFileSync(
    path.join(__dirname, '../mappingTemplates', 'Query.getProducts.request.vtl'),
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
});
