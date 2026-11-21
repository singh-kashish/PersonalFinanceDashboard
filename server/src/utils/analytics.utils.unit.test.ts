import { clampRecentLimit } from './analytics.utils';

describe('clampRecentLimit', () => {
  it('clamps limit to [1, 50]', () => {
    expect(clampRecentLimit(0)).toBe(1);
    expect(clampRecentLimit(10)).toBe(10);
    expect(clampRecentLimit(999)).toBe(50);
    expect(clampRecentLimit(undefined)).toBe(50);
    expect(clampRecentLimit(50)).toBe(50);
    expect(clampRecentLimit(1)).toBe(1);
  });
});