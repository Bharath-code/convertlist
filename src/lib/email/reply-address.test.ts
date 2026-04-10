import { describe, it, expect } from 'vitest';
import { generateReplyAddress } from './reply-address';

describe('reply-address', () => {
  describe('generateReplyAddress', () => {
    it('should generate reply address with lead ID', () => {
      const result = generateReplyAddress('lead-123');
      expect(result).toBe('lead_lead-123@reply.convertlist.ai');
    });

    it('should handle numeric lead ID', () => {
      const result = generateReplyAddress('123');
      expect(result).toBe('lead_123@reply.convertlist.ai');
    });

    it('should handle UUID lead ID', () => {
      const result = generateReplyAddress('550e8400-e29b-41d4-a716-446655440000');
      expect(result).toBe('lead_550e8400-e29b-41d4-a716-446655440000@reply.convertlist.ai');
    });

    it('should handle empty string lead ID', () => {
      const result = generateReplyAddress('');
      expect(result).toBe('lead_@reply.convertlist.ai');
    });

    it('should handle special characters in lead ID', () => {
      const result = generateReplyAddress('lead-123_special');
      expect(result).toBe('lead_lead-123_special@reply.convertlist.ai');
    });

    it('should always include @reply.convertlist.ai domain', () => {
      const result1 = generateReplyAddress('test-1');
      const result2 = generateReplyAddress('test-2');
      const result3 = generateReplyAddress('test-3');

      expect(result1).toContain('@reply.convertlist.ai');
      expect(result2).toContain('@reply.convertlist.ai');
      expect(result3).toContain('@reply.convertlist.ai');
    });

    it('should always prefix with lead_', () => {
      const result1 = generateReplyAddress('123');
      const result2 = generateReplyAddress('abc');
      const result3 = generateReplyAddress('xyz-789');

      expect(result1).toMatch(/^lead_/);
      expect(result2).toMatch(/^lead_/);
      expect(result3).toMatch(/^lead_/);
    });
  });
});
