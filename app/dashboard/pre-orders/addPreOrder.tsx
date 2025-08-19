"use client";

import React from "react";
import { useDisclosure } from "@heroui/react";

import { PlusIcon } from "@/components/icons";
import { PreOrderData, Status } from "./types";
import { AddModal } from "@/components/crud/AddModal";
import { AddFieldConfig, ValidationConfig } from "@/lib/action/crud-types";
import { getEntityJobConfig } from "@/lib/config/entity-jobs";
import { persianValidationRules } from "@/lib/utils/persian-validation";
import { AddPreOrder } from "@/lib/action/pre-order";
import { ClientSelector } from "@/components/ClientSelector";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDraggable,
} from "@heroui/react";
import { PersianInput } from "@/components/ui/PersianInput";
import { PersianTextarea } from "@/components/ui/PersianTextarea";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { ServerActionState } from "@/lib/action/type";
import { normalizeFormData } from "@/lib/utils/persian-validation";
import { useRef, useState, useTransition } from "react";

// Pre-order form fields configuration
const preOrderFields: AddFieldConfig<PreOrderData>[] = [
  {
    key: "description",
    label: "شرح پیش سفارش",
    type: "textarea",
    required: true,
    placeholder: "توضیحات و جزئیات پیش سفارش را وارد کنید",
    validation: persianValidationRules.persianText,
  },
  {
    key: "estimated_amount",
    label: "مبلغ تخمینی (ریال)",
    type: "number",
    required: false,
    placeholder: "مبلغ تخمینی را وارد کنید (اختیاری)",
    validation: persianValidationRules.currency,
  },
];

// Validation configuration for pre-order fields
const preOrderValidationRules: ValidationConfig<PreOrderData> = {
  client_id: (value: string) => {
    if (!value || value.trim() === '') {
      return 'انتخاب مشتری الزامی است';
    }
    return null;
  },
  description: persianValidationRules.persianText,
  estimated_amount: (value: number | string) => {
    if (value === '' || value === null || value === undefined) {
      return null; // Optional field
    }
    return persianValidationRules.currency(value);
  },
  client_name: (value: string) => {
    if (!value || value.trim() === '') {
      return 'نام مشتری الزامی است';
    }
    return null;
  },
  created_at: () => null, // Auto-generated
};

