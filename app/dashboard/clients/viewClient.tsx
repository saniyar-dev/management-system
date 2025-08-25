"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import {
  ClientData,
  Status,
  clientStatusNameMap,
  statusColorMap,
} from "./types";

import { EyeIcon } from "@/components/icons";
import { ViewModal } from "@/components/crud/ViewModal";
import { Row } from "@/lib/types";
import { ViewFieldConfig } from "@/lib/action/crud-types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { commonFieldConfigs } from "@/lib/utils/field-config";

// Client-specific view field configuration
const clientViewFields: ViewFieldConfig<ClientData>[] = [
  {
    ...commonFieldConfigs.viewFields.name,
    label: "نام / نام شرکت",
  },
  {
    ...commonFieldConfigs.viewFields.ssn,
    label: "کد ملی / شناسه ملی",
  },
  {
    ...commonFieldConfigs.viewFields.phone,
    label: "شماره موبایل",
  },
  {
    ...commonFieldConfigs.viewFields.address,
    label: "آدرس",
  },
  {
    ...commonFieldConfigs.viewFields.postal_code,
    label: "کد پستی",
  },
];

interface ViewClientProps {
  entity: Row<ClientData, Status>;
  onSuccess?: () => void;
}

export function ViewClientComponent({ entity, onSuccess }: ViewClientProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get client job configuration for view operation
  const jobsConfig = getEntityJobConfig("client", "view");

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
        fields={clientViewFields}
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
        title={`مشاهده جزئیات مشتری: ${entity.data.name}`}
        onClose={handleClose}
        onSuccess={onSuccess}
      />
    </>
  );
}

// Hook for using ViewClient component
export function useViewClient() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const ViewClientModal = React.useCallback(
    ({ entity, onSuccess }: ViewClientProps) => {
      const jobsConfig = getEntityJobConfig("client", "view");

      return (
        <ViewModal
          entity={entity}
          fields={clientViewFields}
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
          title={`مشاهده جزئیات مشتری: ${entity.data.name}`}
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
    ViewClientModal,
  };
}
