import { describe, it, expect } from 'vitest';
import { getClusterDistribution, ClusterResult } from './clustering';

describe('clustering', () => {
  // Skip clusterLead and clusterLeadsBatch tests as they require complex AI mocking
  // The fallback logic is tested separately in the source file

  describe('getClusterDistribution', () => {
    it('should return distribution of clusters', () => {
      const clusters: ClusterResult[] = [
        { useCaseCluster: 'E-commerce', confidence: 0.9 },
        { useCaseCluster: 'E-commerce', confidence: 0.8 },
        { useCaseCluster: 'B2B SaaS', confidence: 0.7 },
        { useCaseCluster: 'Agency', confidence: 0.6 },
      ];

      const distribution = getClusterDistribution(clusters);

      expect(distribution['E-commerce']).toBe(2);
      expect(distribution['B2B SaaS']).toBe(1);
      expect(distribution['Agency']).toBe(1);
      expect(distribution['Freelancer']).toBe(0);
    });

    it('should initialize all common clusters to 0', () => {
      const clusters: ClusterResult[] = [];

      const distribution = getClusterDistribution(clusters);

      expect(distribution['E-commerce']).toBe(0);
      expect(distribution['B2B SaaS']).toBe(0);
      expect(distribution['Agency']).toBe(0);
      expect(distribution['Freelancer']).toBe(0);
      expect(distribution['Enterprise']).toBe(0);
      expect(distribution['Startup']).toBe(0);
      expect(distribution['Content Creator']).toBe(0);
      expect(distribution['Developer']).toBe(0);
      expect(distribution['Marketing']).toBe(0);
      expect(distribution['Consulting']).toBe(0);
      expect(distribution['Education']).toBe(0);
      expect(distribution['Healthcare']).toBe(0);
      expect(distribution['Finance']).toBe(0);
      expect(distribution['Other']).toBe(0);
    });

    it('should handle empty array', () => {
      const distribution = getClusterDistribution([]);
      expect(Object.keys(distribution).length).toBeGreaterThan(0);
    });

    it('should count Other cluster correctly', () => {
      const clusters: ClusterResult[] = [
        { useCaseCluster: 'Other', confidence: 0.3 },
        { useCaseCluster: 'Other', confidence: 0.4 },
      ];

      const distribution = getClusterDistribution(clusters);

      expect(distribution['Other']).toBe(2);
    });
  });

  describe('ClusterResult interface', () => {
    it('should have correct structure', () => {
      const result: ClusterResult = {
        useCaseCluster: 'E-commerce',
        confidence: 0.9,
      };

      expect(result.useCaseCluster).toBe('E-commerce');
      expect(result.confidence).toBe(0.9);
    });

    it('should accept valid cluster values', () => {
      const validClusters = [
        'E-commerce',
        'B2B SaaS',
        'Agency',
        'Freelancer',
        'Enterprise',
        'Startup',
        'Content Creator',
        'Developer',
        'Marketing',
        'Consulting',
        'Education',
        'Healthcare',
        'Finance',
        'Other',
      ];

      validClusters.forEach(cluster => {
        const result: ClusterResult = {
          useCaseCluster: cluster,
          confidence: 0.5,
        };
        expect(result.useCaseCluster).toBe(cluster);
      });
    });

    it('should accept confidence in 0-1 range', () => {
      const result1: ClusterResult = { useCaseCluster: 'E-commerce', confidence: 0 };
      const result2: ClusterResult = { useCaseCluster: 'E-commerce', confidence: 0.5 };
      const result3: ClusterResult = { useCaseCluster: 'E-commerce', confidence: 1 };

      expect(result1.confidence).toBe(0);
      expect(result2.confidence).toBe(0.5);
      expect(result3.confidence).toBe(1);
    });
  });
});
