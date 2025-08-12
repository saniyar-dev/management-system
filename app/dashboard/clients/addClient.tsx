"use client";

import React, { useState, useTransition } from "react";
import { Tab, Tabs } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  Button,
  useDisclosure,
  useDraggable,
  Input,
} from "@heroui/react";

import JobComponent from "@/components/jobs";
import { PlusIcon } from "@/components/icons";
import { AddClient } from "@/lib/action/client";
import { ServerActionState } from "@/lib/action/type";
import Loading from "@/components/loading";
import { useJobs } from "@/lib/hooks";

const jobsToProceed: { url: string; name: string }[] = [
  {
    name: "ارسال به کارتابل ",
    url: "https://google.com",
  },
  {
    name: "ارسال پیام به مشتری",
    url: "https://google.com",
  },
];

export function AddClientComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pending, startTransition] = useTransition();
  const [actionMsg, setActionMsg] = useState<ServerActionState<any> | null>(
    null,
  );
  const [jobs, pendingJobs, startJobsTransition] = useJobs(
    "client",
    jobsToProceed,
  );

  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const msg = await AddClient(formData);

      setActionMsg(msg);

      if (msg.success && msg.data) {
        startJobsTransition(msg.data);
      }
    });
  };

  return (
    <>
      <Loading pending={pending} />
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        ایجاد مشتری جدید
      </Button>
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size={`${jobs.length > 0 ? "5xl" : "2xl"}`}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps} className="flex flex-col gap-1">
                ایجاد مشتری جدید
              </ModalHeader>
              <section
                className={`flex justify-${jobs.length > 0 ? "between" : "center"} p-6`}
              >
                <div>
                  <Tabs
                    fullWidth
                    aria-label="Tabs Form"
                    placement="top"
                    size="md"
                  >
                    <Tab key="personal" title="حقیقی">
                      <form
                        action={onSubmit}
                        className="w-xl flex flex-col gap-6"
                      >
                        <div className="flex flex-col items-center justify-center gap-4">
                          <Input
                            isRequired
                            id="name"
                            label="نام و نام خاوادگی"
                            name="name"
                            placeholder="نام مشتری"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="phone"
                            label="شماره موبایل"
                            name="phone"
                            placeholder="09900790244"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="ssn"
                            label="کد ملی"
                            name="ssn"
                            placeholder="0312829804"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="address"
                            label="آدرس"
                            name="address"
                            placeholder="هرمزگان، بندر عباس، خیابان مریم، پلاک ۱۰۲"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="postal_code"
                            label="کد پستی"
                            name="postal_code"
                            placeholder="448891102"
                            variant="bordered"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            color="danger"
                            variant="flat"
                            onPress={onClose}
                          >
                            بستن
                          </Button>
                          <Button color="primary" type="submit">
                            ثبت
                          </Button>
                        </div>
                      </form>
                    </Tab>
                    <Tab key="company" title="حقوقی">
                      <form
                        action={onSubmit}
                        className="w-xl flex flex-col gap-6"
                      >
                        <div className="flex flex-col items-center justify-center gap-4">
                          <Input
                            isRequired
                            id="name"
                            label="نام و نام خاوادگی مدیر عامل/نماینده"
                            name="name"
                            placeholder="نام مشتری"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="phone"
                            label="شماره موبایل مدیر عامل/نماینده"
                            name="phone"
                            placeholder="09900790244"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="ssn"
                            label="کد ملی مدیر عامل/نماینده"
                            name="ssn"
                            placeholder="0312829804"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="company_name"
                            label="نام کارخانه/کارگاه/شرکت"
                            name="company_name"
                            placeholder="بتن ریزی سیرجان"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="company_ssn"
                            label="شناسه ملی کارخانه/کارگاه/شرکت"
                            name="company_ssn"
                            placeholder="شناسه ملی بتن ریزی سیرجان"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="company_address"
                            label="آدرس کارخانه/کارگاه/شرکت"
                            name="company_address"
                            placeholder="هرمزگان، بندر عباس،جاده قدیم، قطعه ۱۰۵"
                            variant="bordered"
                          />
                          <Input
                            isRequired
                            id="company_postal_code"
                            label="کد پستی کارخانه/کارگاه/شرکت"
                            name="company_postal_code"
                            placeholder="448891102"
                            variant="bordered"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            color="danger"
                            variant="flat"
                            onPress={onClose}
                          >
                            بستن
                          </Button>
                          <Button color="primary" type="submit">
                            ثبت
                          </Button>
                        </div>
                      </form>
                    </Tab>
                  </Tabs>
                  {actionMsg && (
                    <div
                      className={
                        "text-right px-3 py-1" +
                        ` ${actionMsg.success ? "text-success" : "text-danger"}`
                      }
                    >
                      {actionMsg.message}
                    </div>
                  )}
                </div>
                <section className="flex flex-col gap-4">
                  {jobs.length > 0 &&
                    jobs.map((job, index) => {
                      return (
                        <JobComponent
                          key={index}
                          initData={jobsToProceed[index]}
                          job={job}
                          pending={pendingJobs}
                        />
                      );
                    })}
                </section>
              </section>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
