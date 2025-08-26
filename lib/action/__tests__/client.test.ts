import { describe, it, expect, vi, beforeEach } from "vitest";

import { UpdateClient, DeleteClient, CheckClientDependencies } from "../client";
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

describe("Client CRUD Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UpdateClient", () => {
    it("should successfully update a personal client", async () => {
      // Mock client data retrieval
      const mockClientData = {
        person_id: "person-123",
        company_id: null,
        type: "personal",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockClientData, error: null }),
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

      formData.append("name", "محمد احمدی");
      formData.append("phone", "09123456789");
      formData.append("address", "تهران، خیابان ولیعصر");
      formData.append("ssn", "0012345678");
      formData.append("postal_code", "1234567890");
      formData.append("status", "done");

      const result = await UpdateClient("client-123", formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe("اطلاعات مشتری با موفقیت به‌روزرسانی شد.");
      expect(result.data).toBe("client-123");
    });

    it("should fail when required fields are missing", async () => {
      const formData = new FormData();

      formData.append("name", ""); // Empty required field

      const result = await UpdateClient("client-123", formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("تمام فیلدهای الزامی را پر کنید.");
    });

    it("should fail when client is not found", async () => {
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

      formData.append("name", "محمد احمدی");
      formData.append("phone", "09123456789");
      formData.append("address", "تهران");
      formData.append("ssn", "0012345678");

      const result = await UpdateClient("non-existent-client", formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("مشتری یافت نشد.");
    });
  });

  describe("DeleteClient", () => {
    it("should successfully delete a client with no dependencies", async () => {
      // Mock dependency check to return true (no dependencies)
      const mockDependencyCheck = vi.fn().mockResolvedValue({
        success: true,
        data: true,
        message: "مشتری قابل حذف است.",
      });

      // Mock client data retrieval
      const mockClientData = {
        person_id: "person-123",
        company_id: null,
        type: "personal",
      };

      const mockSupabaseChain = {
        single: vi
          .fn()
          .mockResolvedValue({ data: mockClientData, error: null }),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockDelete = vi
        .fn()
        .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // Mock CheckClientDependencies
      vi.doMock("../client", async () => {
        const actual = await vi.importActual("../client");

        return {
          ...actual,
          CheckClientDependencies: mockDependencyCheck,
        };
      });

      const result = await DeleteClient("client-123");

      expect(result.success).toBe(true);
      expect(result.message).toBe("مشتری با موفقیت حذف شد.");
      expect(result.data).toBe(true);
    });

    it("should fail to delete client with dependencies", async () => {
      // Mock dependency check to return data (has dependencies)
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue({ data: [{ id: "order-1" }], error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await DeleteClient("client-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "این مشتری دارای پیش سفارش است و قابل حذف نیست.",
      );
    });
  });

  describe("CheckClientDependencies", () => {
    it("should return true when client has no dependencies", async () => {
      // Mock all dependency checks to return empty arrays
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CheckClientDependencies("client-123");

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.message).toBe("رکورد قابل حذف است.");
    });

    it("should return false when client has pre-orders", async () => {
      // Mock pre-order dependency check to return data
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue({ data: [{ id: "pre-order-1" }], error: null }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CheckClientDependencies("client-123");

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.message).toBe(
        "این مشتری دارای پیش سفارش است و قابل حذف نیست.",
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

      const result = await CheckClientDependencies("client-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe("خطا در بررسی وابستگی‌ها.");
    });
  });
});
