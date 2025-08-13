"use client";

import React, { useRef, useState, useTransition } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDraggable,
  Input,
  Textarea,
  Select,
  SelectItem
} from "@heroui/react";

import { EditComponentProps, EditFieldConfig } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { ServerActionState } from "@/lib/action/type";

interface EditModalProps<T extends RowData, S extends string> extends EditComponentProps<T, S> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function EditModal<T extends RowData, S extends string>({
  entity,
  fields,
  validationRules,
  jobsConfig,
  onUpdate,
  isOpen,
  onClose,
  title,
  onSuccess
}: EditModalProps<T, S>) {
  const [pending, startTransition] = useTransition();
  const [jobs, pendingJobs, startJobsTransition] = useJobs("edit", jobsConfig);
  const [actionMsg, setActionMsg] = useState<ServerActionState<any> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const validateField = (field: EditFieldConfig<T>, value: any): string | null => {
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
    if (validationRules[field.key]) {
      const ruleError = validationRules[field.key]!(value);
      if (ruleError) return ruleError;
    }

    return null;
  };

  const validateForm = (formData: FormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData.get(field.key.toString());
      const error = validateField(field, value);
      if (error) {
        newErrors[field.key.toString()] = error;
      }
    });

    return newErrors;
  };

  const onSubmit = (formData: FormData) => {
    // Validate form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const msg = await onUpdate(formData);
      setActionMsg(msg);

      if (msg.success && msg.data) {
        // Start jobs if update was successful
        if (jobsConfig.length > 0) {
          startJobsTransition(entity.id.toString());
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };

  const renderField = (field: EditFieldConfig<T>) => {
    const fieldKey = field.key.toString();
    const currentValue = entity.data[field.key];
    const hasError = !!errors[fieldKey];
    const errorMessage = errors[fieldKey];

    const commonProps = {
      key: fieldKey,
      name: fieldKey,
      label: field.label,
      defaultValue: currentValue?.toString() || '',
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
          <Textarea
            {...commonProps}
            placeholder={`${field.label} را وارد کنید`}
            minRows={3}
            classNames={{
              input: "text-right",
              inputWrapper: "text-right"
            }}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            placeholder={`${field.label} را انتخاب کنید`}
            classNames={{
              trigger: "text-right",
              value: "text-right"
            }}
          >
            {field.options?.map((option) => (
              <SelectItem key={option.value} className="text-right">
                {option.label}
              </SelectItem>
            )) || []}
          </Select>
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder={`${field.label} را وارد کنید`}
            classNames={{
              input: "text-right",
              inputWrapper: "text-right"
            }}
          />
        );

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            placeholder={`${field.label} را انتخاب کنید`}
            classNames={{
              input: "text-right",
              inputWrapper: "text-right"
            }}
          />
        );

      default: // 'input'
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={`${field.label} را وارد کنید`}
            classNames={{
              input: "text-right",
              inputWrapper: "text-right"
            }}
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
                <form action={onSubmit} className="w-full flex flex-col gap-4">
                  <div className="flex flex-col items-center justify-center gap-4">
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
                      ذخیره تغییرات
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