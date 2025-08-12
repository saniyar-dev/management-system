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
    const { data, error } = await supabase.rpc("filter_pre_order_paginated", {
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

export async function AddPreOrder(formData: FormData): Promise<ServerActionState<string | null>> {
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
    console.log(error)
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