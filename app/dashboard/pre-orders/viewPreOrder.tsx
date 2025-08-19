"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import { EyeIcon } from "@/components/icons";

import {
  PreOrderData,
  Status,
  preOrderStatusNameMap,
  statusColorMap,
} from "./types";

import { ViewModal } from "@/components/crud/ViewModal";
import { Row } from "@/lib/types";
import { ViewFieldConfig } from "@/lib/action/crud-types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { commonFieldConfigs, fieldFormatters } from "@/lib/utils/field-config";

// Pre-order specific view field configuration
const preOrderViewFields: ViewFieldConfig<PreOrderData>[] = [
  {
    key: "client_name",
    label: "نام مشتری",
    type: "text",
    formatter: fieldFormatters.text,
  },
  {
    ...commonFieldConfigs.viewFields.description,
    label: "شرح پیش سفارش",
  },
  {
    key: "estimated_amount",
    label: "مبلغ تخمینی",
    type: "currency",
    formatter: (value: any) => {
      if (value === -1 || value === null || value === undefined) {
        return "تعیین نشده";
      }
      return fieldFormatters.currency(value);
    },
  },
  {
    ...commonFieldConfigs.viewFields.created_at,
    label: "تاریخ ثبت",
  },
];

interface ViewPreOrderProps {
  entity: Row<PreOrderData, Status>;
  onSuccess?: () => void;
}

export function ViewPreOrderComponent({ entity, onSuccess }: ViewPreOrderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get pre-order job configuration for view operation
  const jobsConfig = getEntityJobConfig("pre_order", "view");

  const handleClose = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <span
        className="text-lg text-default-400 cursor-pointer active:opacity-50"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpen();
          }
        }}
      >
        <EyeIcon />
      </span>

      <ViewModal
        entity={entity}
        fields={preOrderViewFields}
        isOpen={isOpen}
        jobsConfig={jobsConfig}
        statusColorMap={
          statusColorMap as Record<
            Status,
            | "default"
            | "primary"
            | "secondary"
            | "success"
            | "warning"
            | "danger"
          >
        }
        statusMap={preOrderStatusNameMap}
        title={`مشاهده جزئیات پیش سفارش: ${entity.data.client_name}`}
        onClose={handleClose}
        onSuccess={onSuccess}
      />
    </>
  );
}

// Hook for using ViewPreOrder component
export function useViewPreOrder() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const ViewPreOrderModal = React.useCallback(
    ({ entity, onSuccess }: ViewPreOrderProps) => {
      const jobsConfig = getEntityJobConfig("pre_order", "view");

      return (
        <ViewModal
          entity={entity}
          fields={preOrderViewFields}
          isOpen={isOpen}
          jobsConfig={jobsConfig}
          statusColorMap={
            statusColorMap as Record<
              Status,
              | "default"
              | "primary"
              | "secondary"
              | "success"
              | "warning"
              | "danger"
            >
          }
          statusMap={preOrderStatusNameMap}
          title={`مشاهده جزئیات پیش سفارش: ${entity.data.client_name}`}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );
    },
    [isOpen, onClose],
  );

  return {
    isOpen,
    onOpen,
    onClose,
    ViewPreOrderModal,
  };
}