import { describe, it, expect } from 'vitest';
import {
  getSwitchingCostStats,
  isSwitchingCostAcceptable,
  type SwitchingCostAnalysis,
  type SwitchingCostFactors,
} from './switching-cost';

describe('switching-cost', () => {
  // Skip calculateSwitchingCost tests as they require complex AI mocking
  // The AI directory is excluded from coverage requirements

  describe('getSwitchingCostStats', () => {
    it('should calculate statistics for empty array', () => {
      const analyses: SwitchingCostAnalysis[] = [];
      const stats = getSwitchingCostStats(analyses);

      expect(stats.lowCost).toBe(0);
      expect(stats.mediumCost).toBe(0);
      expect(stats.highCost).toBe(0);
      expect(stats.averageScore).toBe(NaN);
    });

    it('should count low, medium, and high cost analyses', () => {
      const analyses: SwitchingCostAnalysis[] = [
        { overallCost: 'low', score: 20, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'low', score: 30, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'medium', score: 50, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'medium', score: 60, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'high', score: 80, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
      ];

      const stats = getSwitchingCostStats(analyses);

      expect(stats.lowCost).toBe(2);
      expect(stats.mediumCost).toBe(2);
      expect(stats.highCost).toBe(1);
    });

    it('should calculate average score correctly', () => {
      const analyses: SwitchingCostAnalysis[] = [
        { overallCost: 'low', score: 20, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'medium', score: 50, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'high', score: 80, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
      ];

      const stats = getSwitchingCostStats(analyses);

      expect(stats.averageScore).toBe(50); // (20 + 50 + 80) / 3 = 50
    });

    it('should round average score', () => {
      const analyses: SwitchingCostAnalysis[] = [
        { overallCost: 'low', score: 33, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
        { overallCost: 'medium', score: 66, factors: {} as SwitchingCostFactors, reasoning: '', recommendation: '', estimatedTimeToSwitch: '' },
      ];

      const stats = getSwitchingCostStats(analyses);

      expect(stats.averageScore).toBe(50); // (33 + 66) / 2 = 49.5, rounded to 50
    });
  });

  describe('isSwitchingCostAcceptable', () => {
    it('should return true when score is below threshold', () => {
      const analysis: SwitchingCostAnalysis = {
        overallCost: 'low',
        score: 40,
        factors: {} as SwitchingCostFactors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      expect(isSwitchingCostAcceptable(analysis, 60)).toBe(true);
    });

    it('should return true when score equals threshold', () => {
      const analysis: SwitchingCostAnalysis = {
        overallCost: 'medium',
        score: 60,
        factors: {} as SwitchingCostFactors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      expect(isSwitchingCostAcceptable(analysis, 60)).toBe(true);
    });

    it('should return false when score is above threshold', () => {
      const analysis: SwitchingCostAnalysis = {
        overallCost: 'high',
        score: 70,
        factors: {} as SwitchingCostFactors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      expect(isSwitchingCostAcceptable(analysis, 60)).toBe(false);
    });

    it('should use default threshold of 60', () => {
      const analysis: SwitchingCostAnalysis = {
        overallCost: 'medium',
        score: 61,
        factors: {} as SwitchingCostFactors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      expect(isSwitchingCostAcceptable(analysis)).toBe(false);
    });

    it('should accept custom threshold', () => {
      const analysis: SwitchingCostAnalysis = {
        overallCost: 'medium',
        score: 75,
        factors: {} as SwitchingCostFactors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      expect(isSwitchingCostAcceptable(analysis, 80)).toBe(true);
      expect(isSwitchingCostAcceptable(analysis, 70)).toBe(false);
    });
  });

  describe('SwitchingCostAnalysis interface', () => {
    it('should have correct structure', () => {
      const factors: SwitchingCostFactors = {
        dataMigration: 'low',
        learningCurve: 'medium',
        integrationDependencies: 'high',
        pricingDifference: 'low',
        contractLockIn: 'medium',
      };

      const analysis: SwitchingCostAnalysis = {
        overallCost: 'medium',
        score: 50,
        factors,
        reasoning: 'Test reasoning',
        recommendation: 'Test recommendation',
        estimatedTimeToSwitch: '1-2 months',
      };

      expect(analysis.overallCost).toBe('medium');
      expect(analysis.score).toBe(50);
      expect(analysis.factors).toEqual(factors);
      expect(analysis.reasoning).toBe('Test reasoning');
      expect(analysis.recommendation).toBe('Test recommendation');
      expect(analysis.estimatedTimeToSwitch).toBe('1-2 months');
    });

    it('should accept valid overallCost values', () => {
      const validCosts: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const factors: SwitchingCostFactors = {
        dataMigration: 'medium',
        learningCurve: 'medium',
        integrationDependencies: 'medium',
        pricingDifference: 'medium',
        contractLockIn: 'medium',
      };

      validCosts.forEach(cost => {
        const analysis: SwitchingCostAnalysis = {
          overallCost: cost,
          score: 50,
          factors,
          reasoning: '',
          recommendation: '',
          estimatedTimeToSwitch: '',
        };
        expect(analysis.overallCost).toBe(cost);
      });
    });

    it('should accept score in 0-100 range', () => {
      const factors: SwitchingCostFactors = {
        dataMigration: 'medium',
        learningCurve: 'medium',
        integrationDependencies: 'medium',
        pricingDifference: 'medium',
        contractLockIn: 'medium',
      };

      const analysis1: SwitchingCostAnalysis = {
        overallCost: 'low',
        score: 0,
        factors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      const analysis2: SwitchingCostAnalysis = {
        overallCost: 'medium',
        score: 50,
        factors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      const analysis3: SwitchingCostAnalysis = {
        overallCost: 'high',
        score: 100,
        factors,
        reasoning: '',
        recommendation: '',
        estimatedTimeToSwitch: '',
      };

      expect(analysis1.score).toBe(0);
      expect(analysis2.score).toBe(50);
      expect(analysis3.score).toBe(100);
    });
  });

  describe('SwitchingCostFactors interface', () => {
    it('should have correct structure', () => {
      const factors: SwitchingCostFactors = {
        dataMigration: 'low',
        learningCurve: 'medium',
        integrationDependencies: 'high',
        pricingDifference: 'low',
        contractLockIn: 'medium',
      };

      expect(factors.dataMigration).toBe('low');
      expect(factors.learningCurve).toBe('medium');
      expect(factors.integrationDependencies).toBe('high');
      expect(factors.pricingDifference).toBe('low');
      expect(factors.contractLockIn).toBe('medium');
    });

    it('should accept valid factor values', () => {
      const validValues: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      validValues.forEach(value => {
        const factors: SwitchingCostFactors = {
          dataMigration: value,
          learningCurve: value,
          integrationDependencies: value,
          pricingDifference: value,
          contractLockIn: value,
        };
        expect(factors.dataMigration).toBe(value);
        expect(factors.learningCurve).toBe(value);
        expect(factors.integrationDependencies).toBe(value);
        expect(factors.pricingDifference).toBe(value);
        expect(factors.contractLockIn).toBe(value);
      });
    });
  });
});
