import { parseLimit } from '../src/service';

describe('When parsing limit input', () => {
  describe('with a numbers string', () => {
    it('should return that number', () => {
      // ARRANGE
      const rawLimit = '42';

      // ACT
      const result = parseLimit(rawLimit);

      // ASSERT
      expect(result).toEqual(42);
    });
  });

  describe('with undefined', () => {
    it('should return undefined', () => {
      // ARRANGE
      const rawLimit = undefined;

      // ACT
      const result = parseLimit(rawLimit);

      // ASSERT
      expect(result).toBeUndefined();
    });
  });
});
