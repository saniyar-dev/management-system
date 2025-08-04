"use client";

import { Listbox, ListboxItem, ListboxSection } from "@heroui/listbox";
import Link from "next/link";

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex justify-start gap-2 h-full">
      <div className="w-[180px] h-full border-l-1 pl-2">
        <Listbox aria-label="sidebar menu" variant="flat">
          <ListboxSection showDivider>
            <ListboxItem key="home" as={Link} href="/dashboard">
              ‌خانه
            </ListboxItem>
          </ListboxSection>
          <ListboxSection showDivider title="فروش">
            <ListboxItem key="clients" as={Link} href="/dashboard/clients">
              مشتری‌ها
            </ListboxItem>
            <ListboxItem
              key="pre-orders"
              as={Link}
              href="/dashboard/pre-orders"
            >
              پیش سفارش‌ها
            </ListboxItem>
            <ListboxItem key="orders" as={Link} href="/dashboard/orders">
              ‌سفارش‌ها
            </ListboxItem>
          </ListboxSection>
          <ListboxSection title="مالی">
            <ListboxItem
              key="pre-invoices"
              as={Link}
              href="/dashboard/pre-invoices"
            >
              پیش فاکتور‌ها
            </ListboxItem>
            <ListboxItem key="invoices" as={Link} href="/dashboard/invoices">
              فاکتور‌ها
            </ListboxItem>
          </ListboxSection>
        </Listbox>
      </div>
      {children}
    </section>
  );
}
