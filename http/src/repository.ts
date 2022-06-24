import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { Product } from './models';
import { GetProductInput } from './service';

export default class ProductsRepository {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
    this.docClient = DynamoDBDocumentClient.from(ddbClient);
  }

  async getProduct(input: GetProductInput): Promise<Product> {
    const { storeId, productId } = input;
    const params: GetCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: {
        storeId,
        productId,
      },
    };
    const { Item: product } = await this.docClient.send(new GetCommand(params));

    return product as Product;
  }

  async saveProduct(product: Product): Promise<void> {
    const params: PutCommandInput = {
      TableName: process.env.TABLE_NAME,
      Item: product,
    };
    await this.docClient.send(new PutCommand(params));
  }
}
