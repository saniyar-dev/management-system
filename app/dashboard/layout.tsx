"use client";

import { Listbox, ListboxItem, ListboxSection } from "@heroui/listbox";
import { Suspense } from "react";

import Loading from "@/components/loading";

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex justify-start gap-2 h-full">
      <div className="w-[180px] h-full border-l-1 pl-2">
        <Listbox aria-label="sidebar menu" variant="flat">
          <ListboxSection showDivider title="فروش">
            <ListboxItem key="clients" href="/dashboard/clients">
              مشتری‌ها
            </ListboxItem>
            <ListboxItem key="pre-orders" href="/dashboard/pre-orders">
              پیش سفارش‌ها
            </ListboxItem>
          </ListboxSection>
          <ListboxSection title="مالی">
            <ListboxItem key="pre-invoices" href="/dashboard/pre-invoices">
              پیش فاکتور‌ها
            </ListboxItem>
            <ListboxItem key="invoices" href="/dashboard/invoices">
              فاکتور‌ها
            </ListboxItem>
          </ListboxSection>
        </Listbox>
      </div>
      <Suspense fallback={<Loading pending={true} />}>{children}</Suspense>
    </section>
  );
}
