import { ClientType, Row } from "../types";
import { supabase } from "../utils";
import {
  persianValidationRules,
  businessRuleValidators,
} from "../utils/persian-validation";
import {
  checkEntityDependencies,
  checkStatusBasedDeletion,
  genericEntityDelete,
} from "../utils/dependency-checker";

import { GetRowsFn, GetTotalRowsFn, ServerActionState } from "./type";

import { PreOrderData, Status } from "@/app/dashboard/pre-orders/types";

export const GetTotalPreOrders: GetTotalRowsFn = async (clientType, status) => {
  try {
    const { data, error } = await supabase.rpc("filtered_pre_order_total", {
      _statuses: status,
      _types: clientType,
    });

    if (error) {
      return {
        message: "اینترنت خود را چک کنید و دوباره تلاش کنید.",
        success: false,
      };
    }

    return {
      message: "اطلاعات با موفقیت دریافت شدند.",
      success: true,
      data: data,
    };
    // should add error to data type for further and better error handling
  } catch {
    return {
      message: "خطا در دریافت تعداد پیش سفارش‌ها.",
      success: false,
    };
  }
};

export const GetPreOrders: GetRowsFn<PreOrderData, Status> = async (
  start,
  end,
  clientType,
  status,
  searchTerm,
  limit,
  page,
) => {
  try {
    const { data, error } = await supabase.rpc("filter_pre_order_paginated", {
      _statuses: status,
      _types: clientType,
      _limit: searchTerm === "" ? limit : 1000,
      _offset: searchTerm === "" ? (page - 1) * limit : 0,
    });

    if (error) {
      return {
        message: "ایراد سمت سرور لطفا اینترنت خود را بررسی کنید.",
        success: false,
      };
    }

    const preOrders = data.map((preOrder): Row<PreOrderData, Status> => {
      return {
        id: preOrder.id,
        data: {
          id: preOrder.id,
          client_name: preOrder.client_name,
          description: preOrder.description,
          estimated_amount: preOrder.estimated_amount
            ? preOrder.estimated_amount
            : -1,
          created_at: preOrder.created_at,
          client_id: preOrder.client_id,
        },
        status: preOrder.status as Status,
        type: preOrder.type as ClientType,
      };
    });

    return {
      message: "اطلاعات با موفقیت دریافت شدند.",
      success: true,
      data: preOrders,
    };
  } catch {
    return {
      message: "خطا در دریافت پیش سفارش‌ها.",
      success: false,
    };
  }
};

export async function AddPreOrder(
  formData: FormData,
): Promise<ServerActionState<string | null>> {
  const client_id = formData.get("client_id") as string;
  const client_name = formData.get("client_name") as string;
  const client_type = formData.get("client_type") as string;
  const description = formData.get("description") as string;
  const estimated_amount = formData.get("estimated_amount") as string;

  const { data, error } = await supabase
    .from("pre_order")
    .insert({
      client_id: client_id,
      client_name,
      type: client_type,
      description,
      estimated_amount: parseFloat(estimated_amount),
      status: "pending",
    })
    .select();

  if (error || !data) {
    return {
      message: "ثبت پیش سفارش موفقیت آمیز نبود دوباره تلاش کنید.",
      success: false,
      data: null,
    };
  }

  return {
    message: "ثبت پیش سفارش با موفقیت انجام شد.",
    success: true,
    data: data[0].id,
  };
}

export async function UpdatePreOrder(
  id: string,
  formData: FormData,
): Promise<ServerActionState<string>> {
  try {
    // Get current pre-order data
    const { data: preOrderData, error: preOrderError } = await supabase
      .from("pre_order")
      .select("*")
      .eq("id", id)
      .single();

    if (preOrderError || !preOrderData) {
      return {
        message: "پیش سفارش یافت نشد.",
        success: false,
      };
    }

    // Extract form data
    const description = formData.get("description") as string;
    const estimated_amount = formData.get("estimated_amount") as string;
    const status = formData.get("status") as Status;

    // Validate required fields
    if (!description) {
      return {
        message: "شرح پیش سفارش الزامی است.",
        success: false,
      };
    }

    // Validate description
    const descriptionValidation =
      persianValidationRules.persianText(description);

    if (descriptionValidation) {
      return {
        message: descriptionValidation,
        success: false,
      };
    }

    // Validate estimated amount if provided
    if (estimated_amount) {
      const amountValidation =
        persianValidationRules.currency(estimated_amount);

      if (amountValidation) {
        return {
          message: amountValidation,
          success: false,
        };
      }
    }

    // Validate status transition if status is being changed
    if (status && status !== preOrderData.status) {
      const allowedTransitions: Record<Status, Status[]> = {
        pending: ["approved", "rejected"],
        approved: ["converted", "rejected"],
        rejected: ["pending"],
        converted: [], // Cannot change from converted
      };

      const transitionValidation =
        businessRuleValidators.validateStatusTransition(
          preOrderData.status,
          status,
          allowedTransitions,
        );

      if (transitionValidation) {
        return {
          message: transitionValidation,
          success: false,
        };
      }

      // Additional business rule: cannot convert if not approved
      if (status === "converted" && preOrderData.status !== "approved") {
        return {
          message: "فقط پیش سفارش‌های تایید شده قابل تبدیل به سفارش هستند.",
          success: false,
        };
      }
    }

    // Prepare update data
    const updateData: any = {
      description,
    };

    if (estimated_amount) {
      updateData.estimated_amount = parseFloat(estimated_amount);
    }

    if (status) {
      updateData.status = status;
    }

    // Update pre-order
    const { error: updateError } = await supabase
      .from("pre_order")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      return {
        message: "خطا در به‌روزرسانی پیش سفارش.",
        success: false,
      };
    }

    return {
      message: "پیش سفارش با موفقیت به‌روزرسانی شد.",
      success: true,
      data: id,
    };
  } catch (error) {
    return {
      message: "خطای سرور. لطفاً دوباره تلاش کنید.",
      success: false,
    };
  }
}

export async function DeletePreOrder(
  id: string,
): Promise<ServerActionState<boolean>> {
  try {
    // Get current pre-order data to check status
    const { data: preOrderData, error: preOrderError } = await supabase
      .from("pre_order")
      .select("status")
      .eq("id", id)
      .single();

    if (preOrderError || !preOrderData) {
      return {
        message: "پیش سفارش یافت نشد.",
        success: false,
      };
    }

    // Check status-based deletion rules
    const statusCheck = checkStatusBasedDeletion(
      "pre_order",
      preOrderData.status,
    );

    if (statusCheck) {
      return {
        message: statusCheck,
        success: false,
      };
    }

    // Use generic entity delete which handles dependency checking
    return await genericEntityDelete("pre_order", id, "pre_order");
  } catch (error) {
    return {
      message: "خطای سرور. لطفاً دوباره تلاش کنید.",
      success: false,
    };
  }
}

export async function CheckPreOrderDependencies(
  id: string,
): Promise<ServerActionState<boolean>> {
  return await checkEntityDependencies("pre_order", id);
}
