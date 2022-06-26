/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface Product {
  name: string;
  price: number;
  productId: string;
  storeId: string;
}

export interface APIGatewayProxyEventMiddyNormalized<T>
  extends Omit<APIGatewayProxyEventV2, 'body'> {
  pathParameters: NonNullable<APIGatewayProxyEventV2['pathParameters']>;
  body: T;
}

export interface PageResult<T> {
  items: T[];
  cursor?: string;
}
