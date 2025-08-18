"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import { DeleteIcon } from "@/components/icons";

import {
  PreOrderData,
  Status,
  preOrderStatusNameMap,
  statusColorMap,
} from "./types";

import { DeleteModal } from "@/components/crud/DeleteModal";
import { Row } from "@/lib/types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { DeletePreOrder, CheckPreOrderDependencies } from "@/lib/action/pre-order";
import { fieldFormatters } from "@/lib/utils/field-config";

// Pre-order specific display fields for delete confirmation
const preOrderDisplayFields = [
  {
    key: "client_name" as keyof PreOrderData,
    label: "نام مشتری",
    formatter: fieldFormatters.text,
  },
  {
    key: "description" as keyof PreOrderData,
    label: "شرح پیش سفارش",
    formatter: (value: any) => {
      if (!value) return "-";
      // Truncate long descriptions for display
      return value.length > 50 ? `${value.substring(0, 50)}...` : value;
    },
  },
  {
    key: "estimated_amount" as keyof PreOrderData,
    label: "مبلغ تخمینی",
    formatter: (value: any) => {
      if (value === -1 || value === null || value === undefined) {
        return "تعیین نشده";
      }
      return fieldFormatters.currency(value);
    },
  },
  {
    key: "created_at" as keyof PreOrderData,
    label: "تاریخ ثبت",
    formatter: fieldFormatters.date,
  },
];

interface DeletePreOrderProps {
  entity: Row<PreOrderData, Status>;
  onSuccess?: () => void;
}

export function DeletePreOrderComponent({
  entity,
  onSuccess,
}: DeletePreOrderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get pre-order job configuration for delete operation
  const jobsConfig = getEntityJobConfig("preOrder", "delete");

  const handleDelete = async (id: string) => {
    return await DeletePreOrder(id);
  };

  const handleDependencyCheck = async (id: string): Promise<boolean> => {
    const result = await CheckPreOrderDependencies(id);

    // Return true if there ARE dependencies (should prevent deletion)
    // The CheckPreOrderDependencies returns true if deletion is allowed (no dependencies)
    return !result.success || result.data === false;
  };

  const handleClose = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSuccess = () => {
    // Refresh the page or update the table data
    window.location.reload();
    if (onSuccess) {
      onSuccess();
    }
  };

  // Check if pre-order can be deleted based on status
  const canDelete = entity.status !== "converted";
  const deleteDisabledReason = entity.status === "converted" 
    ? "پیش سفارش تبدیل شده قابل حذف نیست" 
    : undefined;

  return (
    <>
      <span
        className={`text-lg cursor-pointer active:opacity-50 ${
          canDelete ? "text-danger" : "text-default-300"
        }`}
        role="button"
        tabIndex={0}
        title={deleteDisabledReason}
        onClick={canDelete ? onOpen : undefined}
        onKeyDown={(e) => {
          if (canDelete && (e.key === "Enter" || e.key === " ")) {
            onOpen();
          }
        }}
      >
        <DeleteIcon />
      </span>

      {canDelete && (
        <DeleteModal
          dependencyCheck={handleDependencyCheck}
          displayFields={preOrderDisplayFields}
          entity={entity}
          entityDisplayName="پیش سفارش"
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
          title="حذف پیش سفارش"
          onClose={handleClose}
          onDelete={handleDelete}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

// Hook for using DeletePreOrder component
export function useDeletePreOrder() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const DeletePreOrderModal = React.useCallback(
    ({ entity, onSuccess }: DeletePreOrderProps) => {
      const jobsConfig = getEntityJobConfig("preOrder", "delete");

      const handleDelete = async (id: string) => {
        return await DeletePreOrder(id);
      };

      const handleDependencyCheck = async (id: string): Promise<boolean> => {
        const result = await CheckPreOrderDependencies(id);

        // Return true if there ARE dependencies (should prevent deletion)
        return !result.success || result.data === false;
      };

      const handleSuccess = () => {
        // Refresh the page or update the table data
        window.location.reload();
        if (onSuccess) {
          onSuccess();
        }
      };

      const canDelete = entity.status !== "converted";

      return canDelete ? (
        <DeleteModal
          dependencyCheck={handleDependencyCheck}
          displayFields={preOrderDisplayFields}
          entity={entity}
          entityDisplayName="پیش سفارش"
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
          title="حذف پیش سفارش"
          onClose={onClose}
          onDelete={handleDelete}
          onSuccess={handleSuccess}
        />
      ) : null;
    },
    [isOpen, onClose],
  );

  return {
    isOpen,
    onOpen,
    onClose,
    DeletePreOrderModal,
  };
}