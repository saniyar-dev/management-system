import { ClientType, Row } from "../types";
import { Status } from "@/app/dashboard/clients/types";
import { supabase } from "../utils";

import { GetRowsFn, GetTotalRowsFn, ServerActionState } from "./type";

import { ClientData } from "@/app/dashboard/clients/types";

export const GetTotalClients: GetTotalRowsFn = async (
  clientType,
  status,
  searchTerm,
) => {
  // TODO: change this later to actually works with searchTerm too
  if (searchTerm !== "") {
    return {
      message: "تعداد مشتری‌ها با موفقیت دریافت شدند.",
      success: true,
      data: 1,
    };
  }

  const { data, error } = await supabase.rpc("filtered_client_total", {
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
    message: "تعداد مشتری‌ها با موفقیت دریافت شد.",
    success: true,
    data: data,
  };
};

export const GetClients: GetRowsFn<ClientData, Status> = async (
  start,
  end,
  clientType,
  status,
  searchTerm,
  limit,
  page,
) => {
  const { data, error } = await supabase.rpc("filter_client_paginated", {
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

  const clientPromises = data.map(
    async (client): Promise<Row<ClientData, Status> | null> => {
      if (client.company_id !== null) {
        const { data: company, error: CompanyError } = await supabase
          .rpc("search_company_by_name", { search_term: searchTerm })
          .eq("id", client.company_id)
          .single();


        if (CompanyError) {
          return null;
        }

        return {
          id: client.id,
          data: company as ClientData,
          status: client.status as Status,
          type: client.type as ClientType,
        };
      }
      if (client.person_id !== null) {
        const { data: person, error: PersonError } = await supabase
          .rpc("search_person_by_name", { search_term: searchTerm })
          .eq("id", client.person_id)
          .single();


        if (PersonError) {
          return null;
        }

        return {
          id: client.id,
          data: person as ClientData,
          status: client.status as Status,
          type: client.type as ClientType,
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
};

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
        type: company_id ? "company" : "personal",
        status: "todo"
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
