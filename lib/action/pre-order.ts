import { ClientType, Row } from "../types";
import { supabase } from "../utils";

import { GetRowsFn, GetTotalRowsFn, ServerActionState } from "./type";

import { PreOrderData, Status } from "@/app/dashboard/pre-orders/types";

export const GetTotalPreOrders: GetTotalRowsFn = async (
  clientType,
  status,
  searchTerm,
) => {
  try {
    let query = supabase
      .from("pre_orders")
      .select("*", { count: "exact", head: true });

    // Apply status filter if not "all"
    if (status.length > 0 && !status.includes("all")) {
      query = query.in("status", status);
    }

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim() !== "") {
      query = query.ilike("description", `%${searchTerm}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error getting pre-orders count:", error);
      return {
        message: "اینترنت خود را چک کنید و دوباره تلاش کنید.",
        success: false,
      };
    }

    return {
      message: "تعداد پیش سفارش‌ها با موفقیت دریافت شد.",
      success: true,
      data: count || 0,
    };
  } catch (error) {
    console.error("Error in GetTotalPreOrders:", error);
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
    const { data, error } = await supabase.rpc("filter_pre_orders_paginated", {
      _statuses: status,
      _types: clientType,
      _limit: searchTerm === "" ? limit : 1000,
      _offset: searchTerm === "" ? (page - 1) * limit : 0,
    });

    if (error) {
      console.error("Error getting pre-orders:", error);
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
          estimated_amount: preOrder.estimated_amount ? preOrder.estimated_amount : -1,
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
  } catch (error) {
    console.error("Error in GetPreOrders:", error);
    return {
      message: "خطا در دریافت پیش سفارش‌ها.",
      success: false,
    };
  }
};

export async function AddPreOrder(formData: FormData): Promise<ServerActionState<number | null>> {
  const client_id = formData.get("client_id") as string;
  const description = formData.get("description") as string;
  const estimated_amount = formData.get("estimated_amount") as string;

  const { data, error } = await supabase
    .from("pre_orders")
    .insert({
      client_id: parseInt(client_id),
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