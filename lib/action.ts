import { supabase } from "./utils";

export type ServerActionState = {
  message: string;
  success: boolean;
};

export async function Login(
  prevState: ServerActionState,
  formData: FormData,
): Promise<ServerActionState> {
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

    return {
      message: "با موفقیت وارد شدید. در حال انتقال ...",
      success: true,
    };
  }
}

export async function Logout(): Promise<ServerActionState> {
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
