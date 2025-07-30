"use client";

import { useActionState } from "react";
import { Button } from "@heroui/button";

import { subtitle } from "@/components/primitives";
import { Login } from "@/lib/action";
import { InputEmail, InputPassword } from "@/components/input";
import Loading from "@/components/loading";

export default function LoginPage() {
  const [message, login, submitPending] = useActionState(Login, {
    message: "",
    success: false,
  });

  return (
    <>
      <Loading pending={submitPending} />
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="w-full max-w-sm p-8 space-y-6 bg-content1 rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl text-bold text-foreground">
              ورود به سامانه
            </h1>
            <p className={subtitle({ class: "mt-2" })}>
              برای ادامه وارد حساب کاربری خود شوید
            </p>
          </div>
          <form action={login} className="flex flex-col gap-6 w-full flex-wrap">
            <div className="flex flex-col gap-4 w-full">
              <InputEmail />
              <InputPassword />
            </div>
            <Button className="w-full" type="submit" variant="solid">
              ورود
            </Button>
          </form>
          {message.message !== "" && (
            <div
              className={
                "text-right px-3 py-1" +
                ` ${message.success ? "text-success" : "text-danger"}`
              }
            >
              {message.message}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
