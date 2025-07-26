"use client";

import { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";

// A simple client-side cookie getter function
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();

    return cookieValue;
  }

  return undefined;
}

const WelcomePage = () => {
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

const LoginPage = () => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic would be implemented here.
    // On successful login, a 'token' cookie would be set.
    // For demonstration, you can manually set a cookie in your browser's developer console
    // and refresh the page:
    // document.cookie = "token=some-fake-token; path=/; max-age=3600";
    alert("در حال حاضر امکان ورود وجود ندارد. این یک صفحه نمایشی است.");
  };

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
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-right text-default-700"
            >
              نام کاربری
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              className="mt-1 block w-full px-3 py-2 bg-default-100 border border-default-200 rounded-md text-sm shadow-sm placeholder-default-400
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="نام کاربری خود را وارد کنید"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-right text-default-700"
            >
              رمز عبور
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-default-100 border border-default-200 rounded-md text-sm shadow-sm placeholder-default-400
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="رمز عبور خود را وارد کنید"
            />
          </div>
          <div>
            <button
              type="submit"
              className={buttonStyles({
                color: "primary",
                radius: "lg",
                variant: "solid",
                className: "w-full",
              })}
            >
              ورود
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default function Home() {
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("token");

    if (token) {
      setHasToken(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return hasToken ? <WelcomePage /> : <LoginPage />;
}
