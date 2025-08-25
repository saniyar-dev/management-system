"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import {
  ClientData,
  Status,
  clientStatusNameMap,
  statusColorMap,
} from "./types";

import { DeleteIcon } from "@/components/icons";
import { DeleteModal } from "@/components/crud/DeleteModal";
import { Row } from "@/lib/types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { DeleteClient, CheckClientDependencies } from "@/lib/action/client";

// Client-specific display fields for delete confirmation
const clientDisplayFields = [
  {
    key: "name" as keyof ClientData,
    label: "نام / نام شرکت",
    formatter: (value: any) => value || "-",
  },
  {
    key: "ssn" as keyof ClientData,
    label: "کد ملی / شناسه ملی",
    formatter: (value: any) => value || "-",
  },
  {
    key: "phone" as keyof ClientData,
    label: "شماره موبایل",
    formatter: (value: any) => value || "-",
  },
  {
    key: "address" as keyof ClientData,
    label: "آدرس",
    formatter: (value: any) => value || "-",
  },
];

interface DeleteClientProps {
  entity: Row<ClientData, Status>;
  onSuccess?: () => void;
}

export function DeleteClientComponent({
  entity,
  onSuccess,
}: DeleteClientProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get client job configuration for delete operation
  const jobsConfig = getEntityJobConfig("client", "delete");

  const handleDelete = async (id: string) => {
    return await DeleteClient(id);
  };

  const handleDependencyCheck = async (id: string): Promise<boolean> => {
    const result = await CheckClientDependencies(id);

    // Return true if there ARE dependencies (should prevent deletion)
    // The CheckClientDependencies returns true if deletion is allowed (no dependencies)
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

  return (
    <>
      <span
        className="text-lg text-danger cursor-pointer active:opacity-50"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpen();
          }
        }}
      >
        <DeleteIcon />
      </span>

      <DeleteModal
        dependencyCheck={handleDependencyCheck}
        displayFields={clientDisplayFields}
        entity={entity}
        entityDisplayName="مشتری"
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
        statusMap={clientStatusNameMap}
        title="حذف مشتری"
        onClose={handleClose}
        onDelete={handleDelete}
        onSuccess={handleSuccess}
      />
    </>
  );
}

// Hook for using DeleteClient component
export function useDeleteClient() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const DeleteClientModal = React.useCallback(
    ({ entity, onSuccess }: DeleteClientProps) => {
      const jobsConfig = getEntityJobConfig("client", "delete");

      const handleDelete = async (id: string) => {
        return await DeleteClient(id);
      };

      const handleDependencyCheck = async (id: string): Promise<boolean> => {
        const result = await CheckClientDependencies(id);

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

      return (
        <DeleteModal
          dependencyCheck={handleDependencyCheck}
          displayFields={clientDisplayFields}
          entity={entity}
          entityDisplayName="مشتری"
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
          statusMap={clientStatusNameMap}
          title="حذف مشتری"
          onClose={onClose}
          onDelete={handleDelete}
          onSuccess={handleSuccess}
        />
      );
    },
    [isOpen, onClose],
  );

  return {
    isOpen,
    onOpen,
    onClose,
    DeleteClientModal,
  };
}
