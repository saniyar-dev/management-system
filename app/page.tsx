"use client";

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import LoginPage from "./login/page";

import { title, subtitle } from "@/components/primitives";
import { supabase } from "@/lib/utils";

const WelcomePage = ({ session }: { session: Session }) => {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <h1 className={title()}>خوش آمدید</h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          شما با موفقیت وارد شدید.
        </h2>
      </div>
    </section>
  );
};

export default function Home() {
  const [session, setSession] = useState<Session | null>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return session ? <WelcomePage session={session} /> : <LoginPage />;
}
