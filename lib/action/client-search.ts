import { supabase } from "../utils";
import { ServerActionState } from "./type";

export type ClientOption = {
  id: string;
  name: string;
  type: string;
};

export async function GetAllClientNames(): Promise<ServerActionState<ClientOption[]>> {
  try {
    const { data, error } = await supabase.rpc("get_all_client_names");

    if (error) {
      console.error("Error getting client names:", error);
      return {
        message: "خطا در دریافت لیست مشتری‌ها.",
        success: false,
        data: [],
      };
    }
    console.log("here: ", data)

    const clientOptions: ClientOption[] = data.map((client) => ({
      id: client.client_id,
      name: client.client_name,
      type: client.client_type,
    }));

    return {
      message: "لیست مشتری‌ها با موفقیت دریافت شد.",
      success: true,
      data: clientOptions,
    };
  } catch (error) {
    console.error("Error in GetAllClientNames:", error);
    return {
      message: "خطا در دریافت لیست مشتری‌ها.",
      success: false,
      data: [],
    };
  }
}