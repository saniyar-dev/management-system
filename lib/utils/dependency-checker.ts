import { supabase } from "../utils";
import { ServerActionState } from "../action/type";

// Generic dependency configuration
export interface DependencyConfig {
  table: string;
  column: string;
  message: string;
}

// Entity dependency configurations
export const entityDependencies: Record<string, DependencyConfig[]> = {
  client: [
    { table: "pre_order", column: "client_id", message: "این مشتری دارای پیش سفارش است و قابل حذف نیست." },
    { table: "order", column: "client_id", message: "این مشتری دارای سفارش است و قابل حذف نیست." },
    { table: "pre_invoice", column: "client_id", message: "این مشتری دارای پیش فاکتور است و قابل حذف نیست." },
    { table: "invoice", column: "client_id", message: "این مشتری دارای فاکتور است و قابل حذف نیست." },
  ],
  pre_order: [
    { table: "order", column: "pre_order_id", message: "این پیش سفارش به سفارش تبدیل شده و قابل حذف نیست." },
  ],
  order: [
    { table: "pre_invoice", column: "order_id", message: "این سفارش دارای پیش فاکتور است و قابل حذف نیست." },
    { table: "invoice", column: "order_id", message: "این سفارش فاکتور شده و قابل حذف نیست." },
  ],
  pre_invoice: [
    { table: "invoice", column: "pre_invoice_id", message: "این پیش فاکتور به فاکتور تبدیل شده و قابل حذف نیست." },
  ],
  // invoices typically don't have dependencies that prevent deletion
  invoice: [],
};

/**
 * Generic dependency checker for any entity
 * @param entityType - The type of entity (client, pre_order, order, etc.)
 * @param entityId - The ID of the entity to check
 * @returns Promise<ServerActionState<boolean>> - true if safe to delete, false if has dependencies
 */
export async function checkEntityDependencies(
  entityType: string,
  entityId: string
): Promise<ServerActionState<boolean>> {
  try {
    const dependencies = entityDependencies[entityType] || [];

    for (const dependency of dependencies) {
      const { data, error } = await supabase
        .from(dependency.table as any)
        .select("id")
        .eq(dependency.column, entityId)
        .limit(1);

      if (error) {
        return {
          message: "خطا در بررسی وابستگی‌ها.",
          success: false,
        };
      }

      if (data && data.length > 0) {
        return {
          message: dependency.message,
          success: true,
          data: false,
        };
      }
    }

    // No dependencies found
    return {
      message: "رکورد قابل حذف است.",
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      message: "خطای سرور در بررسی وابستگی‌ها.",
      success: false,
    };
  }
}

/**
 * Check if an entity can be deleted based on its status
 * @param entityType - The type of entity
 * @param status - Current status of the entity
 * @returns string | null - Error message if deletion not allowed, null if allowed
 */
export function checkStatusBasedDeletion(entityType: string, status: string): string | null {
  const statusRules: Record<string, Record<string, string>> = {
    order: {
      invoiced: "سفارش فاکتور شده قابل حذف نیست.",
      completed: "سفارش تکمیل شده قابل حذف نیست.",
    },
    invoice: {
      paid: "فاکتور پرداخت شده قابل حذف نیست.",
      finalized: "فاکتور نهایی شده قابل حذف نیست.",
    },
    pre_order: {
      converted: "پیش سفارش تبدیل شده قابل حذف نیست.",
    },
  };

  const entityRules = statusRules[entityType];
  if (entityRules && entityRules[status]) {
    return entityRules[status];
  }

  return null;
}

/**
 * Cascade delete related records for an entity
 * @param entityType - The type of entity being deleted
 * @param entityId - The ID of the entity being deleted
 * @returns Promise<ServerActionState<boolean>> - Success/failure of cascade deletion
 */
export async function cascadeDeleteRelatedRecords(
  entityType: string,
  entityId: string
): Promise<ServerActionState<boolean>> {
  try {
    // Define cascade deletion rules
    const cascadeRules: Record<string, Array<{ table: string; column: string }>> = {
      client: [
        // When deleting a client, we handle person/company deletion in the main delete function
        // No automatic cascade here to avoid accidental data loss
      ],
      pre_order: [
        // Pre-orders don't typically cascade delete other records
      ],
      order: [
        // Orders might cascade delete related order items if they exist
        // { table: "order_item", column: "order_id" },
      ],
      pre_invoice: [
        // Pre-invoices might cascade delete related line items
        // { table: "pre_invoice_item", column: "pre_invoice_id" },
      ],
      invoice: [
        // Invoices might cascade delete related line items
        // { table: "invoice_item", column: "invoice_id" },
      ],
    };

    const cascadeTargets = cascadeRules[entityType] || [];

    for (const target of cascadeTargets) {
      const { error } = await supabase
        .from(target.table as any)
        .delete()
        .eq(target.column, entityId);

      if (error) {
        console.error(`Error cascading delete from ${target.table}:`, error);
        // Continue with other deletions even if one fails
      }
    }

    return {
      message: "رکوردهای مرتبط با موفقیت حذف شدند.",
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      message: "خطا در حذف رکوردهای مرتبط.",
      success: false,
    };
  }
}

/**
 * Generic delete function that handles dependency checking and cascade deletion
 * @param entityType - The type of entity to delete
 * @param entityId - The ID of the entity to delete
 * @param tableName - The main table name for the entity
 * @param additionalChecks - Optional additional validation function
 * @returns Promise<ServerActionState<boolean>>
 */
export async function genericEntityDelete(
  entityType: string,
  entityId: string,
  tableName: string,
  additionalChecks?: (entityId: string) => Promise<string | null>
): Promise<ServerActionState<boolean>> {
  try {
    // Run additional checks if provided
    if (additionalChecks) {
      const additionalError = await additionalChecks(entityId);
      if (additionalError) {
        return {
          message: additionalError,
          success: false,
        };
      }
    }

    // Check dependencies
    const dependencyCheck = await checkEntityDependencies(entityType, entityId);
    if (!dependencyCheck.success || dependencyCheck.data === false) {
      return dependencyCheck;
    }

    // Cascade delete related records
    await cascadeDeleteRelatedRecords(entityType, entityId);

    // Delete the main entity
    const { error } = await supabase
      .from(tableName as any)
      .delete()
      .eq("id", entityId);

    if (error) {
      return {
        message: "خطا در حذف رکورد.",
        success: false,
      };
    }

    return {
      message: "رکورد با موفقیت حذف شد.",
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      message: "خطای سرور. لطفاً دوباره تلاش کنید.",
      success: false,
    };
  }
}