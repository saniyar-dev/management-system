"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import { useState, useEffect, useTransition } from "react";
import { Session } from "@supabase/supabase-js";

import Loading from "./loading";

import { supabase } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { Logout } from "@/lib/actions";

export const Navbar = () => {
  const [session, setSession] = useState<Session | null>();
  const [pending, startTransistion] = useTransition();

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <>
      <Loading pending={pending} />
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-1"
              href="/"
            >
              <p className="font-bold text-inherit">پنل مدیریت سیمان بان</p>
            </NextLink>
          </NavbarBrand>
          <ul className="hidden lg:flex gap-4 justify-start ml-2">
            {siteConfig.navItems.map((item, index) =>
              index === siteConfig.navItems.length - 1 && session ? (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                    color="danger"
                    href="#"
                    size="lg"
                    onClick={() =>
                      startTransistion(async () => {
                        await Logout();
                      })
                    }
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ) : (
                index < siteConfig.navItems.length - 1 && (
                  <NavbarMenuItem key={`${item}-${index}`}>
                    <Link color="foreground" href="#" size="lg">
                      {item.label}
                    </Link>
                  </NavbarMenuItem>
                )
              ),
            )}
          </ul>
        </NavbarContent>

        <NavbarContent
          className="hidden sm:flex basis-1/5 sm:basis-full"
          justify="end"
        >
          <NavbarItem className="hidden sm:flex gap-2">
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>

        <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) =>
              index === siteConfig.navMenuItems.length - 1 && session ? (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link color="danger" href="#" size="lg">
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ) : (
                index < siteConfig.navMenuItems.length - 1 && (
                  <NavbarMenuItem key={`${item}-${index}`}>
                    <Link
                      color="foreground"
                      href="#"
                      size="lg"
                      onClick={() =>
                        startTransistion(async () => {
                          await Logout();
                        })
                      }
                    >
                      {item.label}
                    </Link>
                  </NavbarMenuItem>
                )
              ),
            )}
          </div>
        </NavbarMenu>
      </HeroUINavbar>
    </>
  );
};
