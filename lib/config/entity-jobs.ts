import { EntityJobConfig } from "../action/crud-types";

// Entity-specific job configurations
export const entityJobConfigs: Record<string, EntityJobConfig> = {
  client: {
    view: [
      { name: "بررسی اطلاعات مشتری", url: "https://example.com/client/view" },
      { name: "بررسی سابقه مشتری", url: "https://example.com/client/history" }
    ],
    edit: [
      { name: "به‌روزرسانی اطلاعات", url: "https://example.com/client/update" },
      { name: "اعتبارسنجی اطلاعات", url: "https://example.com/client/validate" }
    ],
    delete: [
      { name: "بررسی وابستگی‌ها", url: "https://example.com/client/dependencies" },
      { name: "حذف از سیستم", url: "https://example.com/client/delete" }
    ]
  },

  preOrder: {
    view: [
      { name: "بررسی پیش سفارش", url: "https://example.com/preorder/view" },
      { name: "بررسی اطلاعات مشتری", url: "https://example.com/preorder/client" }
    ],
    edit: [
      { name: "ویرایش پیش سفارش", url: "https://example.com/preorder/update" },
      { name: "محاسبه مجدد مبلغ", url: "https://example.com/preorder/calculate" }
    ],
    delete: [
      { name: "بررسی امکان لغو", url: "https://example.com/preorder/check" },
      { name: "لغو پیش سفارش", url: "https://example.com/preorder/cancel" }
    ]
  },

  order: {
    view: [
      { name: "بررسی سفارش", url: "https://example.com/order/view" },
      { name: "بررسی وضعیت تولید", url: "https://example.com/order/production" }
    ],
    edit: [
      { name: "ویرایش سفارش", url: "https://example.com/order/update" },
      { name: "به‌روزرسانی وضعیت", url: "https://example.com/order/status" }
    ],
    delete: [
      { name: "بررسی امکان حذف", url: "https://example.com/order/check" },
      { name: "لغو سفارش", url: "https://example.com/order/cancel" }
    ]
  },

  preInvoice: {
    view: [
      { name: "بررسی پیش فاکتور", url: "https://example.com/preinvoice/view" },
      { name: "محاسبه مالیات", url: "https://example.com/preinvoice/tax" }
    ],
    edit: [
      { name: "ویرایش پیش فاکتور", url: "https://example.com/preinvoice/update" },
      { name: "محاسبه مجدد", url: "https://example.com/preinvoice/recalculate" }
    ],
    delete: [
      { name: "بررسی امکان حذف", url: "https://example.com/preinvoice/check" },
      { name: "حذف پیش فاکتور", url: "https://example.com/preinvoice/delete" }
    ]
  },

  invoice: {
    view: [
      { name: "بررسی فاکتور", url: "https://example.com/invoice/view" },
      { name: "بررسی وضعیت پرداخت", url: "https://example.com/invoice/payment" }
    ],
    edit: [
      { name: "ویرایش فاکتور", url: "https://example.com/invoice/update" },
      { name: "به‌روزرسانی پرداخت", url: "https://example.com/invoice/payment-update" }
    ],
    delete: [
      { name: "بررسی امکان ابطال", url: "https://example.com/invoice/check" },
      { name: "ابطال فاکتور", url: "https://example.com/invoice/void" }
    ]
  }
};

// Helper function to get job configuration for an entity and operation
export const getEntityJobConfig = (
  entityType: string, 
  operation: 'view' | 'edit' | 'delete'
): { name: string; url: string }[] => {
  const config = entityJobConfigs[entityType];
  if (!config) {
    console.warn(`No job configuration found for entity type: ${entityType}`);
    return [];
  }
  
  return config[operation] || [];
};

// Helper function to get all job configurations for an entity
export const getAllEntityJobConfigs = (entityType: string): EntityJobConfig | null => {
  return entityJobConfigs[entityType] || null;
};