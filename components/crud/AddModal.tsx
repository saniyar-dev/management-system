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
  SelectItem,
  Tab,
  Tabs
} from "@heroui/react";

import { AddComponentProps, AddFieldConfig } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { ServerActionState } from "@/lib/action/type";

interface AddModalProps<T extends RowData, S extends string> extends AddComponentProps<T, S> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tabs?: Array<{
    key: string;
    title: string;
    fields: AddFieldConfig<T>[];
  }>;
}

export function AddModal<T extends RowData, S extends string>({
  fields,
  validationRules,
  jobsConfig,
  onAdd,
  isOpen,
  onClose,
  title,
  tabs,
  onSuccess
}: AddModalProps<T, S>) {
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

  const validateField = (field: AddFieldConfig<T>, value: any): string | null => {
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

  const validateForm = (formData: FormData, fieldsToValidate: AddFieldConfig<T>[]): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    fieldsToValidate.forEach(field => {
      const fieldName = field.fieldName || field.key.toString();
      const value = formData.get(fieldName);
      const error = validateField(field, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  };

  const onSubmit = (formData: FormData, fieldsToValidate: AddFieldConfig<T>[]) => {
    // Validate form
    const formErrors = validateForm(formData, fieldsToValidate);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const msg = await onAdd(formData);
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

  const renderField = (field: AddFieldConfig<T>) => {
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
          <Textarea
            {...commonProps}
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
            classNames={{
              input: "text-right",
              inputWrapper: "text-right"
            }}
          />
        );
    }
  };

  const renderForm = (fieldsToRender: AddFieldConfig<T>[]) => (
    <form 
      action={(formData) => onSubmit(formData, fieldsToRender)} 
      className="w-full flex flex-col gap-4"
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {fieldsToRender.map(renderField)}
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
          ثبت
        </Button>
      </div>
    </form>
  );

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
                {tabs ? (
                  <Tabs
                    fullWidth
                    aria-label="Add Form Tabs"
                    placement="top"
                    size="md"
                    className="rtl"
                  >
                    {tabs.map((tab) => (
                      <Tab key={tab.key} title={tab.title}>
                        {renderForm(tab.fields)}
                      </Tab>
                    ))}
                  </Tabs>
                ) : (
                  renderForm(fields)
                )}

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