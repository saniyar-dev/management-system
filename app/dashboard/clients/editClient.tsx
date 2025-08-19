"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import { EditIcon } from "@/components/icons";

import { ClientData, Status, statusOptions } from "./types";

import { EditModal } from "@/components/crud/EditModal";
import { Row } from "@/lib/types";
import { EditFieldConfig, ValidationConfig } from "@/lib/action/crud-types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { commonFieldConfigs } from "@/lib/utils/field-config";
import { persianValidationRules } from "@/lib/utils/persian-validation";
import { UpdateClient } from "@/lib/action/client";

// Client-specific edit field configuration
const clientEditFields: EditFieldConfig<ClientData>[] = [
  {
    ...commonFieldConfigs.editFields.name,
    label: "نام / نام شرکت",
    validation: persianValidationRules.persianName,
  },
  {
    ...commonFieldConfigs.editFields.ssn,
    label: "کد ملی / شناسه ملی",
    validation: persianValidationRules.persianSSN,
  },
  {
    ...commonFieldConfigs.editFields.phone,
    label: "شماره موبایل",
    validation: persianValidationRules.persianPhone,
  },
  {
    ...commonFieldConfigs.editFields.address,
    label: "آدرس",
    validation: persianValidationRules.persianText,
  },
  {
    ...commonFieldConfigs.editFields.postal_code,
    label: "کد پستی",
    validation: persianValidationRules.persianPostalCode,
  },
];

// Validation configuration for client fields
const clientValidationRules: ValidationConfig<ClientData> = {
  name: persianValidationRules.persianName,
  ssn: persianValidationRules.persianSSN,
  phone: persianValidationRules.persianPhone,
  address: persianValidationRules.persianText,
  postal_code: persianValidationRules.persianPostalCode,
};

interface EditClientProps {
  entity: Row<ClientData, Status>;
  onSuccess?: () => void;
}

export function EditClientComponent({ entity, onSuccess }: EditClientProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get client job configuration for edit operation
  const jobsConfig = getEntityJobConfig("client", "edit");

  const handleUpdate = async (formData: FormData) => {
    return await UpdateClient(entity.id.toString(), formData);
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
        <EditIcon />
      </span>

      <EditModal
        entity={entity}
        fields={clientEditFields}
        isOpen={isOpen}
        jobsConfig={jobsConfig}
        title={`ویرایش مشتری: ${entity.data.name}`}
        validationRules={clientValidationRules}
        onClose={handleClose}
        onSuccess={handleSuccess}
        onUpdate={handleUpdate}
      />
    </>
  );
}

// Hook for using EditClient component
export function useEditClient() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const EditClientModal = React.useCallback(
    ({ entity, onSuccess }: EditClientProps) => {
      const jobsConfig = getEntityJobConfig("client", "edit");

      const handleUpdate = async (formData: FormData) => {
        return await UpdateClient(entity.id.toString(), formData);
      };

      const handleSuccess = () => {
        // Refresh the page or update the table data
        window.location.reload();
        if (onSuccess) {
          onSuccess();
        }
      };

      return (
        <EditModal
          entity={entity}
          fields={clientEditFields}
          isOpen={isOpen}
          jobsConfig={jobsConfig}
          title={`ویرایش مشتری: ${entity.data.name}`}
          validationRules={clientValidationRules}
          onClose={onClose}
          onSuccess={handleSuccess}
          onUpdate={handleUpdate}
        />
      );
    },
    [isOpen, onClose],
  );

  return {
    isOpen,
    onOpen,
    onClose,
    EditClientModal,
  };
}
