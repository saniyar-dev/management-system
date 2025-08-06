"use client";

import React, { useEffect, useState, useTransition } from "react";
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

import { ClientJob } from "./types";

import JobsComponent from "@/components/jobs";
import { PlusIcon } from "@/components/icons";
import { AddClient, GetClientJobs } from "@/lib/action/client";
import { ServerActionState } from "@/lib/action/type";
import Loading from "@/components/loading";

const jobs: ClientJob[] = [
  // {
  //   id: 1,
  //   name: "ارسال به کارتابل ",
  //   client_id: 11,
  //   status: "waiting",
  //   url: "https://google.com",
  // },
];

export function AddClientComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pending, startTransition] = useTransition();
  const [actionMsg, setActionMsg] = useState<ServerActionState<any> | null>(
    null,
  );
  const [clientID, setClientID] = useState<number | null>(null);

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

      if (msg.success) {
        setClientID(msg.data);
      }
    });
  };

  useEffect(() => {
    if (!clientID) {
      return;
    }

    startTransition(async () => {
      const msg = await GetClientJobs(clientID);

      setActionMsg(msg);
    });
  }, [clientID]);

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
                {jobs.length > 0 && <JobsComponent clientJobs={jobs} />}
              </section>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
