"use client";

import React from "react";
import { Chip } from "@heroui/react";

import { ViewFieldConfig } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";

interface FieldRendererProps<T extends RowData> {
  field: ViewFieldConfig<T>;
  value: any;
  statusMap?: Record<string, string>;
  statusColorMap?: Record<
    string,
    "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  >;
}

export function FieldRenderer<T extends RowData>({
  field,
  value,
  statusMap,
  statusColorMap,
}: FieldRendererProps<T>) {
  const renderValue = () => {
    // Handle null/undefined values
    if (value === null || value === undefined || value === "") {
      return <span className="text-default-400">-</span>;
    }

    // Handle status fields with chips
    if (field.type === "status" && statusMap) {
      const statusLabel = statusMap[value] || value;
      const statusColor = statusColorMap?.[value] || "default";

      return (
        <Chip
          className="capitalize"
          color={statusColor}
          size="sm"
          variant="flat"
        >
          {statusLabel}
        </Chip>
      );
    }

    // Use custom formatter if provided
    if (field.formatter) {
      const formatted = field.formatter(value);

      return <span className="text-right">{formatted}</span>;
    }

    // Default rendering based on field type
    switch (field.type) {
      case "currency":
        const numValue = typeof value === "string" ? parseFloat(value) : value;

        if (isNaN(numValue)) return <span className="text-default-400">-</span>;

        return (
          <span className="font-medium text-success text-right" dir="rtl">
            {new Intl.NumberFormat("fa-IR").format(numValue)} ریال
          </span>
        );

      case "number":
        const num = typeof value === "string" ? parseFloat(value) : value;

        if (isNaN(num)) return <span className="text-default-400">-</span>;

        return (
          <span className="font-mono text-right" dir="rtl">
            {new Intl.NumberFormat("fa-IR").format(num)}
          </span>
        );

      case "date":
        try {
          const date = new Date(value);

          return (
            <span className="font-mono text-right" dir="rtl">
              {date.toLocaleDateString("fa-IR")}
            </span>
          );
        } catch {
          return <span className="text-default-400">-</span>;
        }

      case "text":
      default:
        return (
          <span className="text-right" dir="rtl">
            {String(value)}
          </span>
        );
    }
  };

  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-sm font-medium text-default-600 min-w-[120px]">
        {field.label}:
      </span>
      <div className="text-sm text-default-900 text-right flex-1 mr-4">
        {renderValue()}
      </div>
    </div>
  );
}