export function AddPreOrderComponent({ onSuccess }: AddPreOrderProps = {}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get pre-order job configuration for add operation
  const jobsConfig = getEntityJobConfig("pre_order", "add");

  const handleAdd = async (formData: FormData) => {
    return await AddPreOrder(formData);
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
        افزودن پیش سفارش
      </Button>

      <AddPreOrderModal
        fields={preOrderFields}
        isOpen={isOpen}
        jobsConfig={jobsConfig}
        title="افزودن پیش سفارش جدید"
        validationRules={preOrderValidationRules}
        onAdd={handleAdd}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}

// Wrapper component for useTableLogic compatibility
export function AddPreOrderButtonComponent() {
  return <AddPreOrderComponent />;
}

// Custom AddPreOrderModal component with ClientSelector
interface AddPreOrderModalProps {
  fields: AddFieldConfig<PreOrderData>[];
  isOpen: boolean;
  jobsConfig: { name: string; url: string }[];
  title: string;
  validationRules: ValidationConfig<PreOrderData>;
  onAdd: (formData: FormData) => Promise<ServerActionState<string | null>>;
  onClose: () => void;
  onSuccess?: () => void;
}

// Props for the main component
interface AddPreOrderProps {
  onSuccess?: () => void;
}

function AddPreOrderModal({
  fields,
  validationRules,
  jobsConfig,
  onAdd,
  isOpen,
  onClose,
  title,
  onSuccess
}: AddPreOrderModalProps) {
  const [pending, startTransition] = useTransition();
  const [jobs, pendingJobs, startJobsTransition] = useJobs("add", jobsConfig);
  const [actionMsg, setActionMsg] = useState<ServerActionState<any> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const validateField = (field: AddFieldConfig<PreOrderData>, value: any): string | null => {
    // Check required validation
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} الزامی است`;
    }

    // Check custom field validation
    if (field.validation) {
      const fieldError = field.validation(value);
      if (fieldError) return fieldError;
    }

    // Check validation rules
    const validationRule = validationRules[field.key];
    if (validationRule) {
      const ruleError = validationRule(value as any);
      if (ruleError) return ruleError;
    }

    return null;
  };

  const validateForm = (formData: FormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Validate client selection
    const clientId = formData.get("client_id");
    if (!clientId || clientId.toString().trim() === '') {
      newErrors["client_id"] = 'انتخاب مشتری الزامی است';
    }

    // Validate other fields
    fields.forEach(field => {
      const fieldName = field.fieldName || field.key.toString();
      const value = formData.get(fieldName);
      const error = validateField(field, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  };

  const onSubmit = (formData: FormData) => {
    // Normalize Persian numbers to English before validation
    const normalizedFormData = normalizeFormData(formData);
    
    // Validate form
    const formErrors = validateForm(normalizedFormData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const msg = await onAdd(normalizedFormData);
      setActionMsg(msg);

      if (msg.success && msg.data) {
        // Start jobs if add was successful
        if (jobsConfig.length > 0) {
          startJobsTransition(msg.data);
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };

  const renderField = (field: AddFieldConfig<PreOrderData>) => {
    const fieldKey = field.key.toString();
    const fieldName = field.fieldName || fieldKey;
    const hasError = !!errors[fieldName];
    const errorMessage = errors[fieldName];

    const commonProps = {
      key: fieldName,
      name: fieldName,
      label: field.label,
      placeholder: field.placeholder || `${field.label} را وارد کنید`,
      isRequired: field.required,
      isInvalid: hasError,
      errorMessage: hasError ? errorMessage : undefined,
      variant: "bordered" as const,
      dir: "rtl",
      className: "text-right"
    };

    switch (field.type) {
      case 'textarea':
        return (
          <PersianTextarea
            {...commonProps}
            minRows={3}
            allowNumbers={true}
            displayPersianNumbers={true}
          />
        );

      case 'number':
        return (
          <PersianInput
            {...commonProps}
            type="text"
            allowNumbers={true}
            displayPersianNumbers={true}
          />
        );

      default: // 'input'
        return (
          <PersianInput
            {...commonProps}
            type="text"
            allowNumbers={true}
            displayPersianNumbers={true}
          />
        );
    }
  };

  return (
    <>
      <Loading pending={pending} />
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size={jobs.length > 0 ? "5xl" : "2xl"}
        onOpenChange={(open) => !open && onClose()}
        scrollBehavior="inside"
        dir="rtl"
        className="rtl"
      >
        <ModalContent>
          <ModalHeader {...moveProps} className="flex flex-col gap-1 text-right">
            {title}
          </ModalHeader>
          <ModalBody className="rtl">
            <section className={`flex ${jobs.length > 0 ? "justify-between" : "justify-center"} gap-6`}>
              <div className="flex-1">
                <form 
                  action={onSubmit} 
                  className="w-full flex flex-col gap-4"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    {/* Client Selector */}
                    <div className="w-full">
                      <ClientSelector
                        label="انتخاب مشتری"
                        placeholder="نام مشتری را تایپ کنید یا انتخاب کنید..."
                        isRequired={true}
                      />
                      {errors["client_id"] && (
                        <div className="text-danger text-sm mt-1 text-right">
                          {errors["client_id"]}
                        </div>
                      )}
                    </div>
                    
                    {/* Other Fields */}
                    {fields.map(renderField)}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={onClose}
                    >
                      لغو
                    </Button>
                    <Button 
                      color="primary" 
                      type="submit"
                      isLoading={pending}
                    >
                      ثبت پیش سفارش
                    </Button>
                  </div>
                </form>

                {actionMsg && (
                  <div
                    className={
                      "text-right px-3 py-2 mt-4 rounded-lg" +
                      ` ${actionMsg.success ? "text-success bg-success-50" : "text-danger bg-danger-50"}`
                    }
                  >
                    {actionMsg.message}
                  </div>
                )}
              </div>

              {/* Jobs section */}
              {jobs.length > 0 && (
                <section className="flex flex-col gap-4 min-w-[300px]">
                  <h3 className="text-lg font-semibold text-right">وضعیت عملیات‌ها</h3>
                  {jobs.map((job, index) => (
                    <JobComponent
                      key={`job-${index}`}
                      initData={jobsConfig[index]}
                      job={job}
                      pending={pendingJobs}
                    />
                  ))}
                </section>
              )}
            </section>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

// Hook for using AddPreOrder component
export function useAddPreOrder() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const AddPreOrderModal = React.useCallback(
    ({ onSuccess }: AddPreOrderProps) => {
      const jobsConfig = getEntityJobConfig("pre_order", "add");

      const handleAdd = async (formData: FormData) => {
        return await AddPreOrder(formData);
      };

      const handleSuccess = () => {
        // Refresh the page or update the table data
        window.location.reload();
        if (onSuccess) {
          onSuccess();
        }
      };

      return (
        <AddPreOrderModal
          fields={preOrderFields}
          isOpen={isOpen}
          jobsConfig={jobsConfig}
          title="افزودن پیش سفارش جدید"
          validationRules={preOrderValidationRules}
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
    AddPreOrderModal,
  };
}
