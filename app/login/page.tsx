"use client";

import { Input } from "@heroui/input";
import { useActionState } from "react";

import { title, subtitle } from "@/components/primitives";
import { Login } from "@/lib/actions";
import { InputEmail, InputPassword } from "@/components/input";
import { Button } from "@heroui/button";

export default function LoginPage() {
  const [message, login, pending] = useActionState(Login, {
    message: "",
    success: false,
  });

  const inputElement = (
    <Input
      aria-label=""
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder="Search..."
      type="search"
    />
  );

  return (
    <>
      <div className="w-screen h-screen bg-primary-300"></div>
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
            <Button type="submit" variant="solid" className="w-full">
              ورود
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
