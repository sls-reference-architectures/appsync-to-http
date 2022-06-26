import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { PageResult, Product } from './models';
import { GetProductInput, GetProductsInput } from './service';

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

  async deleteProduct(product: Product): Promise<void> {
    const params: DeleteCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: {
        storeId: product.storeId,
        productId: product.productId,
      },
    };
    await this.docClient.send(new DeleteCommand(params));
  }

  async getProducts(input: GetProductsInput): Promise<PageResult<Product>> {
    const { storeId, limit, cursor } = input;
    const params: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'storeId = :storeId',
      ExpressionAttributeValues: {
        ':storeId': storeId,
      },
      Limit: limit,
      ExclusiveStartKey: parseCursor(cursor),
    };
    const { Items: products, LastEvaluatedKey } = await this.docClient.send(
      new QueryCommand(params),
    );

    return {
      items: products as Product[],
      cursor: createCursor(LastEvaluatedKey),
    };
  }
}

const createCursor = (lastEvaluatedKey: Record<string, any> | undefined): string | undefined => {
  if (lastEvaluatedKey === undefined) {
    return undefined;
  }

  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
};

const parseCursor = (cursor: string | undefined): Record<string, any> | undefined => {
  if (!cursor) {
    return undefined;
  }

  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
};
