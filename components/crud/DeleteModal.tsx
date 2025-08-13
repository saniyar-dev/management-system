"use client";

import React, { useRef, useState, useTransition } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  useDraggable,
  Chip,
  Divider
} from "@heroui/react";

import { DeleteComponentProps } from "@/lib/action/crud-types";
import { RowData } from "@/lib/types";
import { useJobs } from "@/lib/hooks";
import JobComponent from "@/components/jobs";
import Loading from "@/components/loading";
import { ServerActionState } from "@/lib/action/type";

interface DeleteModalProps<T extends RowData, S extends string> extends DeleteComponentProps<T, S> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityDisplayName: string;
  statusMap?: Record<S, string>;
  statusColorMap?: Record<S, "default" | "primary" | "secondary" | "success" | "warning" | "danger">;
  displayFields?: Array<{
    key: keyof T;
    label: string;
    formatter?: (value: any) => string;
  }>;
}

export function DeleteModal<T extends RowData, S extends string>({
  entity,
  onDelete,
  dependencyCheck,
  jobsConfig,
  isOpen,
  onClose,
  title,
  entityDisplayName,
  statusMap,
  statusColorMap,
  displayFields = [],
  onSuccess
}: DeleteModalProps<T, S>) {
  const [pending, startTransition] = useTransition();
  const [jobs, pendingJobs, startJobsTransition] = useJobs("delete", jobsConfig);
  const [actionMsg, setActionMsg] = useState<ServerActionState<any> | null>(null);
  const [dependencyError, setDependencyError] = useState<string | null>(null);
  const [checkingDependencies, setCheckingDependencies] = useState(false);

  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  // Check dependencies when modal opens
  React.useEffect(() => {
    if (isOpen && dependencyCheck) {
      setCheckingDependencies(true);
      setDependencyError(null);
      
      dependencyCheck(entity.id.toString()).then((hasDependencies) => {
        if (hasDependencies) {
          setDependencyError(
            `این ${entityDisplayName} دارای رکوردهای وابسته است و قابل حذف نیست. ابتدا رکوردهای مرتبط را حذف کنید.`
          );
        }
        setCheckingDependencies(false);
      }).catch(() => {
        setDependencyError('خطا در بررسی وابستگی‌ها');
        setCheckingDependencies(false);
      });
    }
  }, [isOpen, dependencyCheck, entity.id, entityDisplayName]);

  const handleDelete = () => {
    if (dependencyError) return;

    startTransition(async () => {
      const msg = await onDelete(entity.id.toString());
      setActionMsg(msg);

      if (msg.success) {
        // Start jobs if deletion was successful
        if (jobsConfig.length > 0) {
          startJobsTransition(entity.id.toString());
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    });
  };

  const getDisplayValue = (field: typeof displayFields[0], value: any) => {
    if (field.formatter) {
      return field.formatter(value);
    }
    return value || '-';
  };

  return (
    <>
      <Loading pending={pending || checkingDependencies} />
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
                <div className="space-y-4">
                  {/* Warning message */}
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                    <p className="text-warning-800 text-sm text-right">
                      آیا از حذف این {entityDisplayName} اطمینان دارید؟ این عمل قابل بازگشت نیست.
                    </p>
                  </div>

                  {/* Entity details */}
                  <div className="bg-default-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-right">جزئیات {entityDisplayName}:</h4>
                    
                    {/* Display specified fields */}
                    {displayFields.map((field, index) => (
                      <div key={`${field.key.toString()}-${index}`}>
                        <div className="flex justify-between items-start py-2">
                          <span className="text-sm font-medium text-default-600 min-w-[120px]">
                            {field.label}:
                          </span>
                          <div className="text-sm text-default-900 text-right flex-1 mr-4">
                            {getDisplayValue(field, entity.data[field.key])}
                          </div>
                        </div>
                        {index < displayFields.length - 1 && <Divider className="my-1" />}
                      </div>
                    ))}

                    {/* Always show status */}
                    {statusMap && (
                      <>
                        {displayFields.length > 0 && <Divider className="my-1" />}
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

                  {/* Dependency error */}
                  {dependencyError && (
                    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                      <p className="text-danger-800 text-sm text-right">
                        {dependencyError}
                      </p>
                    </div>
                  )}

                  {/* Action message */}
                  {actionMsg && (
                    <div
                      className={
                        "text-right px-3 py-2 rounded-lg" +
                        ` ${actionMsg.success ? "text-success bg-success-50 border border-success-200" : "text-danger bg-danger-50 border border-danger-200"}`
                      }
                    >
                      {actionMsg.message}
                    </div>
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
            <Button color="default" variant="flat" onPress={onClose}>
              لغو
            </Button>
            <Button 
              color="danger" 
              onPress={handleDelete}
              isLoading={pending}
              isDisabled={!!dependencyError || checkingDependencies}
            >
              {checkingDependencies ? 'بررسی...' : 'حذف'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}