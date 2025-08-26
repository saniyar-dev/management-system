"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDraggable,
  Tab,
  Tabs,
} from "@heroui/react";

import { PersianSelector } from "../ui/PersianSelector";

import { PersianInput } from "@/components/ui/PersianInput";
import { PersianTextarea } from "@/components/ui/PersianTextarea";
import { AddComponentProps, AddFieldConfig } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { ServerActionState } from "@/lib/action/type";
import { normalizeFormData } from "@/lib/utils/persian-validation";

interface AddModalProps<T extends RowData, S extends string>
  extends AddComponentProps<T, S> {
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
  onSuccess,
}: AddModalProps<T, S>) {
  const [pending, startTransition] = useTransition();
  const [jobs, pendingJobs, startJobsTransition] = useJobs("add", jobsConfig);
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
    (field: AddFieldConfig<T>, value: any): string | null => {
      // Check required validation
      if (field.required && (!value || value.toString().trim() === "")) {
        return `${field.label} الزامی است`;
      }
      if (field.validation) {
        const fieldError = field.validation(value);

        if (fieldError) return fieldError;
      }
      if (validationRules[field.key]) {
        const ruleError = validationRules[field.key]!(value);

        if (ruleError) return ruleError;
      }

      return null;
    },
    [validationRules],
  );

  // STABILIZE STEP 2: Wrap the main onSubmit logic in useCallback
  const onSubmit = useCallback(
    (formData: FormData) => {
      const normalizedFormData = normalizeFormData(formData);

      if (Object.keys(errors).length > 0) return;

      startTransition(async () => {
        const msg = await onAdd(normalizedFormData);

        setActionMsg(msg);
        if (msg.success && msg.data) {
          if (jobsConfig.length > 0) {
            startJobsTransition(msg.data);
          }
          if (onSuccess) {
            onSuccess();
          }
        }
      });
    },
    [onAdd, jobsConfig, onSuccess, startJobsTransition],
  ); // Now depends on a stable validateForm

  // STABILIZE STEP 3: Wrap the renderField function in useCallback
  // It depends on `errors`, so it will only be recreated when errors change.
  const renderField = useCallback(
    (field: AddFieldConfig<T>) => {
      const fieldKey = field.key.toString();
      const fieldName = field.fieldName || fieldKey;
      const hasError = !!errors[fieldName];
      const errorMessage = errors[fieldName];

      // ... commonProps definition ...
      // ... switch case for rendering fields ...

      // For brevity, the inner switch-case logic is omitted as it is unchanged.
      // Just make sure it's inside this useCallback block.
      const commonProps = {
        name: fieldName,
        label: field.label,
        placeholder: field.placeholder || `${field.label} را وارد کنید`,
        isRequired: field.required,
        isInvalid: hasError,
        errorMessage: hasError ? errorMessage : undefined,
        variant: "bordered" as const,
        dir: "rtl",
        className: "text-right",
        value: formData[fieldName],
        onValueChange: (value: string) => {
          setFormData((prev) => ({ ...prev, [fieldName]: value }));
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
            />
          );
        case "select":
          return (
            <PersianSelector
              key={fieldKey}
              {...commonProps}
              options={field.options!(formData)}
              onSelectionChange={(selectedOption) => {
                setFormData((prev) => ({
                  ...prev,
                  [fieldName]: selectedOption?.name,
                }));
              }}
            />
          );
        case "number":
          return (
            <PersianInput
              key={fieldKey}
              {...commonProps}
              allowNumbers={true}
              displayPersianNumbers={true}
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
        default:
          return (
            <PersianInput
              key={fieldKey}
              {...commonProps}
              allowNumbers={true}
              displayPersianNumbers={true}
              type="text"
            />
          );
      }
    },
    [errors, formData],
  ); // CRITICAL: This now only changes when errors change.

  // STABILIZE STEP 4: The renderForm useCallback now has stable dependencies
  const renderForm = useCallback(
    (fieldsToRender: AddFieldConfig<T>[]) => {
      const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        onSubmit(formData);
      };

      return (
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleFormSubmit}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            {fieldsToRender.map(renderField)}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button color="danger" variant="flat" onPress={onClose}>
              لغو
            </Button>
            <Button color="primary" isLoading={pending} type="submit">
              ثبت
            </Button>
          </div>
        </form>
      );
    },
    [pending, onClose, renderField, onSubmit],
  ); // These are now stable!

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
              className={`flex ${jobs.length > 0 ? "justify-between" : "justify-center"} gap-6`}
            >
              <div className="flex-1">
                {tabs ? (
                  <Tabs
                    fullWidth
                    aria-label="Add Form Tabs"
                    className="rtl"
                    placement="top"
                    size="md"
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
