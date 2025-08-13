import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  checkEntityDependencies, 
  checkStatusBasedDeletion, 
  cascadeDeleteRelatedRecords,
  genericEntityDelete,
  entityDependencies 
} from '../dependency-checker';
import { supabase } from '../../utils';

// Mock Supabase
vi.mock('../../utils', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('Dependency Checker Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkEntityDependencies', () => {
    it('should return true when entity has no dependencies', async () => {
      // Mock all dependency checks to return empty arrays
      const mockSupabaseChain = {
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await checkEntityDependencies('client', 'client-123');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe('رکورد قابل حذف است.');
    });

    it('should return false when entity has dependencies', async () => {
      // Mock first dependency check to return data
      const mockSupabaseChain = {
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'pre-order-1' }], error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await checkEntityDependencies('client', 'client-123');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.message).toBe('این مشتری دارای پیش سفارش است و قابل حذف نیست.');
    });

    it('should handle unknown entity types gracefully', async () => {
      const result = await checkEntityDependencies('unknown_entity', 'entity-123');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe('رکورد قابل حذف است.');
    });

    it('should handle database errors', async () => {
      const mockSupabaseChain = {
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await checkEntityDependencies('client', 'client-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('خطا در بررسی وابستگی‌ها.');
    });
  });

  describe('checkStatusBasedDeletion', () => {
    it('should return null for allowed status deletions', () => {
      const result = checkStatusBasedDeletion('order', 'pending');
      expect(result).toBeNull();
    });

    it('should return error message for disallowed status deletions', () => {
      const result = checkStatusBasedDeletion('order', 'invoiced');
      expect(result).toBe('سفارش فاکتور شده قابل حذف نیست.');
    });

    it('should return null for unknown entity types', () => {
      const result = checkStatusBasedDeletion('unknown_entity', 'any_status');
      expect(result).toBeNull();
    });

    it('should return null for unknown statuses', () => {
      const result = checkStatusBasedDeletion('order', 'unknown_status');
      expect(result).toBeNull();
    });
  });

  describe('cascadeDeleteRelatedRecords', () => {
    it('should successfully cascade delete related records', async () => {
      const mockSupabaseChain = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      const mockDelete = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await cascadeDeleteRelatedRecords('order', 'order-123');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe('رکوردهای مرتبط با موفقیت حذف شدند.');
    });

    it('should handle entities with no cascade rules', async () => {
      const result = await cascadeDeleteRelatedRecords('client', 'client-123');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe('رکوردهای مرتبط با موفقیت حذف شدند.');
    });
  });

  describe('genericEntityDelete', () => {
    it('should successfully delete entity with no dependencies', async () => {
      // Mock dependency check to return true
      const mockDependencySupabaseChain = {
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      // Mock main delete operation
      const mockDeleteSupabaseChain = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockDependencySupabaseChain);
      const mockDelete = vi.fn().mockReturnValue(mockDeleteSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect, 
        delete: mockDelete 
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await genericEntityDelete('client', 'client-123', 'client');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe('رکورد با موفقیت حذف شد.');
    });

    it('should fail when entity has dependencies', async () => {
      // Mock dependency check to return false
      const mockSupabaseChain = {
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'dependency-1' }], error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await genericEntityDelete('client', 'client-123', 'client');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.message).toBe('این مشتری دارای پیش سفارش است و قابل حذف نیست.');
    });

    it('should fail when additional checks fail', async () => {
      const additionalChecks = vi.fn().mockResolvedValue('Custom validation error');

      const result = await genericEntityDelete(
        'order', 
        'order-123', 
        'order', 
        additionalChecks
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Custom validation error');
    });
  });

  describe('entityDependencies configuration', () => {
    it('should have correct dependency configuration for clients', () => {
      const clientDeps = entityDependencies.client;
      
      expect(clientDeps).toBeDefined();
      expect(clientDeps.length).toBe(4);
      expect(clientDeps[0].table).toBe('pre_order');
      expect(clientDeps[0].column).toBe('client_id');
      expect(clientDeps[1].table).toBe('order');
      expect(clientDeps[2].table).toBe('pre_invoice');
      expect(clientDeps[3].table).toBe('invoice');
    });

    it('should have correct dependency configuration for pre-orders', () => {
      const preOrderDeps = entityDependencies.pre_order;
      
      expect(preOrderDeps).toBeDefined();
      expect(preOrderDeps.length).toBe(1);
      expect(preOrderDeps[0].table).toBe('order');
      expect(preOrderDeps[0].column).toBe('pre_order_id');
    });

    it('should have correct dependency configuration for orders', () => {
      const orderDeps = entityDependencies.order;
      
      expect(orderDeps).toBeDefined();
      expect(orderDeps.length).toBe(2);
      expect(orderDeps[0].table).toBe('pre_invoice');
      expect(orderDeps[1].table).toBe('invoice');
    });
  });
});