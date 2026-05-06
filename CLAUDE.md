# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run lint              # ESLint check
npm run test              # lint + unit tests
npm run test:unit         # unit tests only (fast, no AWS)
npm run test:int          # integration tests against deployed AWS stack
npm run test:e2e          # end-to-end tests against deployed AWS stack
npm run deploy:http       # deploy the HTTP API stack
npm run deploy:gql        # deploy the AppSync/GraphQL stack
```

To run a single test file:

```bash
npx jest http/test/parseLimit.unit.test.js
```

Integration and e2e tests require AWS credentials and both stacks deployed. The `jest.setup.js` global setup reads stack outputs from CloudFormation (`appsyncToHttp-http-dev` and `appsyncToHttp-gql-dev`) and populates `TABLE_NAME`, `HTTP_API_URL`, `GRAPH_API_URL`, and `GRAPH_API_KEY` automatically.

## Architecture

This is a two-stack Serverless Framework reference architecture that demonstrates AppSync → HTTP → Lambda → DynamoDB with IAM auth at every hop.

### Two stacks, deploy order matters

**Stack 1: `serverless.http.yml` (`appsyncToHttp-http-dev`)**

- HTTP API Gateway (IAM-authorized) backed by Lambda functions in `http/src/`
- DynamoDB table `appsyncToHttp-http-products` (storeId HASH + productId RANGE)
- EventBridge custom event bus; a DynamoDB Stream triggers `publishProductEvents` → EventBridge

**Stack 2: `serverless.gql.yml` (`appsyncToHttp-gql-dev`)**

- AppSync API (API_KEY default + AWS_IAM additional)
- AppSync HTTP data source pointing at Stack 1's `HttpApiUrl`; AppSync signs requests with SigV4
- JS resolvers in `appSync/resolvers/` (APPSYNC_JS runtime, not VTL)
- `onProductCreated` Lambda subscribes to EventBridge and calls the `notifyProductCreated` mutation (IAM-auth) to push GraphQL subscriptions to connected clients

On first deploy, Stack 2 references Stack 1 CloudFormation outputs (`cf:appsyncToHttp-http-dev.HttpApiUrl`). Deploy Stack 1 first.

### Request flow

```
Client → AppSync (API_KEY or IAM)
         → JS Resolver (appSync/resolvers/)
           → HTTP Data Source (SigV4-signed)
             → API Gateway (IAM-authorized)
               → Lambda (http/src/handlers.js)
                 → DynamoDB
```

### Event flow (subscription)

```
DynamoDB Stream → publishProductEvents Lambda
                  → EventBridge
                    → onProductCreated Lambda (appSync/src/handlers.js)
                      → AppSync Mutation notifyProductCreated (IAM)
                        → GraphQL Subscription onProductCreated
```

### Key conventions

- `storeId` is passed as the custom HTTP header `x-custom-store-id` from AppSync resolvers to the HTTP layer; it is not a path parameter.
- AppSync resolvers use `parseHttpDataSourceResponse` from `appSync/resolvers/resolverUtils.js` for error handling in response functions.
- `getProductInternal` exposes metadata fields and is `@aws_iam`-only; `getProduct` is API_KEY accessible.
- `getProductV2` maps `price` → `cost` at the resolver level (no service change needed).
- Tests use `async-retry` for eventual-consistency assertions; integration tests have a 600 s timeout.
- `common/testHelpers.js` provides `TestHelpers` (creates/cleans up DynamoDB test data), shared GraphQL query strings, and test data factories.

### Test naming convention

| Suffix                | What it tests                                     | Requires AWS |
| --------------------- | ------------------------------------------------- | ------------ |
| `.unit.test.js`       | Pure functions (e.g., `parseLimit`)               | No           |
| `.int.test.js`        | Service/repository directly against real DynamoDB | Yes          |
| `.e2e.test.js`        | Full stack via HTTP or GraphQL                    | Yes          |
| `.narrow.e2e.test.js` | Lambda directly, bypassing AppSync                | Yes          |
| `.wide.e2e.test.js`   | Full path including AppSync subscription          | Yes          |
