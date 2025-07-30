"use client";

import { title, subtitle } from "@/components/primitives";

export default function Dashboard() {
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
}
