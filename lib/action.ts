import { supabase } from "./utils";

import { ClientData, ClientRender } from "@/app/dashboard/clients/types";

export type ServerActionState<T> = {
  message: string;
  success: boolean;
  data?: T;
};

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

export async function GetClients(
  start: number,
  end: number,
): Promise<ServerActionState<(ClientRender | null)[]>> {
  const { data, error } = await supabase
    .from("client")
    .select("*")
    .range(start, end);

  if (error) {
    return {
      message: "ایراد سمت سرور لطفا اینترنت خود را بررسی کنید.",
      success: false,
    };
  }

  const clientPromises = data.map(
    async (client): Promise<ClientRender | null> => {
      if (client.company_id !== null) {
        const { data: company, error: CompanyError } = await supabase
          .from("company")
          .select("*")
          .eq("id", client.company_id)
          .single();

        if (CompanyError) {
          return null;
        }

        return {
          id: client.id,
          data: company as ClientData,
          status: "done",
          type: "company",
        };
      }
      if (client.person_id !== null) {
        const { data: person, error: PersonError } = await supabase
          .from("person")
          .select("*")
          .eq("id", client.person_id)
          .single();

        if (PersonError) {
          return null;
        }

        return {
          id: client.id,
          data: person as ClientData,
          status: "done",
          type: "company",
        };
      }

      return null;
    },
  );

  const clients = await Promise.all(clientPromises);

  return {
    message: "اطلاعات با موفقیت دریافت شدند.",
    success: true,
    data: clients,
  };
}
