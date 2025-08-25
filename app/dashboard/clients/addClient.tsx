"use client";

import React from "react";
import { useDisclosure, Button } from "@heroui/react";

import { PlusIcon } from "@/components/icons";
import { ClientData, Status } from "./types";
import { AddModal } from "@/components/crud/AddModal";
import { AddFieldConfig, ValidationConfig } from "@/lib/action/crud-types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { persianValidationRules } from "@/lib/utils/persian-validation";
import { AddClient } from "@/lib/action/client";

// Personal client fields
const personalClientFields: AddFieldConfig<ClientData>[] = [
  {
    key: "name",
    label: "نام و نام خانوادگی",
    type: "input",
    required: true,
    placeholder: "نام مشتری را وارد کنید",
    validation: persianValidationRules.persianName,
  },
  {
    key: "phone",
    label: "شماره موبایل",
    type: "input",
    required: true,
    placeholder: "۰۹۱۲۳۴۵۶۷۸۹",
    validation: persianValidationRules.persianPhone,
  },
  {
    key: "ssn",
    label: "کد ملی",
    type: "input",
    required: true,
    placeholder: "۰۳۱۲۸۲۹۸۰۴",
    validation: persianValidationRules.persianSSN,
  },
  {
    key: "county",
    label: "استان",
    type: "select",
    required: true,
    placeholder: "هرمزگان",
    options: [{id: "1", name: "هرمزگان", label: "هرمزگان"}],
    validation: persianValidationRules.persianText,
  },
  {
    key: "town",
    label: "شهرستان / بخش",
    type: "select",
    required: true,
    options: [{id: "1", name: "بندرعباس", label: "بندرعباس"}],
    placeholder: "بندرعباس",
    validation: persianValidationRules.persianText,
  },
  {
    key: "address",
    label: "جزئیات آدرس",
    type: "textarea",
    required: true,
    placeholder: "خیابان مریم، پلاک ۱۰۲",
    validation: persianValidationRules.persianText,
  },
  {
    key: "postal_code",
    label: "کد پستی",
    type: "input",
    required: true,
    placeholder: "۴۴۸۸۹۱۱۰۲",
    validation: persianValidationRules.persianPostalCode,
  },
];

// Company client fields - using different field names for form but same validation
const companyClientFields: AddFieldConfig<ClientData>[] = [
  {
    key: "name",
    fieldName: "name",
    label: "نام و نام خانوادگی مدیرعامل/نماینده",
    type: "input",
    required: true,
    placeholder: "نام مدیرعامل را وارد کنید",
    validation: persianValidationRules.persianName,
  },
  {
    key: "phone",
    fieldName: "phone",
    label: "شماره موبایل مدیرعامل/نماینده",
    type: "input",
    required: true,
    placeholder: "۰۹۱۲۳۴۵۶۷۸۹",
    validation: persianValidationRules.persianPhone,
  },
  {
    key: "ssn",
    fieldName: "ssn",
    label: "کد ملی مدیرعامل/نماینده",
    type: "input",
    required: true,
    placeholder: "۰۳۱۲۸۲۹۸۰۴",
    validation: persianValidationRules.persianSSN,
  },
  {
    key: "name",
    fieldName: "company_name",
    label: "نام کارخانه/کارگاه/شرکت",
    type: "input",
    required: true,
    placeholder: "بتن ریزی سیرجان",
    validation: persianValidationRules.persianText,
  },
  {
    key: "ssn",
    fieldName: "company_ssn",
    label: "شناسه ملی کارخانه/کارگاه/شرکت",
    type: "input",
    required: true,
    placeholder: "شناسه ملی شرکت",
    validation: persianValidationRules.persianSSN,
  },
  {
    key: "address",
    fieldName: "company_address",
    label: "آدرس کارخانه/کارگاه/شرکت",
    type: "textarea",
    required: true,
    placeholder: "هرمزگان، بندر عباس، جاده قدیم، قطعه ۱۰۵",
    validation: persianValidationRules.persianText,
  },
  {
    key: "postal_code",
    fieldName: "company_postal_code",
    label: "کد پستی کارخانه/کارگاه/شرکت",
    type: "input",
    required: true,
    placeholder: "۴۴۸۸۹۱۱۰۲",
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

// Tab configuration for personal and company clients
const clientTabs = [
  {
    key: "personal",
    title: "حقیقی",
    fields: personalClientFields,
  },
  {
    key: "company", 
    title: "حقوقی",
    fields: companyClientFields,
  },
];

interface AddClientProps {
  onSuccess?: () => void;
}

export function AddClientComponent({ onSuccess }: AddClientProps = {}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get client job configuration for add operation
  const jobsConfig = getEntityJobConfig("client", "add");

  const handleAdd = async (formData: FormData) => {
    return await AddClient(formData);
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
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        ایجاد مشتری جدید
      </Button>

{
  isOpen &&
      <AddModal
        fields={personalClientFields} // Default fields (not used when tabs are provided)
        tabs={clientTabs}
        isOpen={isOpen}
        jobsConfig={jobsConfig}
        title="ایجاد مشتری جدید"
        validationRules={clientValidationRules}
        onAdd={handleAdd}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
}
    </>
  );
}

// Wrapper component for useTableLogic compatibility
export function AddClientButtonComponent() {
  return <AddClientComponent />;
}

// Hook for using AddClient component
export function useAddClient() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const AddClientModal = React.useCallback(
    ({ onSuccess }: AddClientProps) => {
      const jobsConfig = getEntityJobConfig("client", "add");

      const handleAdd = async (formData: FormData) => {
        return await AddClient(formData);
      };

      const handleSuccess = () => {
        // Refresh the page or update the table data
        window.location.reload();
        if (onSuccess) {
          onSuccess();
        }
      };

      return (
        <AddModal
          fields={personalClientFields}
          tabs={clientTabs}
          isOpen={isOpen}
          jobsConfig={jobsConfig}
          title="ایجاد مشتری جدید"
          validationRules={clientValidationRules}
          onAdd={handleAdd}
          onClose={onClose}
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
    AddClientModal,
  };
}
