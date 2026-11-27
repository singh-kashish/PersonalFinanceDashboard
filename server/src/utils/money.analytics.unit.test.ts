import { add, subtract, sum, percentage, allocatePercentages, toApiString, parseMoney } from './money';

describe('money module for analytics', () => {
  const D = (v: string | number) => parseMoney(String(v));

  describe('add', () => {
    it('adds two amounts', () => {
      const result = add(D('100.00'), D('50.00'));
      expect(toApiString(result)).toBe('150.00');
    });
    it('handles fractional cents', () => {
      const result = add(D('0.1'), D('0.2'));
      expect(toApiString(result)).toBe('0.30');
    });
  });

  describe('subtract', () => {
    it('subtracts expense from income', () => {
      const result = subtract(D('100.00'), D('30.00'));
      expect(toApiString(result)).toBe('70.00');
    });
    it('allows negative result (balance)', () => {
      const result = subtract(D('50.00'), D('100.00'));
      expect(toApiString(result)).toBe('-50.00');
    });
  });

  describe('sum', () => {
    it('sums multiple amounts', () => {
      const result = sum([D('10.00'), D('20.00'), D('30.00')]);
      expect(toApiString(result)).toBe('60.00');
    });
    it('empty array returns 0', () => {
      const result = sum([]);
      expect(toApiString(result)).toBe('0.00');
    });
  });

  describe('percentage', () => {
    it('computes percentage with 2 decimals', () => {
      const result = percentage(D('25'), D('100'));
      expect(toApiString(result)).toBe('25.00');
    });
    it('zero total returns 0', () => {
      const result = percentage(parseMoney('0', { allowZero: true }), parseMoney('0', { allowZero: true }));
      expect(toApiString(result)).toBe('0.00');
    });
  });

  describe('allocatePercentages', () => {
    it('three equal parts sum to 100.00', () => {
      const result = allocatePercentages([D('1'), D('1'), D('1')]);
      const strings = result.map(toApiString);
      const total = sum(result);
      expect(toApiString(total)).toBe('100.00');
      expect(strings.every(s => s === '33.33' || s === '33.34')).toBe(true);
    });
    it('one category returns 100.00', () => {
      const result = allocatePercentages([D('100')]);
      expect(toApiString(result[0]!)).toBe('100.00');
    });
    it('zero total returns all zeros', () => {
      const result = allocatePercentages([parseMoney('0', { allowZero: true }), parseMoney('0', { allowZero: true })]);
      expect(result.every(r => toApiString(r) === '0.00')).toBe(true);
    });
  });
});
