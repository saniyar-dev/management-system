import { supabase } from "../utils";

import { GetRowsFn, GetTotalRowsFn } from "./type";

import { OrderData, Status } from "@/app/dashboard/orders/types";

export const GetTotalOrders: GetTotalRowsFn = async (
  clientType,
  status,
  searchTerm,
) => {
  try {
    let query = supabase
      .from("order")
      .select("*", { count: "exact", head: true });

    // Apply status filter if not "all"
    if (status.length > 0 && !status.includes("all")) {
      query = query.in("status", status);
    }

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim() !== "") {
      query = query.or(
        `description.ilike.%${searchTerm}%,order_number.ilike.%${searchTerm}%`,
      );
    }

    const { count, error } = await query;

    if (error) {
      return {
        message: "اینترنت خود را چک کنید و دوباره تلاش کنید.",
        success: false,
      };
    }

    return {
      message: "تعداد سفارش‌ها با موفقیت دریافت شد.",
      success: true,
      data: count || 0,
    };
  } catch {
    return {
      message: "خطا در دریافت تعداد سفارش‌ها.",
      success: false,
    };
  }
};

export const GetOrders: GetRowsFn<OrderData, Status> = async () =>
  // start,
  // end,
  // clientType,
  // status,
  // searchTerm,
  // limit,
  // page,
  {
    //   try {
    //     let query = supabase
    //       .from("order")
    //       .select(`
    //         *,
    //         client:client_id (
    //           id,
    //           person:person_id(name),
    //           company:company_id(name)
    //         )
    //       `);

    //     // Apply status filter if not "all"
    //     if (status.length > 0 && !status.includes("all")) {
    //       query = query.in("status", status);
    //     }

    //     // Apply search filter if provided
    //     if (searchTerm && searchTerm.trim() !== "") {
    //       query = query.or(`description.ilike.%${searchTerm}%,order_number.ilike.%${searchTerm}%`);
    //     }

    //     // Apply pagination
    //     const offset = (page - 1) * limit;
    //     query = query.range(offset, offset + limit - 1);

    //     // Order by created_at descending
    //     query = query.order("created_at", { ascending: false });

    //     const { data, error } = await query;

    //     if (error) {
    //       console.error("Error getting orders:", error);
    //       return {
    //         message: "ایراد سمت سرور لطفا اینترنت خود را بررسی کنید.",
    //         success: false,
    //       };
    //     }

    //     const orders: (Row<OrderData, Status> | null)[] = data.map((order) => {
    //       if (!order.client) {
    //         return null;
    //       }

    //       const clientName = order.client.person?.name || order.client.company?.name || "نامشخص";

    //       return {
    //         id: order.id,
    //         data: {
    //           id: order.id,
    //           name: `سفارش ${order.order_number}`, // Required by RowData
    //           client_name: clientName,
    //           description: order.description,
    //           total_amount: order.total_amount,
    //           created_at: order.created_at,
    //           client_id: order.client_id,
    //           pre_order_id: order.pre_order_id,
    //           order_number: order.order_number,
    //         } as OrderData,
    //         status: order.status as Status,
    //         type: "company" as ClientType, // Default type, can be enhanced later
    //       };
    //     });

    //     return {
    //       message: "اطلاعات با موفقیت دریافت شدند.",
    //       success: true,
    //       data: orders,
    //     };
    //   } catch (error) {
    //     console.error("Error in GetOrders:", error);
    return {
      message: "خطا در دریافت سفارش‌ها.",
      success: false,
    };
    //   }
  };
