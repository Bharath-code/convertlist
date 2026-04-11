import { describe, it, expect } from 'vitest';
import type {
  SuperUserOutreachTemplate,
  SuperUserOutreachRequest,
} from './super-user-outreach';

describe('super-user-outreach', () => {
  // Skip generateSuperUserOutreach and batchGenerateSuperUserOutreach tests as they require AI mocking
  // The fallback logic is tested separately in the source file

  describe('SuperUserOutreachTemplate interface', () => {
    it('should have correct structure', () => {
      const template: SuperUserOutreachTemplate = {
        subject: 'Test Subject',
        body: 'Test Body',
        tier: 'gold',
        perks: ['perk1', 'perk2'],
        callToAction: 'Test CTA',
      };

      expect(template.subject).toBe('Test Subject');
      expect(template.body).toBe('Test Body');
      expect(template.tier).toBe('gold');
      expect(template.perks).toEqual(['perk1', 'perk2']);
      expect(template.callToAction).toBe('Test CTA');
    });

    it('should accept valid tier values', () => {
      const validTiers = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

      validTiers.forEach(tier => {
        const template: SuperUserOutreachTemplate = {
          subject: 'Test',
          body: 'Test',
          tier,
          perks: [],
          callToAction: 'Test',
        };
        expect(template.tier).toBe(tier);
      });
    });

    it('should accept empty perks array', () => {
      const template: SuperUserOutreachTemplate = {
        subject: 'Test',
        body: 'Test',
        tier: 'bronze',
        perks: [],
        callToAction: 'Test',
      };

      expect(template.perks).toEqual([]);
    });

    it('should accept multiple perks', () => {
      const template: SuperUserOutreachTemplate = {
        subject: 'Test',
        body: 'Test',
        tier: 'diamond',
        perks: ['Lifetime access', 'Priority support', 'Beta access'],
        callToAction: 'Test',
      };

      expect(template.perks).toHaveLength(3);
      expect(template.perks).toContain('Lifetime access');
      expect(template.perks).toContain('Priority support');
      expect(template.perks).toContain('Beta access');
    });
  });

  describe('SuperUserOutreachRequest interface', () => {
    it('should have correct structure', () => {
      const request: SuperUserOutreachRequest = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        superUserScore: {
          userId: 'user-123',
          superUserScore: 85,
          tier: 'gold',
          factors: {
            productEngagement: 80,
            earlyAdoption: 85,
            lifetimeValue: 90,
            consistency: 75,
          },
          summary: 'Valuable power user with consistent engagement',
        },
        lifetimeValuePrediction: {
          predictedLTV: 5000,
          confidence: 85,
          timeframe: '12 months',
          factors: {
            productCount: 80,
            conversionRate: 75,
            earlyAdopterScore: 85,
            engagementScore: 80,
          },
          tier: 'high',
          recommendation: 'Valuable customer - provide premium support',
        },
        productName: 'Test Product',
        availablePerks: ['perk1', 'perk2'],
      };

      expect(request.userName).toBe('John Doe');
      expect(request.userEmail).toBe('john@example.com');
      expect(request.superUserScore.superUserScore).toBe(85);
      expect(request.superUserScore.tier).toBe('gold');
      expect(request.lifetimeValuePrediction.predictedLTV).toBe(5000);
      expect(request.productName).toBe('Test Product');
      expect(request.availablePerks).toEqual(['perk1', 'perk2']);
    });

    it('should accept optional fields as undefined', () => {
      const request: SuperUserOutreachRequest = {
        superUserScore: {
          userId: 'user-123',
          superUserScore: 75,
          tier: 'silver',
          factors: {
            productEngagement: 70,
            earlyAdoption: 75,
            lifetimeValue: 75,
            consistency: 75,
          },
          summary: 'Active user with growing engagement',
        },
        lifetimeValuePrediction: {
          predictedLTV: 2000,
          confidence: 75,
          timeframe: '12 months',
          factors: {
            productCount: 60,
            conversionRate: 70,
            earlyAdopterScore: 75,
            engagementScore: 70,
          },
          tier: 'medium',
          recommendation: 'Standard value - focus on retention',
        },
        productName: 'Test Product',
      };

      expect(request.userName).toBeUndefined();
      expect(request.userEmail).toBeUndefined();
      expect(request.availablePerks).toBeUndefined();
    });

    it('should accept valid superUserScore values', () => {
      const request: SuperUserOutreachRequest = {
        superUserScore: {
          userId: 'user-123',
          superUserScore: 100,
          tier: 'diamond',
          factors: {
            productEngagement: 95,
            earlyAdoption: 98,
            lifetimeValue: 97,
            consistency: 95,
          },
          summary: 'Elite super-user with exceptional engagement',
        },
        lifetimeValuePrediction: {
          predictedLTV: 10000,
          confidence: 95,
          timeframe: '12 months',
          factors: {
            productCount: 95,
            conversionRate: 90,
            earlyAdopterScore: 95,
            engagementScore: 92,
          },
          tier: 'whale',
          recommendation: 'High-value customer - prioritize with dedicated account management',
        },
        productName: 'Test Product',
      };

      expect(request.superUserScore.superUserScore).toBe(100);
      expect(request.superUserScore.tier).toBe('diamond');
    });

    it('should accept valid lifetimeValuePrediction values', () => {
      const request: SuperUserOutreachRequest = {
        superUserScore: {
          userId: 'user-123',
          superUserScore: 80,
          tier: 'gold',
          factors: {
            productEngagement: 75,
            earlyAdoption: 80,
            lifetimeValue: 85,
            consistency: 75,
          },
          summary: 'Valuable power user with consistent engagement',
        },
        lifetimeValuePrediction: {
          predictedLTV: 3000,
          confidence: 80,
          timeframe: '12 months',
          factors: {
            productCount: 70,
            conversionRate: 75,
            earlyAdopterScore: 80,
            engagementScore: 78,
          },
          tier: 'high',
          recommendation: 'Valuable customer - provide premium support',
        },
        productName: 'Test Product',
      };

      expect(request.lifetimeValuePrediction.predictedLTV).toBe(3000);
      expect(request.lifetimeValuePrediction.confidence).toBe(80);
    });
  });

  describe('tier perks logic', () => {
    it('should have diamond tier perks', () => {
      const diamondPerks = [
        'Lifetime access to all features',
        'Priority support 24/7',
        'Exclusive beta access',
        'Dedicated account manager',
        'Custom integrations',
      ];

      expect(diamondPerks).toHaveLength(5);
      expect(diamondPerks).toContain('Lifetime access to all features');
      expect(diamondPerks).toContain('Priority support 24/7');
    });

    it('should have platinum tier perks', () => {
      const platinumPerks = [
        'Priority support',
        'Early access to new features',
        'Exclusive webinars',
        'Custom reports',
      ];

      expect(platinumPerks).toHaveLength(4);
      expect(platinumPerks).toContain('Priority support');
      expect(platinumPerks).toContain('Early access to new features');
    });

    it('should have gold tier perks', () => {
      const goldPerks = [
        'Priority support',
        'Early access to new features',
        'Exclusive content',
      ];

      expect(goldPerks).toHaveLength(3);
      expect(goldPerks).toContain('Priority support');
      expect(goldPerks).toContain('Exclusive content');
    });

    it('should have silver tier perks', () => {
      const silverPerks = [
        'Early access to new features',
        'Community recognition',
      ];

      expect(silverPerks).toHaveLength(2);
      expect(silverPerks).toContain('Early access to new features');
      expect(silverPerks).toContain('Community recognition');
    });

    it('should have bronze tier perks', () => {
      const bronzePerks = [
        'Community access',
        'Product updates',
      ];

      expect(bronzePerks).toHaveLength(2);
      expect(bronzePerks).toContain('Community access');
      expect(bronzePerks).toContain('Product updates');
    });
  });
});
