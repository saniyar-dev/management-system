"use client";

import React, {
  useRef,
  useState,
  useTransition,
  useEffect,
  useCallback,
} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDraggable,
  Select,
  SelectItem,
} from "@heroui/react";

import { PersianInput } from "@/components/ui/PersianInput";
import { PersianTextarea } from "@/components/ui/PersianTextarea";
import { EditComponentProps, EditFieldConfig } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { ServerActionState } from "@/lib/action/type";
import {
  normalizeFormData,
  convertEnglishToPersian,
} from "@/lib/utils/persian-validation";

interface EditModalProps<T extends RowData, S extends string>
  extends EditComponentProps<T, S> {
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
  onSuccess,
}: EditModalProps<T, S>) {
  const [pending, startTransition] = useTransition();
  const [jobs, pendingJobs, startJobsTransition] = useJobs("edit", jobsConfig);
  const [actionMsg, setActionMsg] = useState<ServerActionState<any> | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    Object.keys(formData).forEach((key) => {
      const field = fields.find((f) => f.key.toString() === key);

      if (field) {
        const error = validateField(field, formData[key]);

        if (error) {
          setErrors((prev) => ({ ...prev, [key]: error }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };

            delete newErrors[key];

            return newErrors;
          });
        }
      }
    });
  }, [formData]);

  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const validateField = useCallback(
    (field: EditFieldConfig<T>, value: any): string | null => {
      // Check required validation
      if (field.required && (!value || value.toString().trim() === "")) {
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
    },
    [validationRules],
  );

  const onSubmit = useCallback(
    (formData: FormData) => {
      // Normalize Persian numbers to English before validation
      const normalizedFormData = normalizeFormData(formData);

      if (Object.keys(errors).length > 0) return;

      startTransition(async () => {
        const msg = await onUpdate(normalizedFormData);

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
    },
    [onUpdate, jobsConfig, onSuccess, startJobsTransition],
  ); // Now depends on a stable validateForm

  const renderField = useCallback(
    (field: EditFieldConfig<T>) => {
      const fieldKey = field.key.toString();
      const currentValue = entity.data[field.key];
      const hasError = !!errors[fieldKey];
      const errorMessage = errors[fieldKey];

      // Convert current value to Persian numbers for display
      const displayValue = currentValue
        ? convertEnglishToPersian(currentValue.toString())
        : "";

      const commonProps = {
        name: fieldKey,
        label: field.label,
        defaultValue: displayValue,
        isRequired: field.required,
        isInvalid: hasError,
        errorMessage: hasError ? errorMessage : undefined,
        variant: "bordered" as const,
        dir: "rtl",
        className: "text-right",
        value: formData[fieldKey],
        onValueChange: (value: string) => {
          setFormData((prev) => ({ ...prev, [fieldKey]: value }));
        },
      };

      switch (field.type) {
        case "textarea":
          return (
            <PersianTextarea
              key={fieldKey}
              {...commonProps}
              allowNumbers={true}
              displayPersianNumbers={true}
              minRows={3}
              placeholder={`${field.label} را وارد کنید`}
            />
          );

        case "select":
          return (
            <Select
              key={fieldKey}
              {...commonProps}
              classNames={{
                trigger: "text-right",
                value: "text-right",
              }}
              placeholder={`${field.label} را انتخاب کنید`}
            >
              {field.options?.map((option) => (
                <SelectItem key={option.value} className="text-right">
                  {option.label}
                </SelectItem>
              )) || []}
            </Select>
          );

        case "number":
          return (
            <PersianInput
              key={fieldKey}
              {...commonProps}
              allowNumbers={true}
              displayPersianNumbers={true}
              placeholder={`${field.label} را وارد کنید`}
              type="text"
            />
          );

        case "date":
          return (
            <PersianInput
              key={fieldKey}
              {...commonProps}
              allowNumbers={false}
              displayPersianNumbers={false}
              placeholder={`${field.label} را انتخاب کنید`}
              type="date"
            />
          );

        default: // 'input'
          return (
            <PersianInput
              key={fieldKey}
              {...commonProps}
              allowNumbers={true}
              displayPersianNumbers={true}
              placeholder={`${field.label} را وارد کنید`}
              type="text"
            />
          );
      }
    },
    [errors],
  );

  return (
    <>
      <Loading pending={pending} />
      <Modal
        ref={targetRef}
        className="rtl"
        dir="rtl"
        isOpen={isOpen}
        scrollBehavior="inside"
        size={jobs.length > 0 ? "5xl" : "2xl"}
        onOpenChange={(open) => !open && onClose()}
      >
        <ModalContent>
          <ModalHeader
            {...moveProps}
            className="flex flex-col gap-1 text-right"
          >
            {title}
          </ModalHeader>
          <ModalBody className="rtl">
            <section
              className={`flex ${jobs.length > 0 ? "justify-between" : "justify-center"} gap-6 py-4`}
            >
              <div className="flex-1">
                <form action={onSubmit} className="w-full flex flex-col gap-4">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {fields.map(renderField)}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button color="danger" variant="flat" onPress={onClose}>
                      لغو
                    </Button>
                    <Button color="primary" isLoading={pending} type="submit">
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
                  <h3 className="text-lg font-semibold text-right">
                    وضعیت عملیات‌ها
                  </h3>
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
