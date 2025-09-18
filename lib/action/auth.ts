import { User } from "../types";
import { supabase } from "../utils";

import { ServerActionState } from "./type";

export async function GetUser(): Promise<ServerActionState<User>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "خطایی رخ داده است. دوباره تلاش کنید.",
      success: false,
    };
  }
  
  const { data, error } = await supabase
    .from("panel_users")
    .select("*")
    .eq("email", user.email!)
    .single();

  
  if (error || !data) {
    return {
      message: "خطایی رخ داده است. دوباره تلاش کنید.",
      success: false,
    };
  }


  return {
    message: "اطالاعات با موفقیت دریافت شدند.",
    success: true,
    data: {
      id: data.id,
      email: data.email,
      name: data?.name,
      permission_mask: data?.permission_mask as 1 | 2 | 4 | 8
    },
  };
}

export async function Login(
  prevState: ServerActionState<null>,
  formData: FormData,
): Promise<ServerActionState<null>> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email as string,
      password: password as string,
    });

    if (error) {
      throw error;
    }

    return {
      message: "با موفقیت وارد شدید. در حال انتقال ...",
      success: true,
    };
  } catch {
    const { error } = await supabase.auth.signUp({
      email: email as string,
      password: password as string,
    });

    if (error) {
      return {
        message: "ورود موفقیت آمیز نبود دوباره تلاش کنید.",
        success: false,
      };
    }

    const { error: PanelUserError } = await supabase.from("panel_users").insert({
      email: email as string,
      name: "test",
      permission_mask: 1
    });

    if (PanelUserError) {
      return {
        message: "ورود موفقیت آمیز نبود دوباره تلاش کنید.",
        success: false,
      };
    }

    return {
      message: "با موفقیت وارد شدید. در حال انتقال ...",
      success: true,
    };
  }
}

export async function Logout(): Promise<ServerActionState<null>> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      message: "خروج موفقیت آمیز نبود دوباره تلاش کنید.",
      success: false,
    };
  }

  return {
    message: "با موفقیت خارج شدید.",
    success: true,
  };
}
