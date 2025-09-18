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
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Skeleton, User } from "@heroui/react";

import Loading from "./loading";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GetUser, Logout } from "@/lib/action/auth";
import { useSession } from "@/lib/hooks";
import { User as UserType } from "@/lib/types";

// const searchInput = (
//   <Input
//     aria-label="Search"
//     classNames={{
//       inputWrapper: "bg-default-100",
//       input: "text-sm",
//     }}
//     endContent={
//       <Kbd className="hidden lg:inline-block" keys={["command"]}>
//         K
//       </Kbd>
//     }
//     labelPlacement="outside"
//     placeholder="Search..."
//     startContent={
//       <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
//     }
//     type="search"
//   />
// );

export const Navbar = () => {
  const [pending, startTransistion] = useTransition();
  const router = useRouter();

  const { session } = useSession();

  const [userPending, startUserTransition] = useTransition();
  const [user, setUser] = useState<UserType>();

  useEffect(() => {
    startUserTransition(async () => {
      const { message, success, data: user } = await GetUser();

      console.log(message, success, user);
      if (success && user) {
        setUser(user);
      } else {
        // here we need to activate global errors
        // console.log(message)
      }
    });
  }, []);

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
                        const msg = await Logout();

                        if (msg.success) {
                          router.push("/login");
                        }
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
          <NavbarItem className="hidden sm:flex items-center">
            {userPending || !user ? (
              <div className="max-w-[300px] w-full flex items-center gap-3">
                <div className="w-full flex">
                  <Skeleton className="rounded-full w-11 h-11" />
                </div>
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="h-3 w-40 rounded-lg" />
                  <Skeleton className="h-2 w-15 rounded-lg" />
                </div>
              </div>
            ) : (
              <User
                description={`کاربر سطح ${Math.log2(user!.permission_mask) + 1}`}
                name={user!.email}
              />
            )}
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
                          const msg = await Logout();

                          if (msg.success) {
                            router.push("/login");
                          }
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
