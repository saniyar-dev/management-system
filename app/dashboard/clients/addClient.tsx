"use client";

import React from "react";
import { Card, CardFooter, Image, Tab, Tabs } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  useDraggable,
  Input,
} from "@heroui/react";
import { PlusIcon, MailIcon, LockIcon } from "@/components/icons";
import JobsComponent from "./jobs";

export function AddClientComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const submit = (formData: FormData) => {
    const phone = formData.get("phone");
    const name = formData.get("name");

    console.log(phone, name);
  };

  return (
    <>
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        ایجاد مشتری جدید
      </Button>
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="5xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps} className="flex flex-col gap-1">
                ایجاد مشتری جدید
              </ModalHeader>
              <section className="flex justify-between p-6">
                <Tabs
                  fullWidth
                  aria-label="Tabs Form"
                  size="md"
                  placement="top"
                >
                  <Tab key="personal" title="حقیقی">
                    <form action={submit} className="w-xl flex flex-col gap-6">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Input
                          isRequired
                          label="نام و نام خاوادگی"
                          id="name"
                          name="name"
                          placeholder="نام مشتری"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="شماره موبایل"
                          id="phone"
                          name="phone"
                          placeholder="09900790244"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="کد ملی"
                          id="ssn"
                          name="ssn"
                          placeholder="0312829804"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="آدرس"
                          id="address"
                          name="address"
                          placeholder="هرمزگان، بندر عباس، خیابان مریم، پلاک ۱۰۲"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="کد پستی"
                          id="postal_code"
                          name="postal_code"
                          placeholder="448891102"
                          variant="bordered"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button color="danger" variant="flat" onPress={onClose}>
                          بستن
                        </Button>
                        <Button color="primary" type="submit">
                          ثبت
                        </Button>
                      </div>
                    </form>
                  </Tab>
                  <Tab key="company" title="حقوقی">
                    <form action={submit} className="w-xl flex flex-col gap-6">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Input
                          isRequired
                          label="نام و نام خاوادگی مدیر عامل/نماینده"
                          id="name"
                          name="name"
                          placeholder="نام مشتری"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="شماره موبایل مدیر عامل/نماینده"
                          id="phone"
                          name="phone"
                          placeholder="09900790244"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="کد ملی مدیر عامل/نماینده"
                          id="ssn"
                          name="ssn"
                          placeholder="0312829804"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="نام کارخانه/کارگاه/شرکت"
                          id="company_name"
                          name="company_name"
                          placeholder="بتن ریزی سیرجان"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="شناسه ملی کارخانه/کارگاه/شرکت"
                          id="company_name"
                          name="company_name"
                          placeholder="شناسه ملی بتن ریزی سیرجان"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="آدرس کارخانه/کارگاه/شرکت"
                          id="address"
                          name="address"
                          placeholder="هرمزگان، بندر عباس،جاده قدیم، قطعه ۱۰۵"
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          label="کد پستی کارخانه/کارگاه/شرکت"
                          id="postal_code"
                          name="postal_code"
                          placeholder="448891102"
                          variant="bordered"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button color="danger" variant="flat" onPress={onClose}>
                          بستن
                        </Button>
                        <Button color="primary" type="submit">
                          ثبت
                        </Button>
                      </div>
                    </form>
                  </Tab>
                </Tabs>
                <JobsComponent />
              </section>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
