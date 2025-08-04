export type ClientStatus = "done" | "waiting" | "todo";

export const clientStatusNameMap: Record<ClientStatus, string> = {
  done: "اتمام یافته",
  waiting: "نیاز به پیگیری",
  todo: "انجام نشده",
};

export type Person = {
  id: number;
  name: string;
  ssn: string;
  phone: string;
  address: string;
  postal_code: string;
};

export type Company = {
  id: number;
  name: string;
  ssn: string;
  phone: string;
  address: string;
  postal_code: string;
};

export type ClientData = {
  id: number;
  name: string;
  ssn: string;
  phone: string;
  address: string;
  postal_code: string;
};

export type ClientType = "company" | "personal";

export type ClientRender = {
  id: number;
  type: ClientType;
  data: ClientData;
  status: ClientStatus;
};

export type Client =
  | {
      id: number;
      person_id: number | null;
      company_id: number;
    }
  | {
      id: number;
      person_id: number;
      company_id: number | null;
    };

export type JobStatus = "done" | "waiting" | "todo";

export type ClientJobs = {
  id: number;
  name: string;
  url: string;
  status: JobStatus;
  client_id: number;
};
