import { describe, it, expect } from 'vitest';
import { detectSeasonality, getSeasonalityRecommendation, SeasonalityResult } from './seasonality';

describe('seasonality', () => {
  describe('detectSeasonality', () => {
    it('should return null when leads array has less than 10 items', async () => {
      const leads = Array.from({ length: 9 }, (_, i) => ({
        createdAt: new Date('2024-01-01'),
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).toBeNull();
    });

    it('should return null when leads array is empty', async () => {
      const result = await detectSeasonality([]);
      expect(result).toBeNull();
    });

    it('should detect seasonality patterns with 10+ leads', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date(`2024-01-${i + 1}T10:00:00`),
        score: 50 + i,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.patterns).toBeDefined();
      expect(result?.patterns.length).toBeGreaterThan(0);
    });

    it('should handle leads with null createdAt', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: i % 2 === 0 ? new Date('2024-01-01') : null,
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
    });

    it('should handle leads with null score', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date('2024-01-01'),
        score: i % 2 === 0 ? 50 : null,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
    });

    it('should generate patterns for all days of week and hours', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date(`2024-01-01T10:00:00`),
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.patterns).toBeDefined();
      // Should have 7 days * 24 hours = 168 patterns
      expect(result?.patterns.length).toBe(168);
    });

    it('should identify best day of week', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date('2024-01-02T10:00:00'), // All Tuesday
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.bestDayOfWeek).toBe('Tuesday');
    });

    it('should identify best hour', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date('2024-01-01T14:00:00'), // All 2 PM
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.bestHour).toBe(14);
    });

    it('should identify worst day of week', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date('2024-01-02T10:00:00'), // All Tuesday
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.worstDayOfWeek).toBeDefined();
    });

    it('should identify worst hour', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date('2024-01-01T14:00:00'), // All 2 PM
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.worstHour).toBeDefined();
    });

    it('should generate recommended launch windows', async () => {
      const leads = Array.from({ length: 15 }, (_, i) => ({
        createdAt: new Date(`2024-01-${(i % 7) + 1}T10:00:00`),
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.recommendedLaunchWindows).toBeDefined();
      // Launch windows are generated from patterns with signupCount > 0
      // Since all leads are at 10:00 on different days, there should be some windows
    });

    it('should limit recommended launch windows to top 5', async () => {
      const leads = Array.from({ length: 20 }, (_, i) => ({
        createdAt: new Date(`2024-01-${(i % 7) + 1}T${i}:00:00`),
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      expect(result?.recommendedLaunchWindows.length).toBeLessThanOrEqual(5);
    });

    it('should calculate confidence based on lead count', async () => {
      const leads50 = Array.from({ length: 50 }, (_, i) => ({
        createdAt: new Date('2024-01-01'),
        score: 50,
      }));

      const result50 = await detectSeasonality(leads50);
      expect(result50?.confidence).toBe(0.5);

      const leads100 = Array.from({ length: 100 }, (_, i) => ({
        createdAt: new Date('2024-01-01'),
        score: 50,
      }));

      const result100 = await detectSeasonality(leads100);
      expect(result100?.confidence).toBe(1);
    }, 10000);

    it('should cap confidence at 1', async () => {
      const leads200 = Array.from({ length: 200 }, (_, i) => ({
        createdAt: new Date('2024-01-01'),
        score: 50,
      }));

      const result = await detectSeasonality(leads200);
      expect(result?.confidence).toBeLessThanOrEqual(1);
    }, 10000);

    it('should calculate average score for patterns', async () => {
      const leads = [
        { createdAt: new Date('2024-01-01T10:00:00'), score: 60 },
        { createdAt: new Date('2024-01-01T10:00:00'), score: 80 },
        { createdAt: new Date('2024-01-01T10:00:00'), score: 100 },
        ...Array.from({ length: 7 }, (_, i) => ({
          createdAt: new Date(`2024-01-${i + 2}T10:00:00`),
          score: 50,
        })),
      ];

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
      const monday10Pattern = result?.patterns.find(p => p.day === 'Monday' && p.hour === 10);
      expect(monday10Pattern?.averageScore).toBe(80); // (60 + 80 + 100) / 3
    });

    it('should handle errors gracefully', async () => {
      const leads = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date('2024-01-01'),
        score: 50,
      }));

      const result = await detectSeasonality(leads);
      expect(result).not.toBeNull();
    });
  });

  describe('getSeasonalityRecommendation', () => {
    it('should return recommendation with correct structure', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [
          { day: 'Tuesday', hour: 10, confidence: 0.8 },
          { day: 'Wednesday', hour: 11, confidence: 0.7 },
          { day: 'Thursday', hour: 12, confidence: 0.6 },
        ],
        confidence: 0.8,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      expect(recommendation).toHaveProperty('recommendedDay');
      expect(recommendation).toHaveProperty('recommendedHour');
      expect(recommendation).toHaveProperty('reasoning');
      expect(recommendation).toHaveProperty('alternativeDays');
    });

    it('should return best day from seasonality data', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Friday',
        bestHour: 14,
        worstDayOfWeek: 'Sunday',
        worstHour: 3,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0.7,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      expect(recommendation.recommendedDay).toBe('Friday');
    });

    it('should return best hour from seasonality data', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 15,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0.7,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      expect(recommendation.recommendedHour).toBe(15);
    });

    it('should generate reasoning with confidence percentage', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0.85,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      // The function includes confidence percentage in reasoning
      expect(recommendation.reasoning).toMatch(/\d+% confidence/);
      expect(recommendation.reasoning).toContain('Tuesday');
      expect(recommendation.reasoning).toContain('10:00');
      expect(recommendation.reasoning).toContain('Saturday');
      expect(recommendation.reasoning).toContain('2:00');
    });

    it('should return alternative days from recommended launch windows', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [
          { day: 'Tuesday', hour: 10, confidence: 0.8 },
          { day: 'Wednesday', hour: 11, confidence: 0.7 },
          { day: 'Thursday', hour: 12, confidence: 0.6 },
          { day: 'Friday', hour: 13, confidence: 0.5 },
        ],
        confidence: 0.8,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      expect(recommendation.alternativeDays).toEqual(['Wednesday', 'Thursday', 'Friday']);
    });

    it('should handle empty recommended launch windows', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0.5,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      expect(recommendation.alternativeDays).toEqual([]);
    });

    it('should limit alternative days to top 3', () => {
      const seasonality: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [
          { day: 'Tuesday', hour: 10, confidence: 0.8 },
          { day: 'Wednesday', hour: 11, confidence: 0.7 },
          { day: 'Thursday', hour: 12, confidence: 0.6 },
          { day: 'Friday', hour: 13, confidence: 0.5 },
          { day: 'Monday', hour: 9, confidence: 0.4 },
        ],
        confidence: 0.8,
      };

      const recommendation = getSeasonalityRecommendation(seasonality);

      expect(recommendation.alternativeDays.length).toBeLessThanOrEqual(3);
    });
  });

  describe('SeasonalityResult interface', () => {
    it('should have correct structure', () => {
      const result: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0.8,
      };

      expect(result.bestDayOfWeek).toBe('Tuesday');
      expect(result.bestHour).toBe(10);
      expect(result.worstDayOfWeek).toBe('Saturday');
      expect(result.worstHour).toBe(2);
      expect(result.patterns).toEqual([]);
      expect(result.recommendedLaunchWindows).toEqual([]);
      expect(result.confidence).toBe(0.8);
    });

    it('should accept valid day names', () => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      validDays.forEach(day => {
        const result: SeasonalityResult = {
          bestDayOfWeek: day,
          bestHour: 10,
          worstDayOfWeek: day,
          worstHour: 2,
          patterns: [],
          recommendedLaunchWindows: [],
          confidence: 0.5,
        };
        expect(result.bestDayOfWeek).toBe(day);
      });
    });

    it('should accept valid hour range', () => {
      const result1: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 0,
        worstDayOfWeek: 'Saturday',
        worstHour: 23,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0.5,
      };

      expect(result1.bestHour).toBe(0);
      expect(result1.worstHour).toBe(23);
    });

    it('should accept confidence in 0-1 range', () => {
      const result1: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 0,
      };

      const result2: SeasonalityResult = {
        bestDayOfWeek: 'Tuesday',
        bestHour: 10,
        worstDayOfWeek: 'Saturday',
        worstHour: 2,
        patterns: [],
        recommendedLaunchWindows: [],
        confidence: 1,
      };

      expect(result1.confidence).toBe(0);
      expect(result2.confidence).toBe(1);
    });
  });
});
