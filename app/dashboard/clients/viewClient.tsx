"use client";

import React, { useMemo } from "react";
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
const defaultViewFields: ViewFieldConfig<ClientData>[] = [
  {
    ...commonFieldConfigs.viewFields.name,
    label: "نام",
  },
  {
    ...commonFieldConfigs.viewFields.ssn,
    label: "کد ملی",
  },
  {
    ...commonFieldConfigs.viewFields.phone,
    label: "شماره موبایل",
  },
  {
    ...commonFieldConfigs.viewFields.county,
    label: "استان",
  },
  {
    ...commonFieldConfigs.viewFields.town,
    label: "شهرستان / بخش",
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

  const clientViewFields = useMemo((): ViewFieldConfig<ClientData>[] => {
    if (entity.type === "company") {
      return [
        {
          ...commonFieldConfigs.viewFields.company_name,
          label: "نام شرکت",
        },
        {
          ...commonFieldConfigs.viewFields.company_ssn,
          label: "شناسه ملی شرکت",
        },
        ...defaultViewFields,
      ];
    }
    return defaultViewFields;
  }, [entity.type])

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
        title={`مشاهده جزئیات مشتری: ${entity.type === "company" ? entity.data.company_name : entity.data.name}`}
        onClose={handleClose}
        onSuccess={onSuccess}
      />
    </>
  );
}
