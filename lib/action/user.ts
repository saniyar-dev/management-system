import { User } from "../types";
import { supabase } from "../utils";
import { ServerActionState } from "./type";

export async function GetUserInfoById (id: string): Promise<ServerActionState<User>> {
    const {data, error} = await supabase.from("panel_users").select("*").eq("id", id).single();
    if (error || !data) {
        return {
            message: "اطالاعات کاربر مورد نظر پیدا نشد.",
            success: false,
        }
    }
    return {
        message: "اطالاعات کاربر مورد نظر پیدا شد.",
        success: true,
        data: {
            email: data.email,
            id: data.id,
            name: data.name,
            permission_mask: data.permission_mask as 1 | 2 | 4 | 8
        }
    }
}