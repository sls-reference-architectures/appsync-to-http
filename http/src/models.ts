import { APIGatewayProxyEventV2 } from "aws-lambda";

export interface Product extends Identity {
  name: string;
  price: number;
}

export interface Identity {
  id: string;
}

export interface APIGatewayProxyEventMiddyNormalized<T> extends Omit<APIGatewayProxyEventV2, 'body'> {
  pathParameters: NonNullable<APIGatewayProxyEventV2['pathParameters']>;
  body: T,
}