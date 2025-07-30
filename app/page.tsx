"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Loading from "@/components/loading";
import { useSession } from "@/lib/hooks";

export default function Home() {
  const { session, pending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [pending]);

  return (
    <>
      <Loading pending={pending} />
    </>
  );
}
