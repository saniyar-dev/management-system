"use client";

import React, { useRef, useTransition } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDraggable,
  Chip,
  Divider
} from "@heroui/react";

import { ViewComponentProps, ViewFieldConfig } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { FieldRenderer } from "./FieldRenderer";

interface ViewModalProps<T extends RowData, S extends string> extends ViewComponentProps<T, S> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  statusMap?: Record<S, string>;
  statusColorMap?: Record<S, "default" | "primary" | "secondary" | "success" | "warning" | "danger">;
}

export function ViewModal<T extends RowData, S extends string>({
  entity,
  fields,
  jobsConfig,
  isOpen,
  onClose,
  title,
  statusMap,
  statusColorMap,
  onSuccess
}: ViewModalProps<T, S>) {
  const [pending, startTransition] = useTransition();
  const [jobs, pendingJobs, startJobsTransition] = useJobs("view", jobsConfig);

  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  // Start jobs when modal opens
  React.useEffect(() => {
    if (isOpen && jobsConfig.length > 0) {
      startTransition(() => {
        startJobsTransition(entity.id.toString());
      });
    }
  }, [isOpen, entity.id, jobsConfig.length, startJobsTransition]);

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
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={`${field.key.toString()}-${index}`}>
                      <FieldRenderer
                        field={field}
                        value={entity.data[field.key]}
                        statusMap={statusMap}
                        statusColorMap={statusColorMap}
                      />
                      {index < fields.length - 1 && <Divider className="my-2" />}
                    </div>
                  ))}
                  
                  {/* Always show status if not already in fields */}
                  {!fields.some(f => f.key === 'status') && statusMap && (
                    <>
                      <Divider className="my-2" />
                      <div className="flex justify-between items-start py-2">
                        <span className="text-sm font-medium text-default-600 min-w-[120px]">
                          وضعیت:
                        </span>
                        <div className="text-sm text-default-900 text-right flex-1 mr-4">
                          <Chip
                            className="capitalize"
                            color={statusColorMap?.[entity.status] || "default"}
                            size="sm"
                            variant="flat"
                          >
                            {statusMap[entity.status] || entity.status}
                          </Chip>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
          <ModalFooter className="flex justify-start">
            <Button color="primary" onPress={onClose}>
              بستن
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}