"use client";

import LoginPage from "./login/page";
import Dashboard from "./dashboard/page";

import Loading from "@/components/loading";
import { useSession } from "@/lib/hooks";

export default function Home() {
  const { session, pending } = useSession();

  if (pending) {
    return <Loading pending={pending} />;
  }

  return session ? <Dashboard /> : <LoginPage />;
}
