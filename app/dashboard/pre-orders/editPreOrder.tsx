"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import { PreOrderData, Status, statusOptions } from "./types";

import { EditIcon } from "@/components/icons";
import { EditModal } from "@/components/crud/EditModal";
import { Row } from "@/lib/types";
import { EditFieldConfig, ValidationConfig } from "@/lib/action/crud-types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { commonFieldConfigs } from "@/lib/utils/field-config";
import { persianValidationRules } from "@/lib/utils/persian-validation";
import { UpdatePreOrder } from "@/lib/action/pre-order";

// Pre-order specific edit field configuration
const preOrderEditFields: EditFieldConfig<PreOrderData>[] = [
  {
    ...commonFieldConfigs.editFields.description,
    label: "شرح پیش سفارش",
    required: true,
    validation: persianValidationRules.persianText,
  },
  {
    key: "estimated_amount",
    label: "مبلغ تخمینی (ریال)",
    type: "number",
    required: false,
    validation: (value: any) => {
      if (!value || value === "") return null; // Optional field

      return persianValidationRules.currency(value);
    },
  },
];


// All edit fields including status
const allEditFields = [...preOrderEditFields];

// Validation configuration for pre-order fields
const preOrderValidationRules: ValidationConfig<PreOrderData> = {
  description: persianValidationRules.persianText,
  estimated_amount: (value: any) => {
    if (!value || value === "") return null; // Optional field

    return persianValidationRules.currency(value);
  },
};

interface EditPreOrderProps {
  entity: Row<PreOrderData, Status>;
  onSuccess?: () => void;
}

export function EditPreOrderComponent({
  entity,
  onSuccess,
}: EditPreOrderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get pre-order job configuration for edit operation
  const jobsConfig = getEntityJobConfig("pre_order", "edit");

  const handleUpdate = async (formData: FormData) => {
    return await UpdatePreOrder(entity.id.toString(), formData);
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
        fields={allEditFields}
        isOpen={isOpen}
        jobsConfig={jobsConfig}
        title={`ویرایش پیش سفارش: ${entity.data.client_name}`}
        validationRules={preOrderValidationRules}
        onClose={handleClose}
        onSuccess={handleSuccess}
        onUpdate={handleUpdate}
      />
    </>
  );
}

// Hook for using EditPreOrder component
export function useEditPreOrder() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const EditPreOrderModal = React.useCallback(
    ({ entity, onSuccess }: EditPreOrderProps) => {
      const jobsConfig = getEntityJobConfig("pre_order", "edit");

      const handleUpdate = async (formData: FormData) => {
        return await UpdatePreOrder(entity.id.toString(), formData);
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
          fields={allEditFields}
          isOpen={isOpen}
          jobsConfig={jobsConfig}
          title={`ویرایش پیش سفارش: ${entity.data.client_name}`}
          validationRules={preOrderValidationRules}
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
    EditPreOrderModal,
  };
}
