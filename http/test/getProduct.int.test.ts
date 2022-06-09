import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as service from '../src/service';

describe('When invoking service getProduct()', () => {
  it('should return Product', async () => {
    // ARRANGE
    const productId = 'x';
    const storeId = 'y';


    // ACT
    const result = await service.getProduct({ productId, storeId });

    // ASSERT
    expect(result.id).toBeString();
  });
});
