"use client";

import { Session } from "@supabase/supabase-js";

import LoginPage from "./login/page";

import { title, subtitle } from "@/components/primitives";
import Loading from "@/components/loading";
import { useSession } from "@/lib/hooks";

const WelcomePage = ({}: { session: Session }) => {
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
  const { session, pending } = useSession();

  if (pending) {
    return <Loading pending={pending} />;
  }

  return session ? <WelcomePage session={session} /> : <LoginPage />;
}
