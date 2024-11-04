import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

export default class ProductsRepository {
  constructor() {
    const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
    this.docClient = DynamoDBDocumentClient.from(ddbClient);
  }

  async getProduct(input) {
    const { storeId, productId } = input;
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        storeId,
        productId,
      },
    };
    const { Item: product } = await this.docClient.send(new GetCommand(params));

    return product;
  }

  async saveProduct(product) {
    const params = {
      TableName: process.env.TABLE_NAME,
      Item: product,
    };
    await this.docClient.send(new PutCommand(params));
  }

  async deleteProduct(product) {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        storeId: product.storeId,
        productId: product.productId,
      },
    };
    await this.docClient.send(new DeleteCommand(params));
  }

  async getProducts(input) {
    const { storeId, limit, cursor } = input;
    const params = {
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
      items: products,
      cursor: createCursor(LastEvaluatedKey),
    };
  }
}

const createCursor = (lastEvaluatedKey) => {
  if (lastEvaluatedKey === undefined) {
    return undefined;
  }

  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
};

const parseCursor = (cursor) => {
  if (!cursor) {
    return undefined;
  }

  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
};
