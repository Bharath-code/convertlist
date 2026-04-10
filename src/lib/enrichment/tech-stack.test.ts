import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectTechStack, detectTechStackFromDomain, detectTechStackBatch, formatTechStack, TechStackEnrichment } from './tech-stack';

// Mock global fetch
global.fetch = vi.fn();

describe('tech-stack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectTechStack', () => {
    it('should return null for empty URL', async () => {
      const result = await detectTechStack('');
      expect(result).toBeNull();
    });

    it('should return null for null URL', async () => {
      const result = await detectTechStack(null as any);
      expect(result).toBeNull();
    });

    it('should detect React from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body><script src="https://unpkg.com/react"></script></body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('React');
      expect(result?.frontend).toContain('React');
    });

    it('should detect Vue from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body><script src="vue.js"></script></body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Vue');
    });

    it('should detect Node.js from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Built with Node.js and Express</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Node.js');
      expect(result?.backend).toContain('Node.js');
    });

    it('should detect AWS from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Hosted on AWS CloudFront</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('AWS');
      expect(result?.cloud).toContain('AWS');
    });

    it('should detect Stripe from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Powered by Stripe payments</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Stripe');
      expect(result?.payments).toContain('Stripe');
    });

    it('should detect multiple technologies', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Built with React and Node.js, hosted on AWS, payments via Stripe</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('React');
      expect(result?.detectedStack).toContain('Node.js');
      expect(result?.detectedStack).toContain('AWS');
      expect(result?.detectedStack).toContain('Stripe');
    });

    it('should normalize URL without http prefix', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>React app</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });

    it('should handle URL with http prefix', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>React app</body></html>',
      } as Response);

      const result = await detectTechStack('http://example.com');
      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://example.com',
        expect.any(Object)
      );
    });

    it('should handle URL with https prefix', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>React app</body></html>',
      } as Response);

      const result = await detectTechStack('https://example.com');
      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.any(Object)
      );
    });

    it('should return null when fetch fails', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).toBeNull();
    });

    it('should return null when no technologies detected', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Just a simple website</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await detectTechStack('example.com');
      expect(result).toBeNull();
    });

    it('should calculate confidence based on detections', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>React, Vue, Node.js, Python, AWS, GCP, Stripe, PayPal</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBeGreaterThan(0);
      expect(result?.confidence).toBeLessThanOrEqual(0.9);
    });

    it('should detect Angular from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body ng-app>Angular app</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Angular');
    });

    it('should detect Python/Django from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Built with Django</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Python');
    });

    it('should detect Ruby/Rails from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Ruby on Rails application</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Ruby');
    });

    it('should detect Go from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Built with Golang</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Go');
    });

    it('should detect Vercel from HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>Deployed on Vercel</body></html>',
      } as Response);

      const result = await detectTechStack('example.com');
      expect(result).not.toBeNull();
      expect(result?.detectedStack).toContain('Vercel');
    });
  });

  describe('detectTechStackFromDomain', () => {
    it('should call detectTechStack with https:// prefix', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: async () => '<html><body>React app</body></html>',
      } as Response);

      const result = await detectTechStackFromDomain('example.com');
      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.any(Object)
      );
    });

    it('should return null when detectTechStack returns null', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const result = await detectTechStackFromDomain('example.com');
      expect(result).toBeNull();
    });
  });

  describe('detectTechStackBatch', () => {
    it('should detect tech stacks for multiple domains', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html><body>React app</body></html>',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html><body>Vue app</body></html>',
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      const results = await detectTechStackBatch(['example.com', 'test.com', 'invalid.com']);

      expect(results.size).toBe(2);
      expect(results.get('example.com')?.detectedStack).toContain('React');
      expect(results.get('test.com')?.detectedStack).toContain('Vue');
      expect(results.get('invalid.com')).toBeUndefined();
    });

    it('should return empty map when no domains provided', async () => {
      const results = await detectTechStackBatch([]);
      expect(results.size).toBe(0);
    });

    it('should handle empty domains array', async () => {
      const results = await detectTechStackBatch([]);
      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });
  });

  describe('formatTechStack', () => {
    it('should format tech stack as comma-separated string', () => {
      const stack: TechStackEnrichment = {
        detectedStack: ['React', 'Node.js', 'AWS'],
        frontend: ['React'],
        backend: ['Node.js'],
        cloud: ['AWS'],
        payments: [],
        confidence: 0.7,
      };

      const formatted = formatTechStack(stack);
      expect(formatted).toBe('React, Node.js, AWS');
    });

    it('should handle empty tech stack', () => {
      const stack: TechStackEnrichment = {
        detectedStack: [],
        frontend: [],
        backend: [],
        cloud: [],
        payments: [],
        confidence: 0,
      };

      const formatted = formatTechStack(stack);
      expect(formatted).toBe('');
    });

    it('should handle single technology', () => {
      const stack: TechStackEnrichment = {
        detectedStack: ['React'],
        frontend: ['React'],
        backend: [],
        cloud: [],
        payments: [],
        confidence: 0.5,
      };

      const formatted = formatTechStack(stack);
      expect(formatted).toBe('React');
    });
  });

  describe('TechStackEnrichment interface', () => {
    it('should have correct structure', () => {
      const stack: TechStackEnrichment = {
        detectedStack: ['React', 'Node.js'],
        frontend: ['React'],
        backend: ['Node.js'],
        cloud: ['AWS'],
        payments: ['Stripe'],
        confidence: 0.8,
      };

      expect(stack.detectedStack).toEqual(['React', 'Node.js']);
      expect(stack.frontend).toEqual(['React']);
      expect(stack.backend).toEqual(['Node.js']);
      expect(stack.cloud).toEqual(['AWS']);
      expect(stack.payments).toEqual(['Stripe']);
      expect(stack.confidence).toBe(0.8);
    });
  });
});
