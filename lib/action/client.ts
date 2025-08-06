import { supabase } from "../utils";

import { ServerActionState } from "./type";

import { ClientData, ClientRender } from "@/app/dashboard/clients/types";

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
          type: "personal",
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

export async function GetClientJobs(
  client_id: number,
): Promise<ServerActionState<any>> {
  return {
    message: "اطلاعات با موفقیت دریافت شدند.",
    success: true,
    data: "good",
  };
}

export async function AddClient(formData: FormData) {
  const createCompany = async (formData: FormData): Promise<number | null> => {
    const name = formData.get("company_name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("company_address") as string;
    const ssn = formData.get("company_ssn") as string;
    const postalCode = formData.get("company_postal_code") as string;

    // return if the formData doesn't container company_name
    if (name === "" || !name) return null;

    const { data, error } = await supabase
      .from("company")
      .insert({
        name,
        ssn,
        phone,
        address,
        postal_code: postalCode,
      })
      .select();

    if (!error && data) {
      return data[0].id;
    }

    return null;
  };

  const createPersonal = async (formData: FormData): Promise<number | null> => {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const ssn = formData.get("ssn") as string;
    const postalCode = formData.get("postal_code") as string;

    const { data, error } = await supabase
      .from("person")
      .insert({
        name,
        ssn,
        phone,
        address,
        postal_code: postalCode,
      })
      .select();

    if (!error && data) {
      return data[0].id;
    }

    return null;
  };

  const createClient = async (
    personal_id: number | null,
    company_id: number | null,
  ): Promise<number | null> => {
    const { data, error } = await supabase
      .from("client")
      .insert({
        person_id: personal_id,
        company_id,
      })
      .select();

    if (!error && data) {
      return data[0].id;
    }

    return null;
  };

  const personal_id = await createPersonal(formData);
  const company_id = await createCompany(formData);

  const client_id = await createClient(personal_id, company_id);

  if (!client_id) {
    return {
      message: "ثبت مشتری موفقیت آمیز نبود دوباره تلاش کنید.",
      success: false,
      data: null,
    };
  }

  return {
    message: "ثبت مشتری با موفقیت انجام شد.",
    success: true,
    data: client_id,
  };
}
