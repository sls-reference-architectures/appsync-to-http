// import axios, { AxiosRequestConfig } from 'axios';

import { TestHelpers } from '../../common/testHelpers';

// const BaseUri = process.env.GRAPH_API_URL ?? '';

describe.skip('When creating a Product', () => {
  const testHelpers = new TestHelpers();

  afterAll(async () => {
    await testHelpers.teardown();
  });
  it('should return the new id', async () => {
    expect(true).toBeTrue(); // TODO
  });
});
