import { ClientType, Row } from "../types";
import { supabase } from "../utils";
import { businessRuleValidators } from "../utils/persian-validation";
import { checkEntityDependencies } from "../utils/dependency-checker";

import { GetRowsFn, GetTotalRowsFn, ServerActionState } from "./type";

import { Status } from "@/app/dashboard/clients/types";
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

const formatAddress = (addr: string): {address: string, town: string, county: string} => {
  return {
    county: addr.split(",")[0],
    town: addr.split(",")[1],
    address: addr.split(",")[2],
  };
}

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
  console.log(data)

  if (error) {
    return {
      message: "ایراد سمت سرور لطفا اینترنت خود را بررسی کنید.",
      success: false,
    };
  }

  const clientPromises = data.map(
    async (client): Promise<Row<ClientData, Status> | null> => {
      if (client.type === "company" && client.company_id !== null && client.person_id !== null) {
        const { data: company, error: CompanyError } = await supabase
          .rpc("search_company_by_name", { search_term: searchTerm })
          .eq("id", client.company_id)
          .single();

        const { data: person, error: PersonError } = await supabase
          .rpc("search_person_by_name", { search_term: searchTerm })
          .eq("id", client.person_id)
          .single();

        if (CompanyError || PersonError) {
          return null;
        }
        const {address, town, county} = formatAddress(company.address!)

        return {
          id: client.id,
          data: {
            company_name: company.name,
            company_phone: company.phone!,
            company_ssn: company.ssn,
            name: person.name,
            phone: person.phone!,
            ssn: person.ssn,
            address: address,
            county: county,
            town: town,
            postal_code: company.postal_code!,
            id: client.id,
          },
          status: client.status as Status,
          type: client.type as ClientType,
        };
      }
      if (client.type === "personal" && client.person_id !== null) {
        const { data: person, error: PersonError } = await supabase
          .rpc("search_person_by_name", { search_term: searchTerm })
          .eq("id", client.person_id)
          .single();
        console.log(person)

        if (PersonError) {
          return null;
        }


        const {address, town, county} = formatAddress(person.address!)

        return {
          id: client.id,
          data: {
            company_name: "",
            company_phone: "",
            company_ssn: "",
            name: person.name,
            phone: person.phone!,
            ssn: person.ssn,
            address: address,
            county: county,
            town: town,
            postal_code: person.postal_code!,
            id: client.id,
          },
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

export async function GetClientJobs(): Promise<ServerActionState<any>> {
  // client_id: number,
  return {
    message: "اطلاعات با موفقیت دریافت شدند.",
    success: true,
    data: "good",
  };
}

export async function UpdateClient(
  id: string,
  formData: FormData
): Promise<ServerActionState<string>> {
  try {
    // Get current client data to determine type
    const { data: clientData, error: clientError } = await supabase
      .from("client")
      .select("person_id, company_id, type")
      .eq("id", id)
      .single();

    if (clientError || !clientData) {
      return {
        message: "مشتری یافت نشد.",
        success: false,
      };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const ssn = formData.get("ssn") as string;
    const postalCode = formData.get("postal_code") as string;
    const status = formData.get("status") as Status;

    // Validate required fields
    if (!name || !phone || !address || !ssn) {
      return {
        message: "تمام فیلدهای الزامی را پر کنید.",
        success: false,
      };
    }

    // Business rule validation
    const businessValidation = businessRuleValidators.validateClientForOrder({
      name,
      phone,
      address,
      ssn
    });

    if (businessValidation) {
      return {
        message: businessValidation,
        success: false,
      };
    }

    // Update the appropriate table (person or company)
    if (clientData.person_id) {
      const { error: personError } = await supabase
        .from("person")
        .update({
          name,
          ssn,
          phone,
          address,
          postal_code: postalCode,
        })
        .eq("id", clientData.person_id);

      if (personError) {
        return {
          message: "خطا در به‌روزرسانی اطلاعات شخصی.",
          success: false,
        };
      }
    }

    if (clientData.company_id) {
      const { error: companyError } = await supabase
        .from("company")
        .update({
          name,
          ssn,
          phone,
          address,
          postal_code: postalCode,
        })
        .eq("id", clientData.company_id);

      if (companyError) {
        return {
          message: "خطا در به‌روزرسانی اطلاعات شرکت.",
          success: false,
        };
      }
    }

    // Update client status if provided
    if (status) {
      const { error: statusError } = await supabase
        .from("client")
        .update({ status })
        .eq("id", id);

      if (statusError) {
        return {
          message: "خطا در به‌روزرسانی وضعیت مشتری.",
          success: false,
        };
      }
    }

    return {
      message: "اطلاعات مشتری با موفقیت به‌روزرسانی شد.",
      success: true,
      data: id,
    };
  } catch (error) {
    return {
      message: "خطای سرور. لطفاً دوباره تلاش کنید.",
      success: false,
    };
  }
}

export async function AddClient(formData: FormData) {
  const createCompany = async (formData: FormData): Promise<string | null> => {
    const name = formData.get("company_name") as string;
    const ssn = formData.get("company_ssn") as string;
    const phone = formData.get("phone") as string;
    const county = formData.get("county") as string;
    const town = formData.get("town") as string;
    const address = formData.get("address") as string;
    const postalCode = formData.get("company_postal_code") as string;

    // return if the formData doesn't container company_name
    if (name === "" || !name) return null;

    const { data, error } = await supabase
      .from("company")
      .insert({
        name,
        ssn,
        phone,
        address: `${county}, ${town}, ${address}`,
        postal_code: postalCode,
      })
      .select();

    if (!error && data) {
      return data[0].id;
    }

    return null;
  };

  const createPersonal = async (formData: FormData): Promise<string | null> => {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const county = formData.get("county") as string;
    const town = formData.get("town") as string;
    const address = formData.get("address") as string;
    const ssn = formData.get("ssn") as string;
    const postalCode = formData.get("postal_code") as string;

    const { data, error } = await supabase
      .from("person")
      .insert({
        name,
        ssn,
        phone,
        address: `${county}, ${town}, ${address}`,
        postal_code: postalCode,
      })
      .select();

    if (!error && data) {
      return data[0].id;
    }

    return null;
  };

  const createClient = async (
    personal_id: string | null,
    company_id: string | null,
  ): Promise<string | null> => {
    const { data, error } = await supabase
      .from("client")
      .insert({
        person_id: personal_id,
        company_id,
        type: company_id ? "company" : "personal",
        status: "todo",
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

export async function DeleteClient(id: string): Promise<ServerActionState<boolean>> {
  try {
    // First check for dependencies
    const dependencyCheck = await CheckClientDependencies(id);
    if (!dependencyCheck.success || dependencyCheck.data === false) {
      return {
        message: dependencyCheck.message || "مشتری دارای وابستگی است و قابل حذف نیست.",
        success: false,
      };
    }

    // Get client data to determine what to delete
    const { data: clientData, error: clientError } = await supabase
      .from("client")
      .select("person_id, company_id, type")
      .eq("id", id)
      .single();

    if (clientError || !clientData) {
      return {
        message: "مشتری یافت نشد.",
        success: false,
      };
    }

    // Start transaction-like deletion
    // Delete client record first
    const { error: clientDeleteError } = await supabase
      .from("client")
      .delete()
      .eq("id", id);

    if (clientDeleteError) {
      return {
        message: "خطا در حذف مشتری.",
        success: false,
      };
    }

    // Delete associated person or company record
    if (clientData.person_id) {
      const { error: personDeleteError } = await supabase
        .from("person")
        .delete()
        .eq("id", clientData.person_id);

      if (personDeleteError) {
        // Log error but don't fail the operation since client is already deleted
        console.error("Error deleting person record:", personDeleteError);
      }
    }

    if (clientData.company_id) {
      const { error: companyDeleteError } = await supabase
        .from("company")
        .delete()
        .eq("id", clientData.company_id);

      if (companyDeleteError) {
        // Log error but don't fail the operation since client is already deleted
        console.error("Error deleting company record:", companyDeleteError);
      }
    }

    return {
      message: "مشتری با موفقیت حذف شد.",
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      message: "خطای سرور. لطفاً دوباره تلاش کنید.",
      success: false,
    };
  }
}

export async function CheckClientDependencies(id: string): Promise<ServerActionState<boolean>> {
  return await checkEntityDependencies("client", id);
}
