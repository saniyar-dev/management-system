"use client";

import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { useActionState } from "react";

import { title, subtitle } from "@/components/primitives";
import { Login } from "@/lib/actions";
import { Form } from "@heroui/form";

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
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-full max-w-sm p-8 space-y-6 bg-content1 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className={title()}>ورود به سامانه</h1>
          <p className={subtitle({ class: "mt-2" })}>
            برای ادامه وارد حساب کاربری خود شوید
          </p>
        </div>
        <Form action={login} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-right text-default-700"
              htmlFor="username"
            >
              نام کاربری
            </label>
            <input
              required
              className="mt-1 block w-full px-3 py-2 bg-default-100 border border-default-200 rounded-md text-sm shadow-sm placeholder-default-400
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              id="email"
              name="email"
              placeholder="نام کاربری خود را وارد کنید"
              type="email"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-right text-default-700"
              htmlFor="password"
            >
              رمز عبور
            </label>
            <input
              required
              className="mt-1 block w-full px-3 py-2 bg-default-100 border border-default-200 rounded-md text-sm shadow-sm placeholder-default-400
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              id="password"
              name="password"
              placeholder="رمز عبور خود را وارد کنید"
              type="password"
            />
          </div>
          <div>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "lg",
                variant: "solid",
                className: "w-full",
              })}
              type="submit"
            >
              ورود
            </button>
          </div>
        </Form>
      </div>
    </section>
  );
}
