import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  UpdatePreOrder,
  DeletePreOrder,
  CheckPreOrderDependencies,
} from "../pre-order";
import { supabase } from "../../utils";

// Mock Supabase
vi.mock("../../utils", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe("Pre-Order CRUD Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UpdatePreOrder", () => {
    it("should successfully update a pre-order", async () => {
      // Mock pre-order data retrieval
      const mockPreOrderData = {
        id: "pre-order-123",
        description: "توضیحات قدیمی",
        estimated_amount: 1000000,
        status: "pending",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockUpdate = vi
        .fn()
        .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      const mockFrom = vi
        .fn()
        .mockReturnValue({ select: mockSelect, update: mockUpdate });

      (supabase.from as any).mockImplementation(mockFrom);

      // Create form data
      const formData = new FormData();

      formData.append("description", "توضیحات جدید پیش سفارش");
      formData.append("estimated_amount", "2000000");
      formData.append("status", "approved");

      const result = await UpdatePreOrder("pre-order-123", formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe("پیش سفارش با موفقیت به‌روزرسانی شد.");
      expect(result.data).toBe("pre-order-123");
    });

    it("should fail when description is missing", async () => {
      const formData = new FormData();

      formData.append("description", ""); // Empty required field

      const result = await UpdatePreOrder("pre-order-123", formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("شرح پیش سفارش الزامی است.");
    });

    it("should fail when pre-order is not found", async () => {
      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: "Not found" } }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const formData = new FormData();

      formData.append("description", "توضیحات جدید");

      const result = await UpdatePreOrder("non-existent-pre-order", formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("پیش سفارش یافت نشد.");
    });

    it("should fail when trying invalid status transition", async () => {
      // Mock pre-order data with converted status
      const mockPreOrderData = {
        id: "pre-order-123",
        description: "توضیحات",
        estimated_amount: 1000000,
        status: "converted",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const formData = new FormData();

      formData.append("description", "توضیحات جدید");
      formData.append("status", "pending"); // Invalid transition from converted

      const result = await UpdatePreOrder("pre-order-123", formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        "تغییر وضعیت از converted به pending مجاز نیست",
      );
    });

    it("should fail when trying to convert non-approved pre-order", async () => {
      // Mock pre-order data with pending status
      const mockPreOrderData = {
        id: "pre-order-123",
        description: "توضیحات",
        estimated_amount: 1000000,
        status: "pending",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const formData = new FormData();

      formData.append("description", "توضیحات جدید");
      formData.append("status", "converted"); // Cannot convert from pending

      const result = await UpdatePreOrder("pre-order-123", formData);

      expect(result.success).toBe(false);
      // The status transition validation happens first, so we expect that message
      expect(result.message).toContain(
        "تغییر وضعیت از pending به converted مجاز نیست",
      );
    });

    it("should validate estimated amount format", async () => {
      // Mock pre-order data
      const mockPreOrderData = {
        id: "pre-order-123",
        description: "توضیحات",
        estimated_amount: 1000000,
        status: "pending",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const formData = new FormData();

      formData.append("description", "توضیحات جدید");
      formData.append("estimated_amount", "invalid-amount");

      const result = await UpdatePreOrder("pre-order-123", formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("مبلغ معتبر نیست");
    });
  });

  describe("DeletePreOrder", () => {
    it("should successfully delete a pre-order with no dependencies", async () => {
      // Mock pre-order data retrieval
      const mockPreOrderData = {
        status: "pending",
      };

      // Mock dependency check to return empty array (no dependencies)
      const mockDependencySupabaseChain = {
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      // Mock main delete operation
      const mockDeleteSupabaseChain = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockDelete = vi.fn().mockReturnValue(mockDeleteSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      });

      // First call returns pre-order data, subsequent calls return dependency checks
      (supabase.from as any)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValue({
          select: vi.fn().mockReturnValue(mockDependencySupabaseChain),
          delete: mockDelete,
        });

      const result = await DeletePreOrder("pre-order-123");

      expect(result.success).toBe(true);
      expect(result.message).toBe("رکورد با موفقیت حذف شد.");
      expect(result.data).toBe(true);
    });

    it("should fail to delete converted pre-order", async () => {
      // Mock pre-order data with converted status
      const mockPreOrderData = {
        status: "converted",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await DeletePreOrder("pre-order-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe("پیش سفارش تبدیل شده قابل حذف نیست.");
    });

    it("should fail to delete pre-order with dependencies", async () => {
      // Mock pre-order data
      const mockPreOrderData = {
        status: "approved",
      };

      // Mock dependency check to return data (has dependencies)
      const mockDependencySupabaseChain = {
        limit: vi
          .fn()
          .mockResolvedValue({ data: [{ id: "order-1" }], error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockPreOrderData, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      // First call returns pre-order data, second call returns dependency check
      (supabase.from as any)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValue({
          select: vi.fn().mockReturnValue(mockDependencySupabaseChain),
        });

      const result = await DeletePreOrder("pre-order-123");

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.message).toBe(
        "این پیش سفارش به سفارش تبدیل شده و قابل حذف نیست.",
      );
    });

    it("should fail when pre-order is not found", async () => {
      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: "Not found" } }),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await DeletePreOrder("non-existent-pre-order");

      expect(result.success).toBe(false);
      expect(result.message).toBe("پیش سفارش یافت نشد.");
    });
  });

  describe("CheckPreOrderDependencies", () => {
    it("should return true when pre-order has no dependencies", async () => {
      // Mock dependency check to return empty array
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CheckPreOrderDependencies("pre-order-123");

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe("رکورد قابل حذف است.");
    });

    it("should return false when pre-order has been converted to order", async () => {
      // Mock dependency check to return data
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue({ data: [{ id: "order-1" }], error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CheckPreOrderDependencies("pre-order-123");

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.message).toBe(
        "این پیش سفارش به سفارش تبدیل شده و قابل حذف نیست.",
      );
    });

    it("should handle database errors gracefully", async () => {
      // Mock database error
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CheckPreOrderDependencies("pre-order-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe("خطا در بررسی وابستگی‌ها.");
    });
  });
});
